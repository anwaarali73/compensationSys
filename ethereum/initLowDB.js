const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const Identity = require('./identity')
const Contract = require('./contract')
const web3 = require('./web3');


const adapter = new FileSync('db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
function init() {
  db.defaults({ identities: {}, web3js_wallet: [], contracts: {}, entity: {} })
  .write()
}

function writeWallet() {
  let wallet = Identity.getWallet();
  console.log(wallet);
  let data = web3.eth.accounts.wallet.encrypt('password');
  db.get('web3js_wallet')
    .push( JSON.stringify(data))
    .write();
  db.set('entity',Identity.entity)
    .write();
}

function writeIdentities() {
  db.set('identities.clientID', Identity.clientID)
    .write();
  db.set('identities.providerID', Identity.providerID)
    .write();
}

function writeContracts(_contract) {
  db.set('contracts.'+_contract, new Contract(_contract))
    .write();
}

init();
writeWallet();
writeIdentities();
writeContracts('SimpleInternetAccessFactory');
writeContracts('SimpleInternetAccess');
