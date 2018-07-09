const fs = require('fs')
const addressFile = './addresses.json'
// assigning to exports will not modify module, must use module.exports
module.exports = class Contract {
  constructor(_name) {
    this.name = _name;
    this.abi = _loadContractAbi(_name);
    this.address = _loadContractAddress(_name);
  }
};

function _loadContractAddress(_contract) {
  let rawdata = fs.readFileSync(addressFile);
  let contracts = JSON.parse(rawdata);
  //let contracts = JSON.parse(addressFile);
  return contracts[_contract];
}

function _loadContractAbi(_contract) {
  let compiledContract = require('./build/'+_contract+'.json');
  return JSON.parse(compiledContract.interface);
}
