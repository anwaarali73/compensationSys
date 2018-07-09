const web3 = require('./web3');
//const Contract = require('./contract.js');
//const Identity = require('./identity.js').default

const db = require('./db.json');
//const db = JSON.parse(dbFile);


async function getWallet(){
  let myWallet = await web3.eth.accounts.wallet.decrypt(JSON.parse(db.web3js_wallet),'password');
  return myWallet;
}

//const contract = new Contract('SimpleInternetAccessFactory');
const factoryContract = db.contracts.SimpleInternetAccessFactory;

const factoryInstance = new web3.eth.Contract(
  factoryContract.abi,
  factoryContract.address
);

const internetContract = db.contracts.SimpleInternetAccess;

const internetContractInstance = async (address) => {
  return new web3.eth.Contract(internetContract.abi, address)
};

const entity = db.entity;

export default {factoryInstance: factoryInstance,
internetContractInstance: internetContractInstance,
wallet: getWallet,
entity: entity
}
