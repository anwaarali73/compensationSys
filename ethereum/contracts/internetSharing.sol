pragma solidity ^0.4.24;
import "OracleAPI.sol";


contract SimpleInternetAccess is usingOracle {
    struct Person {   // A better name for it would be 'entity'
      address wallet;
      string ip;
      string monitor;   // Does this imply that the providers is running its own monitoring service and it is accessible via an Oracle?
      uint monitoredUsage;
    }

    Person public provider;
    Person public client;
    string public ticket;
    uint public maxData;
    uint public pricePerMB;
    uint activationTime;   // Since this is not set as 'public', seems to imply that its part of a policy at 'managerial' level?
    mapping(bytes32=>bool) validIds;
    bytes32 public oraclizeIDClient;
    bytes32 public oraclizeIDProvider;
    bool public accepted = false;
    event LogContractCreated(address provider, uint maxData, uint pricePerMB);
    event LogClientAccepted(bool accepted);
    event LogActivation(string ticket, string providerIP, uint activationTime);
    event LogRenegotiate(uint debt);
    event LogRemainingData(uint remainingData);

    constructor(address _client, string _providerIP, string _providerMonitor, uint _maxData,  uint _priceperMB) public {
        // Constructor
        //The provider creates a contract with the proposed maximum amount of data and price,
        //the IP address of his monitoring service as well as the client address.
        provider.wallet = msg.sender;
        provider.ip = _providerIP;
        maxData = _maxData;
        pricePerMB = _priceperMB;
        provider.monitor = _providerMonitor;
        client.wallet = _client;
        emit LogContractCreated(provider.wallet, maxData, pricePerMB);
    }

    function acceptContract(string _clientMonitor) public payable {
        //The client accepts the contract providing an amount higher than the
        //maximum value of the contract (maxData*pricePerMB)
        require(client.wallet == msg.sender  && msg.value > maxData*pricePerMB);
        client.monitor = _clientMonitor;
        accepted = true;
        emit LogClientAccepted(accepted);
    }

    function provideTicket(string newTicket) public {
        //After the contract is accepted by the client the provider stores a ticket
        //in the contract encrypted with the public key of the client
        //The activation time is stored.
        require(msg.sender == provider.wallet);
        activationTime = now;
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

    function compareStrings (string a, string b) public pure  returns (bool){

       return keccak256(bytes(a)) == keccak256(bytes(b));
   }
}
