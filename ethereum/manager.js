const fs = require('fs');
const request = require('request');
const EthCrypto = require('eth-crypto');
const path = require('path');

const contractsDB = require('./internetContractsDB.js')
const web3 = require('./web3.js');
const Contract = require('./contract.js');
const Identity = require('./identity.js');
const mylog = require('./log.js')
//const internetFactoryContract = new Contract('InternetFactory');
const addressFile = path.resolve(__dirname, 'addresses.json')
const identityFile = path.resolve(__dirname, 'identity.json');
const deployedContractsFile = path.resolve(__dirname, 'deployedContracts.json')

internetContract = {
  name: 'SimpleInternetAccess',
  abi: _loadContractAbi('SimpleInternetAccess')
}



const logList = internetContract.abi.filter(x => x.type=='event').
  map(y => y.name+'('+y.inputs.map(z => z.type).reduce((m,n) => m+','+n)+')');

let logsTopicList = {};
let topicsLogList = {};
logList.forEach(x => topicsLogList[web3.utils.soliditySha3(x)]= x);
logList.forEach(x => logsTopicList[x]=web3.utils.soliditySha3(x));


let clientID = undefined;

let providerID = undefined;


let entity = Identity.entity;
let myWallet = undefined;

let currentContract = undefined;

async function bootStrap(){
  clientID = await Identity.clientID;
  providerID = await Identity.providerID;
  myWallet = await Identity.getWallet();
  console.log(myWallet);
  clientID['address'] = myWallet[entity.client].address;
  providerID['address'] = myWallet[entity.provider].address;
  console.log('Client:\n'+myWallet[entity.client].address);
  console.log('Client\'s private key\n'+myWallet[entity.client].privateKey)
  console.log('Provider:\n'+myWallet[entity.provider].address);
  console.log('Provider\'s private key\n'+myWallet[entity.provider].privateKey)
  //return;
  logList.map(logSubscribe);
  let internetAccessContract =  contractsDB.checkDeployed( myWallet[entity.client].address);
  if (!internetAccessContract) {
    currentContract = await instantiateContract( myWallet[entity.client].address,50, 10);
    console.log('Contract deployed and stored');
  }
  else {
    console.log('Contract already deployed');
  }
}

bootStrap();



async function instantiateContract(_client, maxData, priceperMB){
  let args = [_client, clientID.ip,clientID.monitor, maxData, priceperMB, myWallet[entity.provider].address];
  let address = await deploy('SimpleInternetAccess',args, addressFile);
  let contract = new contractsDB.deployedInternetContract(
    'SimpleInternetAccess',
    address,
    _client,
    maxData,
    priceperMB
  );
  contractsDB.writeContract(contract);
  return contract;
}

async function acceptContract(_address, _provider, _maxData, _pricerPerMB){
  console.log(`Accepting contract ${_address} from provider ${_provider}.`)
  console.log(`Contract details: \nMaxData:\t${_maxData}\nPrice Per MB:\t${_pricerPerMB}`);
  console.log(`Client address:\t${myWallet[entity.client].address}`);
  console.log(`PubKey: ${clientID.identity.publicKey}`);
  let pubKey = EthCrypto.publicKey.compress(clientID.identity.publicKey).slice(2);
  let _contractAbi  = _loadContractAbi('SimpleInternetAccess');
  const _contract = await new web3.eth.Contract(_contractAbi,_address);
  //_contract.methods.acceptContract(clientID.monitor, web3.utils.hexToBytes('0x'+pubKey))
  _contract.methods.acceptContract(clientID.monitor, '0x'+pubKey)
    .send({from: myWallet[entity.client].address, gas:300000, value: (_maxData*_pricerPerMB+1)})
    .on('error', console.error);
}

async function sendSecret(client, pubKey){
  let secretMessage = Math.random().toString(36).slice(-8);
  console.log(`Send secret ${secretMessage} to ${client}`);
  // Clients pubkey is publicKey
  let publicKey = EthCrypto.publicKey.decompress('02'+pubKey.slice(2))
  const encryptedString = await encryptMessage(secretMessage, publicKey);

  let _theContract = contractsDB.searchContractByClient(client);
  const _contract = await new web3.eth.Contract(_theContract.abi,_theContract.address);
  _contract.methods.provideTicket(encryptedString)
    .send({from: myWallet[entity.provider].address, gas:3000000})
    .on('error', console.error);
}

async function receiveSecret(encryptedString, providerIP, activationTime){
  console.log(`Will connect to: ${providerIP}`);
  console.log(`Connection Time counting from: ${activationTime}`);
  secret = await decryptMessage(encryptedString);
  console.log(`Received pass: ${secret}`);

  launchVPNClient();

}

