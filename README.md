# Mesh Wifi Dapp
This project is an ethereum Dapp that can be used for creating and interacting with smart contracts that are related to providing Internet access.

The initial code of this project is based on the  [Kickstart](https://github.com/StephenGrider/EthereumCasts) repository by Stephen Grider.

## Instalation
```git clone https://github.com/emmdim/MeshWifiDapp.git && cd MeshWifiDapp
npm install
```

## Setting up development environment
### Compling and deploying oracle
(For doubts also consult [tinyOracle](https://github.com/axic/tinyoracle) project) 
1. Compile and deploy ``OracleDispatch`` and ``OracleLookup``
2. Change the lookup address in the ``OracleAPI.sol``
3. Compile and deploy ``OracleTest``

**The addresses of the deployed contracts are stored in the addresses.json file**

### Oracle server
Start oracle server
```node oracle.js```

### Dummy Monitoring
In a temp directory do:
```npm init
npm install --save json-server
```
In the same directory create a ``db.json`` file with dummy monitor values. Example
```
{
        "monitor": [
                {"id": "client", "value": "10"},
                {"id": "provider", "value": "60"}]
}
```

## Deploying a smart contract

``cd ethereum && node compile.js && node deploy.js ``


## Running scripts
* To test: ``npm test``
* To run next development server: ``npm dev`` and navigate to [http://localhost:3000](http://localhost:3000)
* To run in production: ``npm start`` and navigate to [http://localhost:3000](http://localhost:3000)
