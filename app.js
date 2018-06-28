const express = require('express');
const Web3 = require('web3');
const contract = require('truffle-contract');
const urlModule = require('url');
const Tx = require('ethereumjs-tx');
const config = require('./config.js');
const ContractABI = require('./ContractABI.js');
const logger = require('./log4js_helper.js');
const Raven = require('raven');

// Raven配置
Raven.config(config.raven).install();

if (typeof web3 !== 'undefined') {
  logger.writeInfo('Web3 instance already exists');
  web3 = new Web3(web3.currentProvider);
} else {
  logger.writeInfo('new Web3 instance');
    // 这里设置的是 rinkbey 测试网络
  web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/" + config.key));
}

var ContractInstance =  web3.eth.contract(ContractABI).at(config.ContractAddress);
var numbernon= web3.eth.getTransactionCount(config.account, 'latest');
numbernon--;
const app = express();
// 初始化中间件
app.use(Raven.requestHandler());
// console.log(sdfasf);
// 开启报警机制,线上环境Raven错误捕获及发送通知
if (process.env.NODE_ENV === 'production') {
    app.use(Raven.errorHandler());
}

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
  logger.writeInfo('Start asking for data');
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
  logger.writeInfo("Current nonce is ", numbernon);

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
    logger.writeInfo("The transaction Hash value is " + txHash + ' You can read more information by https://rinkeby.etherscan.io');
    if (!err) {
      setTimeout(function(){
        web3.eth.getTransactionReceipt(txHash, function(err, receipt) {
          if (err) {
            logger.writeError(err);
            res.status(200);
            res.json({'transactionHash': txHash, 'msg': err, 'balance': null});
          }
          if (receipt) {
            if (receipt.status == '0x1') {
              logger.writeInfo('Write to success,The details are ' + '\n', receipt);
              let balance = web3.eth.getBalance(receipt.from).toNumber();
              res.status(200);
              res.json({'transactionHash': txHash, 'msg': 'Success', 'balance': balance});
            } else {
              logger.writeError('Write to Fail,The details are ', receipt);
              res.status(400);
              res.json({'transactionHash': txHash, 'msg': 'Fail', 'balance': balance});
            }
          }
        });
      },60000);
    } else {
      logger.writeError(err);
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
  logger.writeInfo('Read success, information is ' + '\n', result);
  res.status(200);
  res.json(result);
})

// 开启服务器
const server = app.listen(3008, function() {
  var host = server.address().address
  var port = server.address().port
  logger.writeInfo('server is listening at http://%s:%s', host, port)
})
