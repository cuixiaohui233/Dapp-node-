const Web3 = require('web3');

let web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
//输出初始化结果
console.log('Initialization web3 complete,the first account is '+ web3.eth.accounts[1]);
let fs = require('fs');
let code = fs.readFileSync('Orders.sol').toString();
let solc = require('solc');
//编译合约为ABI文件
let compiledCode = solc.compile(code);

console.log(compiledCode)
//部署合约至区块链节点
let abiDefinition = JSON.parse(compiledCode.contracts[':Orders'].interface);
//写入ABI文件至本地文件目录
fs.writeFile('Orders.json',JSON.stringify(abiDefinition), {}, function(err) {
console.log('write ABI file [Orders.json] complete . ');
});

let VotingContract = web3.eth.contract(abiDefinition);
let byteCode = compiledCode.contracts[':Orders'].bytecode;
//调用VotingContract对象的new()方法来将投票合约部署到区块链。new()方法参数列表应当与合约的 构造函数要求相一致。对于投票合约而言，new()方法的第一个参数是候选人名单。
console.log(web3.eth.accounts[0]);
let deployedContract = VotingContract.new(null,{data: byteCode, from: web3.eth.accounts[0], gas: 4700000});
//输出合约 地址，如果此处没有返回地址，可以在Ganache日志中查看到
console.log(deployedContract);
setTimeout(function(){
console.log('deploy complete,deploy address is '+ deployedContract.address);
let contractInstance = VotingContract.at(deployedContract.address);
// let contractInstance = VotingContract.at('0xb3e2957f9aa802a6287ef067e91d76eada7d6322');

console.log(contractInstance);
//测试合约调用
contractInstance.writeOrder('hh')
console.log(contractInstance.readOrder('hh'));
// console.log(contractInstance.writeOrder(0xd47c8fe9b305b31129bd381b315ca6a8aa771e11));
// console.log(contractInstance.isOwner());
// console.log(contractInstance.isChange(1527869486));
// contractInstance.WriteOrders(1541735128, '大师姐', {from: web3.eth.accounts[0]});
// contractInstance.getOrders.call(0);

},1000);
