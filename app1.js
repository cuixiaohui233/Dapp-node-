pragma solidity ^0.4.18;

contract Orders {

	struct Order{
    uint uin;
		string name;
		uint time;
  }

	mapping (uint => Order) public orders;

	uint nowTime;
	uint timeLimit = 48*60*60;

  // 在合约部署完成后，需要修改，用 getAddress 方法
  address address1 = 0xa7d4831d700991304d690a078c6e65c5c281492c;// 用户
	address address2 = getAddress();// owner: 0xa7d4831d700991304d690a078c6e65c5c281492c

	// 判断是否超过了两天
	function isChange(uint ctime) constant returns (bool) {
		nowTime = block.timestamp;
		if (nowTime - ctime < timeLimit) {
			return true;
		} else {
			return false;
		}
	}

	function isOwner() constant returns (bool) {
		return address1 == address2;
	}

	function getAddress() constant returns (address) {
		return msg.sender;
	}

	// 写操作
  function writeOrder(uint _uin, string _name, uint _time){
		if (isOwner()) {
			// 管理员，可不限时间修改
			orders[_uin] = Order({
        uin: _uin,
        name: _name,
        time: _time
      });
		} else {
			// 普通用户，在两天之内可修改，并且只可修改合约是否生效状态
			if (isChange(_time)){
				// 没有超过两天
				orders[_uin] = Order({
					uin: _uin,
	        name: _name,
	        time: _time
	      });
			} else {
				// 超过两天不可以修改
				Order({uin:123456, name:'hhh',time:1532453});
			}
		}

	}

	// 读操作
  function readOrder(uint uin) public returns (uint, string, uint) {
		/* if (isOwner()) { */
			return (orders[uin].uin,orders[uin].name,orders[uin].time);
		/* } else {
			return orders[uin];
		} */

  }

}
