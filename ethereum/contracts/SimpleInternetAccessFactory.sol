pragma solidity ^0.4.23;

import "SimpleInternetAccess.sol";

contract SimpleInternetAccessFactory {
  mapping(address => address[]) deployedContractsbyProvider;
  mapping(address => address[]) deployedContractsbyClient;
  address public owner;

  constructor() public {
    owner = msg.sender;
  }

  function createContract(address _client, string _providerIP, string _providerMonitor, uint _maxData,  uint _priceperMB) public {
    address newContract = new SimpleInternetAccess(_client, _providerIP, _providerMonitor, _maxData,  _priceperMB, msg.sender);
    deployedContractsbyProvider[msg.sender].push(newContract);
    deployedContractsbyClient[_client].push(newContract);
  }

  function getDeployedContractsbyProvider() public view returns (address[]) {
    return deployedContractsbyProvider[msg.sender];
  }

  function getDeployedContractsbyClient() public view returns (address[]) {
    return deployedContractsbyClient[msg.sender];
  }

  function kill() public {
    if (msg.sender == owner) selfdestruct(owner);
  }

  function killContract(address _contract) public{
    require(msg.sender == owner);
    SimpleInternetAccess todie = SimpleInternetAccess(_contract);
    todie.kill();
    //TODO remove contract from local Factory structure

  }
}
