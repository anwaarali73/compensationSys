import React, { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Link } from '../routes';
const AddressStore = require('../stores/AddressStore');
const AddressActions = require('../actions/AddressActions');



//import loadAddress from './wrapper'
//import { clientID, providerID, getWallet, entity } from '../ethereum/identity';

class CampaignIndex extends Component {

  static async getInitialProps(props) {
    console.log('Hi');
    //const accounts = await web3.eth.getAccounts();
    //console.log(accounts);
    const address = AddressStore.getState().address;
    console.log('State Address:'+ address);
    //const myAddress = props.query.myaddress;
    //console.log(myAddress);
    console.log(factory.factoryInstance.options.address);

    const wallet = await factory.wallet();
    //console.log(wallet);
    console.log(factory.entity.provider);
    const providerContracts = await factory.factoryInstance.methods
      .getDeployedContractsbyProvider()
      //.call({from: wallet[factory.entity.provider].address});
      .call({from: address});
    console.log(providerContracts);
    const clientContracts = await factory.factoryInstance.methods
      .getDeployedContractsbyClient()
      //.call({from: wallet[factory.entity.provider].address});
      .call({from: address});
    console.log(clientContracts);
    //const providerContracts = [];
    //const clientContracts = [];
    return { myAddress:address, providerContracts:providerContracts, clientContracts:clientContracts };

    //return {};
  }


  renderProviderCampaigns() {
    const items = this.props.providerContracts.map(address => {
      return {
        header: address,
        description: (
          <Link route={`/contracts/${address}`}>
            <a>View Contract</a>
          </Link>
        ),
        fluid: true
      };
    });

    return <Card.Group items={items} />;
  }

  renderClientCampaigns() {
    const items = this.props.clientContracts.map(address => {
      return {
        header: address,
        description: (
          <Link route={`/contracts/${address}`}>
            <a>View Contract</a>
          </Link>
        ),
        fluid: true
      };
    });

    return <Card.Group items={items} />;
  }

  render() {

    return (
      <Layout>
        <div>
          <h3>Active Internet Access Contracts</h3>

          <Link route="/contracts/new">
            <a>
              <Button
                floated="right"
                content="Create a Provider Contract"
                icon="add circle"
                primary
              />
            </a>
          </Link>

          <h4>Active Provider Contracts</h4>
          {this.renderProviderCampaigns()}
          <h4>Active Client Contracts</h4>
          {this.renderClientCampaigns()}
        </div>
      </Layout>
    );
  }

  componentDidMount() {

  }

}

//export default loadAddress()(CampaignIndex);
export default CampaignIndex;