async function checkUsage(client, wallet){

  let _theContract = contractsDB.searchContractByClient(client);
  const _contract = await new web3.eth.Contract(_theContract.abi,_theContract.address);
  _contract.methods.checkUsage()
    .send({from: wallet.address, gas:3000000})
    .on('error', console.error);

}

async function encryptMessage(secretMessage, publicKey){
  const signature = EthCrypto.sign(
    providerID.identity.privateKey,
    EthCrypto.hash.keccak256(secretMessage)
  );
  const payload = {
      message: secretMessage,
      signature
  };
  const encrypted = await EthCrypto.encryptWithPublicKey(
      publicKey, // by encryping with bobs publicKey, only bob can decrypt the payload with his privateKey
      JSON.stringify(payload) // we have to stringify the payload before we can encrypt it
      //secretMessage
  );
  return EthCrypto.cipher.stringify(encrypted);
}

async function decryptMessage(encryptedString){
  const encryptedObject = EthCrypto.cipher.parse(encryptedString);

  const decrypted = await EthCrypto.decryptWithPrivateKey(
      clientID.identity.privateKey,
      encryptedObject
  );

  const decryptedPayload = JSON.parse(decrypted);

  return decryptedPayload.message
}

function launchVPNClient(){

}

function launchVPNServer(){

}


function getIdentity(entity) {
  let identity = {}
  try {
    fs.accessSync(identityFile, fs.constants.F_OK);
    console.log(`${identityFile} exists\n Reading identity...`);
    let rawdata = fs.readFileSync(identityFile, 'utf8');
    identity = JSON.parse(rawdata);
    if (entity in identity) {
      console.log(`Identity: ${JSON.stringify(identity[entity],null,'\t')}`);
    }else {
      temp = EthCrypto.createIdentity();
      identity[entity] = temp;
      console.log(`Identity: ${JSON.stringify(identity[entity],null,'\t')}`);
      let data  = JSON.stringify(identity);
      fs.writeFileSync(identityFile,data);
    }
  } catch (err){
    console.error(
      `${identityFile} ${err.code === 'ENOENT' ? 'does not exist' : 'is not readable'}`);
    console.log('Creating identity...');
    temp = EthCrypto.createIdentity();
    identity[entity] = temp;
    console.log(`Identity: ${JSON.stringify(identity[entity],null,'\t')}`);
    let data  = JSON.stringify(identity);
    fs.writeFileSync(identityFile,data);
  }
  return identity[entity];
}

async function logSubscribe(_event) {
  console.log(`Subscribing to ${_event} event!`);
  let subscribe = (theevent) =>
  web3.eth.subscribe('logs',{
      topics: [web3.utils.soliditySha3(theevent)]
    }).on('data',(log)=>{
    console.log('Log Received:\n',JSON.stringify(log));
    //console.log(log.topics);
    for (topic in log.topics) {
      if (log.topics[topic] in topicsLogList) {
        console.log('Found log with related topic. Parsing...');
        logDispatcher(log.address, log.topics[topic], log)
    }
  }
  })
  .on('error', (log) => {
      console.log(`error:  ${log}`)
  });
  subscribe(_event);
}

async function logDispatcher(address, topic, log) {
  myevent = topicsLogList[topic].split('(')[0];
  encodedParameters = internetContract.abi.filter(x => x.type == 'event')
        .filter(y => y.name == myevent)[0].inputs;
  //store in external variable
  parameters = web3.eth.abi.decodeParameters(encodedParameters, log.data.replace("0x", ""));
  console.log(parameters);
  switch (myevent) {
    case 'LogContractCreated':
      console.log('LogContractCreated');
      acceptContract(address, parameters.provider,
          parameters.maxData, parameters.pricePerMB);
      break;
    case  'LogClientAccepted':
      console.log('LogClientAccepted');
      sendSecret(parameters.client, parameters.pubkey);
      launchVPNServer();
      break;
    case 'LogActivation':
      console.log('LogActivation');
      receiveSecret(parameters.ticket, parameters.providerIP, parameters.activationTime);
      launchVPNClient();
      break;
    case 'LogRenegotiate':
      console.log('LogRenegotiate');
      break;
    case 'LogRemainingData':
      console.log('LogRemainingData');
      break;
  }

}

async function deploy(_contract, _args, _addressFile) {
  let compiledContract = require('./build/'+_contract+'.json');
  console.log('Attempting to deploy ',_contract,' from account', myWallet[entity.provider].address);

  const result = await new web3.eth.Contract(
    JSON.parse(compiledContract.interface)
  )
    .deploy({ data: '0x'+compiledContract.bytecode, arguments: _args})
    .send({ gas: 3000000, from: myWallet[entity.provider].address });
  console.log('Contract ', _contract,' deployed to', result.options.address);

  return result.options.address;
}

function _loadContractAbi(_contract) {
  let compiledContract = require('./build/'+_contract+'.json');
  return JSON.parse(compiledContract.interface);
}
