import React, { Component } from 'react';
import { Grid, Header, Image, Segment, Container, Form, Input, Message, Button,Icon } from 'semantic-ui-react';
//import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import web3 from '../ethereum/web3';
import Head from 'next/head';
import { Link, Router } from '../routes';
const AddressStore = require('../stores/AddressStore');
const AddressActions = require('../actions/AddressActions');

class Login extends Component {
  state = {
    address: '0x0000000000000000000000000000000000000000',
    errorMessage: '',
    loading: true,
  };

  async componentDidMount() {
    console.log(AddressStore.getState())
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    AddressActions.updateAddress(accounts[0]);
    this.setState({address: accounts[0]});
    this.setState({loading: false});
  }

  onSubmit = async event => {
    event.preventDefault();
    try {
      Router.pushRoute(`/show`);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: true, value: '' });
  };

  render() {
    return (
      <div className='login-form'>
      {/*
      Heads up! The styles below are necessary for the correct render of this example.
      You can do same with CSS, the main idea is that all the elements up to the `Grid`
      below must have a height of 100%.
    */}
    <style>{`
      body > div,
      body > div > div,
      body > div > div > div.login-form {
        height: 100%;
      }
    `}</style>
      <Head>
        <link
          rel="stylesheet"
          href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"
        />
      </Head>
    <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 800 }}>
        <Header as='h2' color='teal' textAlign='center'>
          <Icon name="globe" loading={this.state.loading} ></Icon> Log-in to your account with address
        </Header>
        <Form size='large' onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Segment stacked>
            <h2>{this.state.address}</h2>
            <Message error header="Oops!" content={this.state.errorMessage} />
            <Button primary color='teal' fluid size='large' loading={this.state.loading}>
              Login
            </Button>
          </Segment>
        </Form>
        <Message>
        <Link route='/'>
           <Button color='green' >Reload Address</Button>
        </Link>
        </Message>
      </Grid.Column>
    </Grid>
  </div>


      /*
      <Container>
        <Head>
          <link
            rel="stylesheet"
            href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"
          />
        </Head>
      <div>
      <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
        <h2>Login with address {this.state.address}</h2>
        <Message error header="Oops!" content={this.state.errorMessage} />
        <Button primary loading={this.state.loading}>
          Login
        </Button>
      </Form>
      <div>
      <Link route='/'>
         <Button color='green' >Reload Address</Button>
      </Link>
      </div>
      </div>
      </Container>
      */
    );
  }
}

export default Login;
