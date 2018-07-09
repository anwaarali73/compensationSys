import React, { Component } from 'react';
import { Form, Input, Message, Button } from 'semantic-ui-react';
import factory from '../../ethereum/factory';
import { Router } from '../../routes';
import web3 from '../../ethereum/web3';
const EthCrypto = require('eth-crypto');
const AddressStore = require('../../stores/AddressStore');


async function encryptMessage(secretMessage, publicKey, providerPrivateKey){
  const signature = EthCrypto.sign(
    providerPrivateKey,
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

class SendTicket extends Component {
  state = {
    ticket: '',
    privKey: '',
    errorMessage: '',
    loading: false
  };

  onSubmit = async event => {
    event.preventDefault();

    const contract = await factory.internetContractInstance(this.props.address);
    console.log('SendTicket::pubKey:'+this.props.pubKey);

    this.setState({ loading: true, errorMessage: '' });

    try {
      const pubKey = EthCrypto.publicKey.decompress('02'+this.props.pubKey.slice(2));
      const encryptedString = await encryptMessage(this.state.ticket, pubKey, this.state.privKey);
      await contract.methods.provideTicket(encryptedString)
        .send({from: AddressStore.getState().address, gas:3000000})
        .on('error', console.error);
      Router.replaceRoute(`/contracts/${this.props.address}`);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false, ticket: '' });
  };

  render() {
    return (
      <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
      <Form.Field>
        <label>Your Private Key(not stored)</label>
        <Input
          value={this.state.privKey}
          //placeholder="Random String"
          onChange={event => this.setState({ privKey: event.target.value.toString() })}
          label="hex"
          labelPosition="right"
        />
      </Form.Field>
        <Form.Field>
          <label>Ticket</label>
          <Input
            value={this.state.ticket}
            //placeholder="Random String"
            onChange={event => this.setState({ ticket: event.target.value.toString() })}
            label="txt"
            labelPosition="right"
          />
        </Form.Field>

        <Message error header="Oops!" content={this.state.errorMessage} />
        <Button primary loading={this.state.loading}>
          Send Ticket!
        </Button>
      </Form>
    );
  }
}

export default SendTicket;
