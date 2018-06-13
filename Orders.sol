pragma solidity ^0.4.18;

contract Orders {

	struct Order{
    	uint8 uin;
		string name;
		uint16 time;
  }

	mapping (uint8 => Order) public orders;

	uint16 nowTime;
	uint16 timeLimit = uint16(172800);//48*60*60;

  // 在合约部署完成后，需要修改，用 getAddress 方法
  	address owenr = 0xa7d4831d700991304d690a078c6e1492c;// 用户
	address user = getAddress();// owner: 0xa7d4831d700991304d690a078c6e65c5c281492c

	// 判断是否超过了两天
	function isChange(uint16 ctime) public returns (bool) {
		nowTime = uint16(block.timestamp);
		if (nowTime - ctime < timeLimit) {
			return true;
		} else {
			return false;
		}
	}

	function isOwner() public view returns (bool) {
		return owenr == user;
	}

	function getAddress() public view returns (address) {
		return msg.sender;
	}

	// 写操作
  function writeOrder(uint8 order_id, string user_name, uint16 ctime) public{
		if (isOwner()) {
			// 管理员，可不限时间修改
			orders[order_id] = Order({
            uin: order_id,
            name: user_name,
            time: ctime
          });
		} else {
			// 普通用户，在两天之内可修改，并且只可修改合约是否生效状态
			if (isChange(ctime)){
				// 没有超过两天
				orders[order_id] = Order({
					uin: order_id,
        	        name: user_name,
        	        time: ctime
	                });
			} else {
				// 超过两天不可以修改
				orders[order_id] = Order({uin:uint8(1234), name:'hhh',time:uint16(1532453)});
			}
		}

	}

	// 读操作
	function readOrder(uint8 uin) internal view returns (uint8, string, uint16) {
		/* if (isOwner()) { */
			return (orders[uin].uin,orders[uin].name,orders[uin].time);
		/* } else {
			return orders[uin];
		} */

	}

}
