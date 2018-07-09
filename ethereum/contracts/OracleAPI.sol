pragma solidity ^0.4.21;
//
// This is the API file to be included by a user of this oracle
//

// This must match the signature in dispatch.sol
contract Oracle {
  function query(string entity, string _query) public returns (uint256 id);
}

// This must match the signature in lookup.sol
contract OracleLookup {
  function getQueryAddress() public constant returns (address);
  function getResponseAddress() public constant returns (address);
}

// The actual part to be included in a client contract
contract usingOracle {
  address constant lookupContract = 0xFE9F37865437B257e4Ea707d3254c81E35066556;

  modifier onlyFromOracle() {
    OracleLookup lookup = OracleLookup(lookupContract);
    require(msg.sender == lookup.getResponseAddress());
    _;
  }

  function queryOracle(string entity, string query) public returns (uint256 id) {
    OracleLookup lookup = OracleLookup(lookupContract);
    Oracle oracle = Oracle(lookup.getQueryAddress());
    return oracle.query(entity, query);
  }
}
