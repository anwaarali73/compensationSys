/*
Based on https://github.com/robinagist/EthereumWeatherOracle
*/
const web3 = require('./web3');
const fs = require('fs');
const request = require('request');
const Contract = require('./contract.js')
const oracleContract = new Contract('OracleDispatch')
const monitorServer = 'http://localhost:4000/monitor/'


let account;

const getAccount = async () => {
  const accounts = await web3.eth.getAccounts();
  account = accounts[0];
  console.log('Working from account ', account);
};

let c = getAccount().then( function(){
  console.log("contract address: " + oracleContract.address);
  startListener(oracleContract.abi, oracleContract.address);
}, function(err) {
    console.log("shit didn't work.  here's why: " + err)
})


// starts the event listener
async function startListener(abi, address) {

    console.log("starting event monitoring on contract: " + address);
    console.log("the abi is:" + abi);
    const myContract = await new web3.eth.Contract(jsonInterface=abi, address=address);
    myContract.events.Incoming({fromBlock: 537025, toBlock: 'latest'
    }, function(error, event){ console.log(">>> " + event) })
        .on('data', (log) => {
            console.log("event data: " + JSON.stringify(log, undefined, 2))
            logData = log.returnValues;
            handler(logData.id, logData.recipient, logData.entity, logData.query);
            //handler(abi, address)
        })
        .on('changed', (log) => {
            console.log(`Changed: ${log}`)
        })
        .on('error', (log) => {
            console.log(`error:  ${log}`)
        })
}

// handles a request event and sends the response to the contract
function handler(id, recipient, entity, query) {
    let url = monitorServer + entity+'/';
    request(url, function(error, response, body) {
        if(error)
            console.log("error: " + error)

        console.log("status code: " + response.statusCode);
        let wx = JSON.parse(body);
        let traffic = Math.round(wx.value);
        console.log("Traffic (MB): " + traffic);
        debugger;
        web3.eth.sendTransaction({
          from: account,
          to: recipient,
          data: web3.eth.abi.encodeFunctionCall({
            name: '__oracleCallback',
            type: 'function',
            inputs: [{
                type: 'uint256',
                name: '_response'
              },{
                type: 'string',
                name: '_entity'
            }]
          }, [traffic,entity]),
          gas: web3.utils.numberToHex(300000)
        })
        .then(function(result) {
            console.log("EVM call result: " + result)
        }, function(error) {
            console.log("error "  + error)
        })


    })
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
