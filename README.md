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

先简单说一下我的踩坑历程，开始本着后端直接调用的目标，写接口，然后遇到一个问题，以往的 Dapp 都是前端调用，在网页上连接小狐狸钱包直接支付成功就好了的啊，但是我写接口的时候，死活找不到部署完合约的那个账户，而且我特么写的东西都是在 TestRpc 上的啊，关了服务啥都特么没了，苦恼了一天，最后特么的找到了原因 ，原来是前端调用和 Node 接口不一样的，前端在浏览器上可以直接通过 MetaMask 钱包连接到以太坊的 JSON RPC,但是后端连不到啊，必须开着 ganache-cli 才能连接到节点，所以，两个环境都不一样，去哪里特么同步账户啊，脑子一下子灵了，于是有了下面的用 TestRPC + MetaMask 搭建以太坊测试环境，用于测试智能合约，优点是不用等待矿工执行代码，直接出结果，以太坊组织强啊，以下：

### 首先先根据 Dapp 的教程新建一个项目，然后，不写了累。
