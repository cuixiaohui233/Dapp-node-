# Dapp-node-

简直了，太丢脸了，不小心把心里活动说出来了！！妈的，我还有什么脸活在这世上。太傻了简直/笑哭....算了算了，我脸皮厚....

这个是今天搞得，由于这个以太坊需要在用户下单成功后将用户资料写进区块链，所以，需要在后端支付成功的时候调用一个接口，然后就有了这个，搞了一天，嘛的。

明天研究一下，该写智能合约了。有点麻烦。

首先，用户和管理员（我们）是有两种权限的，用户只能看到他的数据，管理员可以看到全部数据。

其次，用户在两天之后将不能修改自己的数据，管理员无论何时都可以修改。

我们可以将这个分为两个：

    读权限：用户-> 只可以读自己的

           管理员-> 全部
           
           合约方法需要知道读这个合约的人是谁

    写权限：用户-> 两天之内可以修改自己的数据
    
           管理员-> 永远可以
           
           合约方法需要知道写合约的人是谁，以及这个人的写入时间
           
数据格式：
  
    由于是不可变的，所以只可增。
    
    这个目前想到的只有 unshift 了，不知道可不可用。

还得整个 API 接口验证：

    貌似 MD5 加密？？


----------------------------------------------我是最后总结分界线-------------------------------------------------------

在 Dapp 项目中搭建的简单 Dapp 已经够用了，奈何老板就是会折磨人，需求是后端直接调用我写的接口，在用户下单成功后直接将数据存入数据库，所以就有了这个，通过这么一搞，对以太坊又加深了一些印象，趁我刚搞完，赶紧写总结，要不下周忙别的又忘了。

先简单说一下我的踩坑历程，开始本着后端直接调用的目标，写接口，然后遇到一个问题，以往的 Dapp 都是前端调用，在网页上连接小狐狸钱包直接支付成功就好了的
啊，但是我写接口的时候，死活找不到部署完合约的那个账户，而且我特么写的东西都是在 TestRpc 上的啊，关了服务啥都特么没了，苦恼了一天，最后特么的找到了原
因 ，原来是前端调用和 Node 接口不一样的，前端在浏览器上可以直接通过 MetaMask 钱包连接到以太坊的 JSON RPC,但是后端连不到啊，必须开着 ganache-cli 才
能连接到节点，所以，两个环境都不一样，去哪里特么同步账户啊，脑子一下子灵了，于是有了下面的用 TestRPC + MetaMask 搭建以太坊测试环境，用于测试智能合
约，优点是不用等待矿工执行代码，直接出结果，以太坊组织强啊，以下：
 
#### 过程。只有我自己能看的懂。
先根据 Dapp 的教程新建一个项目，然后，开启 ganache-cli,连接上 TestRPC ,然后打开智能合约在线编辑器，编译成功之后，选择 "Run" 的选项，在 
"Environment" 那一项选择 "Web3 Provider" 然后点击 "Create" 部署合约，然后就会在下面看到部署好的合约地址和函数名，可以直接在 input 框里填写函
数的参数，支付一定的 gas，等待交易成功，就可以查看数据了。这是一个合约测试的过程，甚至不需要前面说的开启 TestRPC,就可以直接测试。这破玩意，搞了老长
时间了，丫的。
    
接着，测试也测试成功了，那上线吧，但是以太坊部署到公链上，就需要连接公网的节点，但是连接节点，需要本地同步链上的所有的节点，工程大，占内存，费时间一
开始不知道啊，傻呵呵的又搞了好久，又整钱包，还整什么星火计划节点，都白扯啦，后来就连接远程节点，才连接上了主链，跳坑的时候离写这个文档的时候过去好几
天了，其中踩坑的许多细节都忘了，感觉还不错，除了被老大催着难受以外，其他都还好。

接下来，赶紧记录一下最重要的部分，就是如何通过 infura 部署项目至公链上。这一部分要写详细一点：

### 1.在 infura 上申请 key

    很简单，直接注册，然后就有了，这个 key 一定要保存好，不能给别人知道。
    
### 2.在智能合约编辑器上部署智能合约。

    不说了就，记住那个合约地址、合约函数的地址，合约函数的地址在 Compile，那里，点击 "Details",然后在一大堆里找吧就。对了，连同你的钱包的公钥和私钥
    地址，这些都放在一个 config.js 文件里，有用...而且全部都是机密。
    
### 3.编写 App.js 文件

如上面的 app.js,累个半死搞出这么个玩意。
    
#### 首先，先引入各种依赖：
    
    const express = require('express');// Node 写接口的
    const Web3 = require('web3');// 使用 Web3 调用以太坊的 RPC
    const urlModule = require('url');// 处理 Url
    var Tx = require('ethereumjs-tx');// 签名合约的时候要用
    
#### 然后创造 Web3 实例:
    
    if (typeof web3 !== 'undefined') {
      console.log('instance already exists');
      web3 = new Web3(web3.currentProvider);
    } else {
      console.log('new instance');
        // 这里设置的是 rinkbey 测试网络,上线时改成 Main
      web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/" + config.key));
    }
    
#### 获取合约实例
    
    var ContractInstance =  web3.eth.contract(ContractABI).at(config.ContractAddress);
    
#### 获取钱包账户的 nonce,这个尤其重要，参见(教程)[https://blog.csdn.net/wo541075754/article/details/79054937]
    
    var numbernon= web3.eth.getTransactionCount(config.account, 'latest');
    numbernon--;// 如果你看了上面的文章，你就知道我为啥这么做。
    
#### 接着设置接口的跨域了啥的：
    
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
    
#### 接着到了重头戏，写操作：

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
    

    
    

