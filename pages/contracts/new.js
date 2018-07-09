import React, { Component } from 'react';
import { Form, Button, Input, Message } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import factory from '../../ethereum/factory';
import web3 from '../../ethereum/web3';
import { Router } from '../../routes';
const AddressStore = require('../../stores/AddressStore');

class CampaignNew extends Component {
  static async getInitialProps() {
    //const thewallet = await factory.wallet();
    //const _entity = factory.entity;
    //const address = thewallet[_entity.provider].address
    const address = AddressStore.getState().address;
    const temp = await factory.factoryInstance;
    const factoryContract = {
      address: temp.options.address,
      abi: temp.options.jsonInterface
    }
    //console.log(_factoryContract);
    //return {mywallet:_wallet, factoryContract:_factoryContract, entity:_entity};
    return {address:address,factoryContract:factoryContract,};
  }

  state = {
    client: '',
    providerIP: '',
    providerMonitor: '',
    maxData: 0,
    pricePerMB: 0,
    errorMessage: '',
    loading: false
  };

  onSubmit = async event => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: '' });

    try {
      console.log('My address: '+this.props.address);
      const contract = await new web3.eth.Contract(
        this.props.factoryContract.abi,
        this.props.factoryContract.address
      );
      contract.methods
        .createContract(this.state.client,
          '\"'+this.state.providerIP+'\"',
          '\"'+this.state.providerMonitor+'\"',
          parseInt(this.state.maxData),
          parseInt(this.state.pricePerMB)
        )
        .send({
          from: this.props.address,
          gas: '3000000'
        });
      Router.pushRoute('/show');
    } catch (err) {
      console.error(err);
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false });
  };

  render() {
    return (
      <Layout>
        <h3>Create a Campaign</h3>
        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Form.Field>
            <label>Client</label>
            <Input
              label="Address"
              labelPosition="right"
              value={this.state.client}
              onChange={event =>
                this.setState({ client: event.target.value })}
            />
          </Form.Field>
          <Form.Field>
            <label>Provider IP</label>
            <Input
              label="IP"
              labelPosition="right"
              value={this.state.providerIP}
              onChange={event =>
                this.setState({ providerIP: event.target.value.toString() })}
            />
          </Form.Field>
          <Form.Field>
            <label>Provider Monitor</label>
            <Input
              label="URL"
              labelPosition="right"
              value={this.state.providerMonitor}
              onChange={event =>
                this.setState({ providerMonitor: event.target.value.toString() })}
            />
          </Form.Field>
          <Form.Field>
            <label>Maximum Data</label>
            <Input
              label="MB"
              labelPosition="right"
              value={this.state.maxData}
              onChange={event =>
                this.setState({ maxData: event.target.value })}
            />
          </Form.Field>
          <Form.Field>
            <label>Data Price per MB</label>
            <Input
              label="GuifiCoin"
              labelPosition="right"
              value={this.state.pricePerMB}
              onChange={event =>
                this.setState({ pricePerMB: event.target.value })}
            />
          </Form.Field>

          <Message error header="Oops!" content={this.state.errorMessage} />
          <Button loading={this.state.loading} primary>
            Create!
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default CampaignNew;
