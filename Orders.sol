pragma solidity ^0.4.18;

contract Orders {

	mapping (bytes32 => bytes32) public orders;

	uint nowTime;
	uint timeLimit = 48*60*60*1000;
	address currcandidate = 0xd47c8fe9b305b31129bd381b315ca6a8aa771e11;
	function isChange(uint ctime) constant returns (bool) {
		nowTime = now;
		if (ctime + timeLimit < nowTime) {
			return false;
		} else {
			return true;
		}
	}

	function isOwner() constant returns (bool)  {
		return getAddress() == currcandidate;
	}

	function getAddress() constant returns (address) {
		return msg.sender;
	}

	function writeOrder(bytes32 order) {
		if (isOwner()) {
			orders[order] += 1;
		}
		
	}

	function readOrder(bytes32 order)  public returns (uint) {
		return orders[order];
	}
 
}
