import React, { Component } from 'react';
import { Form, Input, Message, Button } from 'semantic-ui-react';
import factory from '../../ethereum/factory';
import { Router } from '../../routes';
import web3 from '../../ethereum/web3';
const EthCrypto = require('eth-crypto');
const AddressStore = require('../../stores/AddressStore');

class AcceptForm extends Component {
  state = {
    tokens: '',
    monitor: '',
    pubKey: '',
    errorMessage: '',
    loading: false
  };

  onSubmit = async event => {
    event.preventDefault();

    const contract = await factory.internetContractInstance(this.props.address);

    this.setState({ loading: true, errorMessage: '' });

    try {
      let pubKey = EthCrypto.publicKey.compress(this.state.pubKey).slice(2);
      await contract.methods.acceptContract(this.state.monitor, '0x'+pubKey)
      .send({
        from: AddressStore.getState().address,
        value: web3.utils.toWei(this.state.tokens, 'ether'),
        gas:300000
      })
      .on('error', console.error);

      Router.replaceRoute(`/contracts/${this.props.address}`);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false, tokens: '' });
  };

  render() {
    return (
      <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
        <Form.Field>
          <label>Tokens</label>
          <Input
            value={this.state.tokens}
            placeholder={"Minimum "+this.props.min}
            onChange={event => this.setState({ tokens: event.target.value })}
            label="ether"
            labelPosition="right"
          />
        </Form.Field>
        <Form.Field>
          <label>Monitor URL</label>
          <Input
            value={this.state.monitor}
            placeholder="http://"
            onChange={event => this.setState({ monitor: event.target.value.toString() })}
            label="url"
            labelPosition="right"
          />
        </Form.Field>
        <Form.Field>
          <label>Your Public Key</label>
          <Input
            value={this.state.pubKey}
            //placeholder=""
            onChange={event => this.setState({ pubKey: event.target.value.toString() })}
            label="hex"
            labelPosition="right"
          />
        </Form.Field>


        <Message error header="Oops!" content={this.state.errorMessage} />
        <Button primary loading={this.state.loading}>
          Accept Contract!
        </Button>
      </Form>
    );
  }
}

export default AcceptForm;
