pragma solidity ^0.4.21;
//
// An example client calling our oracle service
//
import "OracleAPI.sol";

contract OracleTest is usingOracle {
  uint public response;
  string public entity;

  function __oracleCallback(uint _response, string _entity) onlyFromOracle public {
    response = _response;
    entity = _entity;
  }

  function query() public {
    string memory tmp = "hello world";
    query(tmp);
  }

  function query(string _query) internal {
    queryOracle('client',_query);
  }
}
