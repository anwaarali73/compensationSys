pragma solidity ^0.4.21;
/*
Based on https://github.com/axic/tinyoracle
*/
//
// The lookup contract for storing both the query and responder addresses
//
contract OracleLookup {
  address owner;
  address query;
  address response;

  modifier owneronly { require(msg.sender == owner); _; }

  constructor() public {
    owner = msg.sender;
  }

  function setOwner(address _owner) public owneronly {
    owner = _owner;
  }

  function setQueryAddress(address addr)  public owneronly {
    query = addr;
  }

  function getQueryAddress() public constant returns (address) {
    return query;
  }

  function setResponseAddress(address addr) public owneronly {
    response = addr;
  }

  function getResponseAddress() public constant returns (address) {
    return response;
  }

  function kill() public owneronly {
    selfdestruct(msg.sender);
  }
}
