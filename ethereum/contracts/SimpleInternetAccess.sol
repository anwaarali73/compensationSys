/*
Deposit-based Internet Access Contract.
Steps:
1) Provider Initiates Contract for a concrete client given
a maximim amount of data to be consumed and a pricer per MB
2) Client accepts the contract accepting the terms and depositing
at least maxData*pricePerMB in the contract
3) Provider stores in the contract a passhprase for accessing the Connection
encrypted with the public key of the client
4) After connection is established the involved parties are resposnible for
invoking queries to the Oracle concenring the monitoring values of the usage
5) The monitoring usage values of the client and the provider are comapred
and depending on the outcome of the comparison a fraction or all the deposited
amount is transfered to the provider and a notification is send for renegotiation
of new contract. If the monitoring values of the different parties do not aggree
then an external conflict resolution process is initiated.
*/
pragma solidity ^0.4.23;
import "OracleAPI.sol";


contract SimpleInternetAccess is usingOracle {
    struct Person {
      address wallet;
      string ip;
      string monitor;
      uint monitoredUsage;
      bytes32 pubKey;
    }

    Person public provider;
    Person public client;
    string public ticket;
    uint public maxData;
    uint public pricePerMB;
    uint activationTime;
    bool public accepted = false;
    event LogContractCreated(address provider, uint maxData, uint pricePerMB);
    event LogClientAccepted(address client, bytes32 pubkey);
    event LogActivation(string ticket, string providerIP, uint activationTime);
    event LogRenegotiate(uint debt);
    event LogRemainingData(uint remainingData);

    constructor(address _client, string _providerIP, string _providerMonitor, uint _maxData,  uint _priceperMB, address creator) public {
        // Constructor
        //The provider creates a contract with the proposed maximum amount of data and price,
        //the IP address of his monitoring service as well as the client address.
        provider.wallet = creator;
        provider.ip = _providerIP;
        maxData = _maxData;
        pricePerMB = _priceperMB;
        provider.monitor = _providerMonitor;
        client.wallet = _client;
        emit LogContractCreated(provider.wallet, maxData, pricePerMB);
    }

    function acceptContract(string _clientMonitor, bytes32 _pubKey) public payable {
        //The client accepts the contract providing an amount higher than the
        //maximum value of the contract (maxData*pricePerMB)
        require(client.wallet == msg.sender  && msg.value > maxData*pricePerMB);
        client.monitor = _clientMonitor;
        client.pubKey = _pubKey;
        accepted = true;
        emit LogClientAccepted(client.wallet, client.pubKey);
    }

    function provideTicket(string newTicket) public {
        //After the contract is accepted by the client the provider store a ticket
        //in the contract encrypted with the public key of the client
        //The activation time is stored.
        require(msg.sender == provider.wallet);
        activationTime = now;
        ticket = newTicket;
        emit LogActivation(newTicket, provider.ip, activationTime);
    }

    function checkUsage() public {
        //The provider or the client can initiate the process to check the usage.
        //An oracle is being used to retrieve the values from the monitoring
        //services.
        // Alternatively DELAYS can be used to automatically check usage
        // periodically see: https://github.com/johnhckuo/Oraclize-Tutorial
        require(msg.sender == provider.wallet || msg.sender == client.wallet);
        //require(clientMonitor != null && providerMonitor != null)
        queryOracle('client',client.monitor);
        queryOracle('provider',provider.monitor);

    }

    function __oracleCallback(uint _response, string _entity) onlyFromOracle public {
        // Callback to recieve the monitoring values and trigger usageResult()
        if (compareStrings(_entity,'client')){
            client.monitoredUsage = _response;
            usageResult();
        }
        if (compareStrings(_entity,'provider')){
            provider.monitoredUsage = _response;
            usageResult();
        }
    }

    function usageResult() private {
        //This function checks the usage and accordingly
        //1) Transfers the money of the client to provider
        //2) Notifies for the necessity of a new contract, including client debts
        //3) If maxData is not reached the amount of remaining data is pushed in the log
        //4) Function to solve dispute should be called

        //TODO Think of a better way to find if both measurements are updated
        require(client.monitoredUsage !=0 && provider.monitoredUsage !=0);
        if (client.monitoredUsage == provider.monitoredUsage) {
            if (client.monitoredUsage >= maxData) {
                uint totalAmount = client.monitoredUsage*pricePerMB;
                if (address(this).balance >= totalAmount){
                    (provider.wallet).transfer(totalAmount);
                    (client.wallet).transfer(address(this).balance);
                    emit LogRenegotiate(0);
                }
                else
                {
                    uint debt = totalAmount-address(this).balance;
                    (provider.wallet).transfer(address(this).balance);
                    emit LogRenegotiate(debt);
                }
                selfdestruct(client.wallet);
            }
            else{
                uint remaining = maxData - client.monitoredUsage;
                emit LogRemainingData(remaining);
            }
        }
        else{
            // DISPUTE TO SOLVE
        }
    }

    function getUsers() public view returns (
      address, string, string, uint, bytes32,
      address, string, string, uint, bytes32
      ) {
        return (
          provider.wallet,
          provider.ip,
          provider.monitor,
          provider.monitoredUsage,
          provider.pubKey,
          client.wallet,
          client.ip,
          client.monitor,
          client.monitoredUsage,
          client.pubKey
        );
    }

    function getSummary() public view returns (
      uint, uint, uint, bool, string, uint
      ) {
        return (
          maxData,
          pricePerMB,
          activationTime,
          accepted,
          ticket,
          address(this).balance
        );
    }

    function kill() public {
      if (accepted){
        selfdestruct(client.wallet);
      }
      else{
         selfdestruct(provider.wallet);
      }
    }

    function compareStrings (string a, string b) public pure  returns (bool){

       return keccak256(bytes(a)) == keccak256(bytes(b));
   }
}
