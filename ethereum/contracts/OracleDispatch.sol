pragma solidity ^0.4.21;
/*
Based on https://github.com/axic/tinyoracle
*/

//
// This is where the magic happens
//
// This contract will receive the actual query from the caller
// contract. Assign a unique (well, sort of) identifier to each
// incoming request, and emit an event our RPC client is listening
// for.
//
contract OracleDispatch {
  event Incoming(uint256 id, address recipient, string entity, string query);

  function query(string _entity, string _query) external returns (uint256 id) {
    id = uint256(keccak256(block.number, now, _query, msg.sender));
    emit Incoming(id, msg.sender, _entity, _query);
  }

  // The basic housekeeping

  address owner;

  modifier owneronly { require(msg.sender == owner); _; }

  function setOwner(address _owner) public owneronly {
    owner = _owner;
  }

  constructor() public {
    owner = msg.sender;
  }

  function kill() public owneronly {
    selfdestruct(msg.sender);
  }
}
