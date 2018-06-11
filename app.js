const express = require('express');
const Web3 = require('web3');
const fs = require('fs');
const contract = require('truffle-contract');
const SimpleStorageContract = require('../build/contracts/simpleStorage.json');

// 创建express实例
const app = express();
// 设置跨域访问
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, accept, origin, content-type')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', ' 3.2.1')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})

const contractAddress = "0x79670063052b240a2b4bc67fd4cbc72c08b6ddbb";

// 开始写接口
// 例：接口为/client/任意参数, 就爱那个数据插入database的clients.json中
app.post('/writeToEthereum',function(req, res){
  //引入web3模块
  //初始化 web3
  let web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  //输出初始化结果
  console.log('Initialization web3 complete,the first account is '+ web3.eth.accounts[1]);
  let fs = require('fs');
  let code = fs.readFileSync('Voting.sol').toString();
  let solc = require('solc');
  //编译合约为ABI文件
  let compiledCode = solc.compile(code);

  console.log('Compile Voting.sol complete');
  //部署合约至区块链节点
  let abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface);
  //写入ABI文件至本地文件目录
  fs.writeFile('Voting.json',JSON.stringify(abiDefinition), {}, function(err) {
      console.log('write ABI file [Voting.json] complete . ');
  });

  let VotingContract = web3.eth.contract(abiDefinition);
  let byteCode = compiledCode.contracts[':Voting'].bytecode;
  //调用VotingContract对象的new()方法来将投票合约部署到区块链。new()方法参数列表应当与合约的 构造函数要求相一致。对于投票合约而言，new()方法的第一个参数是候选人名单。
  console.log(web3.eth.accounts[0]);
  let deployedContract = VotingContract.new(['Rama','Nick','Jose'],{data: byteCode, from: web3.eth.accounts[0], gas: 4700000});
  //输出合约 地址，如果此处没有返回地址，可以在Ganache日志中查看到
  console.log(deployedContract);
  setTimeout(function(){
    console.log('deploy complete,deploy address is '+ deployedContract.address);
    let contractInstance = VotingContract.at(deployedContract.address);
    // let contractInstance = VotingContract.at('0xb3e2957f9aa802a6287ef067e91d76eada7d6322');

  console.log(contractInstance);
    //测试合约调用
    contractInstance.voteForCandidate('Rama', {from: web3.eth.accounts[0]});
    contractInstance.voteForCandidate('Rama', {from: web3.eth.accounts[0]});
    contractInstance.voteForCandidate('Nick', {from: web3.eth.accounts[0]});
    contractInstance.voteForCandidate('Jose', {from: web3.eth.accounts[0]});
    contractInstance.voteForCandidate('Jose', {from: web3.eth.accounts[0]});
    console.log("--------------finish----------------");
    let RamaVote=contractInstance.totalVotesFor.call('Rama');
    let NickVote=contractInstance.totalVotesFor.call('Nick');
    let JoseVote=contractInstance.totalVotesFor.call('Jose');
    console.log("Rama's vote is "+RamaVote);
    console.log("Nick's vote is "+NickVote);
    console.log("Jose's vote is "+JoseVote);
    res.status(200);
    res.send()
  },16000);
});

// 开启服务器
const server = app.listen(3000, function() {
  var host = server.address().address
  var port = server.address().port
  console.log('server is listening at http://%s:%s', host, port)
})
