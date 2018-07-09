import React, { Component } from 'react';
import { Form, Input, Message, Button } from 'semantic-ui-react';
const EthCrypto = require('eth-crypto');


class DecryptForm extends Component {
  state = {
    decrypted: '',
    privKey: ''
  }

  onSubmit = async event => {
    event.preventDefault();
    console.log('Encrypted String: '+this.props.encryptedString)
    const encryptedObject = EthCrypto.cipher.parse(this.props.encryptedString);

    const decrypted = await EthCrypto.decryptWithPrivateKey(
        this.state.privKey,
        encryptedObject
    );

    this.setState({decrypted: JSON.parse(decrypted).message});
  }

  render() {
    return(
      <div>
      <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
        <Form.Field>
          <label>Private Key</label>
          <Input
            value={this.state.privKey}
            //placeholder={"Minimum "+this.props.min}
            onChange={event => this.setState({ privKey: event.target.value.toString() })}
            label="hex"
            labelPosition="right"
          />
        </Form.Field>

        <Message error header="Oops!" content={this.state.errorMessage} />
        <Button primary loading={this.state.loading}>
          Decrypt Ticket!
        </Button>
      </Form>
      <h4>The ticket is: {this.state.decrypted}</h4>
      </div>
    );
  }
}

export default DecryptForm;
