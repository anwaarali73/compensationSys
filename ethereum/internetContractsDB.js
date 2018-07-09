const fs = require('fs');
const path = require('path');

const deployedContractsFile = path.resolve(__dirname, 'deployedContracts.json');

class deployedInternetContract {
  constructor(name, address, client, maxData, priceperMB, ) {
    this.name = name;
    this.abi = _loadContractAbi(name);
    this.client = client;
    this.address = address;
    this.maxData = maxData;
    this.priceperMB = priceperMB;
  }
}

function writeContract(_contract) {
  _contracts = getDeployedContracts();
  _contracts[_contract.client] = _contract;
  let data  = JSON.stringify(_contracts);
  fs.writeFileSync(deployedContractsFile,data);
}

function searchContractByClient(client) {
  _contracts = getDeployedContracts();
  return _contracts[client];
}

function checkDeployed(client) {
  _contracts = getDeployedContracts();
  _contract = (client in _contracts) ? _contracts[client] : null;
  return _contract;
}

function getDeployedContracts() {
  let _contracts = {};
  try {
    fs.accessSync(deployedContractsFile, fs.constants.F_OK);
    console.log('Deployed Interenet Contracts DB exists');
    let rawdata = fs.readFileSync(deployedContractsFile);
    _contracts = JSON.parse(rawdata);
  } catch (err) {
    console.error(
      `${deployedContractsFile} ${err.code === 'ENOENT' ? 'does not exist' : 'is not writable'}`);
  }
  return _contracts;
}



function _loadContractAbi(_contract) {
  let compiledContract = require('./build/'+_contract+'.json');
  return JSON.parse(compiledContract.interface);
}


module.exports.deployedInternetContract = deployedInternetContract
module.exports.writeContract = writeContract
module.exports.searchContractByClient = searchContractByClient
module.exports.checkDeployed = checkDeployed
module.exports.getDeployedContracts = getDeployedContracts
