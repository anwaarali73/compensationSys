//import web3 from './web3';
const web3 = require('./web3.js');
const fs = require('fs')
const addressFile = 'addresses.json'
//const contracts = ["OracleTest",'OracleDispatch', 'OracleLookup','SimpleInternetAccess']
const contracts = ['SimpleInternetAccessFactory']
const db = require('./db.json');
//const compiledFactory = require('./build/CampaignFactory.json');

let contractAddresses = {};
try {
  fs.accessSync(addressFile, fs.constants.F_OK);
  console.log('Addresses file exists');
  let rawdata = fs.readFileSync(addressFile);
  contractAddresses = JSON.parse(rawdata);
} catch (err) {
  console.error(
    `${addressFile} ${err.code === 'ENOENT' ? 'does not exist' : 'is not writable'}`);
}

let deployed = contracts.map(checkDeployed);

for (id in contracts) {
  if (!deployed[id]){
      deploy(contracts[id],addressFile);
  }
}

function checkDeployed(_contract) {
  if (_contract in contractAddresses) {
    return true;
  } else {
    return false;
  }
}

async function deploy(_contract, _addressFile) {
  let compiledContract = require('./build/'+_contract+'.json');
  let myWallet = await web3.eth.accounts.wallet.decrypt(JSON.parse(db.web3js_wallet),'password');
  let entity = db.entity;
  console.log('Attempting to deploy ',_contract,' from account', myWallet[entity.provider].address);

  const result = await new web3.eth.Contract(
    JSON.parse(compiledContract.interface)
  )
    .deploy({ data: '0x'+compiledContract.bytecode })
    .send({ gas: '3000000', from: myWallet[entity.provider].address })
    .on('error', function(error){
      console.error(error);
    });
  console.log('Contract ', _contract,' deployed to', result.options.address);

  writeAddress(_contract, result.options.address, _addressFile);
  return result.options.address;
}

function writeAddress(_contract, _address, _addressFile) {
    contractAddresses[_contract] = _address;
    let data  = JSON.stringify(contractAddresses);
    fs.writeFileSync(_addressFile,data);
}
