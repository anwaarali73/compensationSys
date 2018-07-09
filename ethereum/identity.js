const fs = require('fs-extra');
const EthCrypto = require('eth-crypto');
const path = require('path');
//const identityFile = path.resolve(__dirname, 'identity.json');
const identityFile = path.resolve('./', 'identity.json');

const web3 = require('./web3.js');
const mylog = require('./log.js');

let clientID = {
  type: 'client', // client or provider
  //identity: getIdentity('client'),
  ip: '127.0.0.1',
  monitor: 'http://localhost/monitor/client:4000'
  }

let providerID = {
  type: 'provider', // client or provider
  //identity: getIdentity('provider'),
  ip: '127.0.0.1',
  monitor: 'http://localhost/monitor/provider:4000'
  }

let entity = Object.freeze({'client':'0','provider':'1'});

async function init(){
  clientID.identity = await getIdentity('client');
  providerID.identity = await getIdentity('provider');
}
init()

async function getWallet() {
  console.log('Checking if a wallet already exists');
  let wallet = undefined;
  try {
    fs.accessSync('web3js_wallet', fs.constants.F_OK);
    console.log('Web3 wallet exists. Importing...');
    wallet = web3.eth.accounts.wallet.load('password');
    console.log(wallet);
  } catch (err) {
    console.error('Web3 wallet does not exist.\nCreating one with two accounts and password \'password\'');
    wallet = await web3.eth.accounts.wallet.create(2);
    web3.eth.accounts.wallet.save('password');
  }
  return wallet;
}

web3.eth.accounts.wallet.load = password => {
  let _file = 'web3js_wallet';
  let _wallet = undefined;
  try {
    fs.accessSync(_file, fs.constants.F_OK);
    let rawdata = JSON.parse(fs.readFileSync(_file));
    _wallet =  web3.eth.accounts.wallet.decrypt(rawdata,password);
  } catch (err) {
    console.log(err);
    console.error(`Web3 wallet does not exist.\nCreating one with two accounts and password \'${password}\'`);
    _wallet = web3.eth.accounts.wallet.create(2);
    web3.eth.accounts.wallet.save(password);
  }
  return _wallet
}

web3.eth.accounts.wallet.save = password => {
  let _file = 'web3js_wallet';
  let data = web3.eth.accounts.wallet.encrypt(password);
  fs.writeFileSync(_file,JSON.stringify(data));
}

async function getIdentity(entity) {
  let identity = {}
  try {
    fs.accessSync(identityFile, fs.constants.F_OK);
    console.log(`${identityFile} exists\n Reading identity...`);
    let rawdata = fs.readFileSync(identityFile, 'utf8');
    identity = JSON.parse(rawdata);
    if (entity in identity) {
      console.log(`Identity: ${JSON.stringify(identity[entity],null,'\t')}`);
    }else {
      temp = await EthCrypto.createIdentity();
      identity[entity] = temp;
      console.log(`Identity: ${JSON.stringify(identity[entity],null,'\t')}`);
      let data  = JSON.stringify(identity);
      fs.writeFileSync(identityFile,data);
    }
  } catch (err){
    console.error(
      `${identityFile} ${err.code === 'ENOENT' ? 'does not exist' : 'is not readable'}`);
    console.log('Creating identity...');
    //temp = await EthCrypto.createIdentity();
    //identity[entity] = temp;
    identity[entity] = await EthCrypto.createIdentity();
    console.log(`Identity: ${JSON.stringify(identity[entity],null,'\t')}`);
    let data  = JSON.stringify(identity);
    fs.writeFileSync(identityFile,data);
  }
  return identity[entity];
}


module.exports.clientID = clientID;
module.exports.providerID = providerID;
module.exports.entity = entity;
module.exports.getWallet = getWallet;
/*
export default {clientID: clientID,
  providerID: providerID,
  entity: entity,
  getWallet: getWallet
}
*/
