const express = require('express');
const Web3 = require('web3');
const urlModule = require('url');
const Tx = require('ethereumjs-tx');
const config = require('./config.js');
var Raven = require('raven');
var log4js = require('log4js');

if (typeof web3 !== 'undefined') {
  console.log('instance already exists');
  web3 = new Web3(web3.currentProvider);
} else {
  console.log('new instance');
    // 这里设置的是 rinkbey 测试网络
  web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/" + config.key));
}

const ContractABI =  [
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "Orderlist",
    "outputs": [
      {
        "name": "uin",
        "type": "uint48"
      },
      {
        "name": "name",
        "type": "string"
      },
      {
        "name": "ctime",
        "type": "uint48"
      },
      {
        "name": "phone",
        "type": "uint48"
      },
      {
        "name": "price",
        "type": "uint48"
      },
      {
        "name": "lease_time",
        "type": "uint48"
      },
      {
        "name": "sign",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "isOwner",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getAddress",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "order_id",
        "type": "uint48"
      },
      {
        "name": "user_name",
        "type": "string"
      },
      {
        "name": "ctime",
        "type": "uint48"
      },
      {
        "name": "phone",
        "type": "uint48"
      },
      {
        "name": "price",
        "type": "uint48"
      },
      {
        "name": "lease_time",
        "type": "uint48"
      },
      {
        "name": "sign",
        "type": "string"
      }
    ],
    "name": "writeOrder",
    "outputs": [
      {
        "name": "rusult",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "order_id",
        "type": "uint48"
      }
    ],
    "name": "getIndex",
    "outputs": [
      {
        "name": "index",
        "type": "uint48"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "order_id",
        "type": "uint48"
      }
    ],
    "name": "readOrder",
    "outputs": [
      {
        "name": "",
        "type": "uint48"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "uint48"
      },
      {
        "name": "",
        "type": "uint48"
      },
      {
        "name": "",
        "type": "uint48"
      },
      {
        "name": "",
        "type": "uint48"
      },
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

var ContractInstance =  web3.eth.contract(ContractABI).at(config.ContractAddress);
var numbernon= web3.eth.getTransactionCount(config.account, 'latest');
numbernon--;
const app = express();
// 设置跨域访问
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, accept, origin, content-type')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', ' 3.2.1')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next();
})
// 写入以太坊
app.get('/writeToEthereum',function(req, res){
  console.log('Start asking for data');
  // 处理参数
  let params = urlModule.parse(req.url, true).query;//解析数据 获得Json对象
  let order_id = parseInt(params.order_id);
  let name = params.name;
  let ctime = parseInt(params.ctime);
  let phone = parseInt(params.phone);
  let price = parseInt(params.price);
  let lease_time = parseInt(params.lease_time);
  let sign = params.sign;
  // 处理 nonce
  numbernon++;
  console.log("Current nonce is ", numbernon);

  // 处理签名合约的参数
  var nonceHex = web3.toHex(numbernon);
  var gasPrice = web3.eth.gasPrice;
  var gasPriceHex = web3.toHex(gasPrice);
  var gasLimitHex = web3.toHex(3000000);

  var rawTx = {
      from: config.account,
      nonce: nonceHex,
      gasPrice: gasPriceHex,
      gasLimit: gasLimitHex,
      to: config.ContractAddress,
      value: '0x00',
      data: ContractInstance.writeOrder.getData(order_id, name, ctime, phone, price, lease_time, sign)
  }
  var tx = new Tx(rawTx);
  var privateKey = new Buffer(config.privateKey, 'hex');
  tx.sign(privateKey);
  var serializedTx = '0x' + tx.serialize().toString('hex');
  web3.eth.sendRawTransaction(serializedTx, function(err, txHash) {
    console.log("The transaction Hash value is ", txHash);
    if (!err) {
      setTimeout(function(){
        web3.eth.getTransactionReceipt(txHash, function(err, receipt) {
          if (err) {
            res.status(200);
            res.json({'transactionHash': txHash, 'msg': err, 'balance': null});
          }
          if (receipt) {
            if (receipt.status == '0x1') {
              console.log('Write to success,The details are ' + "\n", receipt);
              let balance = web3.eth.getBalance(receipt.from).toNumber();
              res.status(200);
              res.json({'transactionHash': txHash, 'msg': 'Success', 'balance': balance});
            } else {
              console.log('Write to Fail,The details are ', receipt);
              res.status(400);
              res.json({'transactionHash': txHash, 'msg': 'Fail', 'balance': balance});
            }
          }
        });
      },60000);
    } else {
      console.log(err);
      res.status(400);
      res.json({'transactionHash': null, 'msg': 'Fail', 'balance': null});
    }
  })
});
// 读取以太坊数据
app.get('/readForEthereum',function(req, res){
  let params = urlModule.parse(req.url, true).query;
  let order_id = parseInt(params.order_id);
  let result = ContractInstance.readOrder.call(order_id);
  res.status(200);
  res.json(result);
})

// 开启服务器
const server = app.listen(3008, function() {
  var host = server.address().address
  var port = server.address().port
  console.log('server is listening at http://%s:%s', host, port)
})
