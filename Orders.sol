pragma solidity ^0.4.24;
contract Orders {

	struct Order{
		uint48 uin;
		string name;
		uint48 ctime;
		uint48 phone;
		uint48 price;
		uint48 lease_time;
		string sign;
  }

	Order[] public Orderlist;


  // 在合约部署完成后，需要修改，用 getAddress 方法
  address owenr = 0xd56D92bD315800eA70E66FdA21B0778b7d4d191F;// 用户
  address user = getAddress();

	function isOwner() public view returns (bool) {
		return owenr == user;
	}

	function getAddress() public view returns (address) {
		return msg.sender;
	}
	
    event mylog(uint48 order_id, string user_name, uint48 ctime, uint48 phone, uint48 price, uint48 lease_time, string sign);
    
	// 写操作
  function writeOrder(uint48 order_id, string user_name, uint48 ctime, uint48 phone, uint48 price, uint48 lease_time, string sign) public  returns (string rusult){
		if (isOwner()) {
			// 管理员，可不限时间修改
			Orderlist.push(Order({
				uin: order_id,
				name: user_name,
				ctime: ctime,
				phone: phone,
				price: price,
				lease_time: lease_time,
				sign: sign
			}));
		  	return '写入成功';
		} else {
		  return '您暂时没有此权限';
		}

	}
    function getIndex(uint48 order_id) public view returns (uint48 index){
        uint48 num;
        for(uint8 i=0;i<Orderlist.length;i++){
            if (Orderlist[i].uin == order_id) {
                num = i;
            } else {
                num = 0;
            }
        }
        return num;
    }
	// 读操作
	function readOrder(uint48 order_id) public view returns (uint48, string, uint48, uint48, uint48, uint48, string) {
        if (Orderlist.length > 0){
            Order storage result = Orderlist[getIndex(order_id)];
            return (result.uin, result.name, result.ctime, result.phone, result.price, result.lease_time, result.sign);
        } else {
            return (123456, '0000', 123456, 12345, 123456, 123456, 'xxx');
        }
	}

}
