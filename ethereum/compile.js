/*
Compile script
RESTRICTION: Stores in JSON only the contract that has the same name as .sol file
*/
const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');
const repl = require('repl');

const buildPath = path.resolve(__dirname, 'build');
const contractsPath = path.resolve(__dirname, 'contracts');

const readyContracts = ["OracleTest.sol","OracleDispatch.sol","OracleLookup.sol"]

fs.removeSync(buildPath);
fs.ensureDirSync(buildPath);

let input = readyContracts.map((a) => {
    cpath = path.resolve(contractsPath,a);
    return fs.readFileSync(cpath,'utf8');
  }).reduce(function(result, item, index, array) {
  result[readyContracts[index]] = item; //a, b, c
  return result;
}, {});

let output = solc.compile({ sources : input }, 1, findImports);
if ('errors' in output){
  console.log('ERROR:');
  throw output.errors.reduce((a,b) => a+'\n'+b);
}

let contracts = output.contracts;
// From each compile contract store only the part of the contract
//itself and not the imports
compiledContracts = readyContracts.map((a) => a+':'+a.replace('.sol',''));
for (let i in compiledContracts) {
  fs.outputJsonSync(
    path.resolve(buildPath, compiledContracts[i].split(':')[1] + '.json'),
    contracts[compiledContracts[i]]);
}

function findImports (_file) {
  let contractPath = path.resolve(contractsPath, _file);
  let source = fs.readFileSync(contractPath, 'utf8');
  return { contents: source }
}
