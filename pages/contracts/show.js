import React, { Component } from 'react';
import { Form, Card, Grid, Button, Message, Popup, Icon } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import factory from '../../ethereum/factory';
import web3 from '../../ethereum/web3';
import AcceptForm from '../../components/web3/AcceptForm';
import SendTicket from '../../components/web3/SendTicket';
import DecryptForm from '../../components/DecryptForm'
import { Link, Router } from '../../routes';
const AddressStore = require('../../stores/AddressStore');

const zeroAddress = "0x0000000000000000000000000000000000000000000000000000000000000000";

class CampaignShow extends Component {
  state = {
    errorMessage: '',
    popUp: false,
  }

  static async getInitialProps(props) {
    const contract = await factory.internetContractInstance(props.query.address);
    const summary = await contract.methods.getSummary().call();
    const users = await contract.methods.getUsers().call();
    const myAddress = AddressStore.getState().address;
    console.log('State Address '+myAddress);
    console.log('Client Address '+ users[5]);
    console.log('PubKey'+users[9]);
    console.log(typeof summary[4]);
    let date = new Date(0); // The 0 there is the key, which sets the date to the epoch
    date.setUTCSeconds(summary[2]);

    return {
      provider: {
        wallet: users[0],
        ip: users[1],
        monitor: users[2],
        monitoredUsage: users[3],
        pubKey: users[4]
      },
      client: {
        wallet: users[5],
        ip: users[6],
        monitor: users[7],
        monitoredUsage: users[8],
        pubKey: users[9]
      },
      myAddress: myAddress,
      address: props.query.address,
      maxData: summary[0],
      pricePerMB: summary[1],
      activationTime: date.toUTCString(),
      accepted: (summary[3] ? 'True' : 'False') ,
      ticket: summary[4],
      balance: summary[5],
      isClient: (users[5].slice(2).toUpperCase()==myAddress.slice(2).toUpperCase() ? true : false),
    };
  }

  /*
  async componentDidMount() {
    this.entity = undefined;
    if (this.props.provider.wallet==this.props.myAddress) {
      this.entity = 'provider';
    }
    else if (this.props.client.wallet==this.propspmyAddress) {
      this.entity = 'client';
    }
  }*/

  renderCards() {
    const {
      client,
      address,
      maxData,
      pricePerMB,
      activationTime,
      accepted,
      balance,
      ticket
    } = this.props;

    const items = [
      //TODO fill all items. How to deal with objects?
      {
        header: maxData,
        meta: 'maxData',
        description:
        '',
      },
      {
        header: pricePerMB,
        meta: 'pricePerMB',
        description:
        '',
      },
      {
        header: activationTime,
        meta: 'activationTime',
        description:
        '',
      },
      {
        header: accepted,
        meta: 'accepted',
        description:
        '',
      },
      {
        header: web3.utils.fromWei(balance, 'ether'),
        meta: 'Contract Balance (ether)',
        description:
          'The balance is how much money this campaign has left to spend.'
      }
    ];

    if (this.props.accepted=="True" && this.props.isClient &&
        this.props.ticket) {
          items.push({
            header: ticket.slice(0,4)+'...',
            meta: 'Encrypted ticket',
            description:
              '',
            onClick: this.onCardClick,
          })
        }

    return <Card.Group items={items} />;
  }

  renderAccept() {
    if (this.props.accepted=="False" && this.props.isClient) {
      return   <Grid.Column width={6}>
                <AcceptForm address={this.props.address}
                min={this.props.maxData*this.props.pricePerMB}
                myAddress={this.myAddress} />
                  </Grid.Column>;
    }
    else {
      return (null);
    }
  }

  renderSendTicket() {
    if (this.props.accepted=="True" &&
        !this.props.isClient &&
        !this.props.ticket) {
      return    <Grid.Column width={6}>
                <SendTicket address={this.props.address}
                pubKey={this.props.client.pubKey}
                myAddress={this.myAddress} />
                </Grid.Column>;
    }
    else {
      return (null);
    }
  }



  onKill = async event => {
    event.preventDefault();
    this.setState({errorMessage: '' });
    try {
      const contract = await factory.internetContractInstance(this.props.address);
      await contract.methods.kill()
      .send({
        from: this.props.myAddress,
        gas:300000
      })
      .on('error', console.error);
      Router.pushRoute(`/show`);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }
  };

  onCardClick = async event => {
    event.preventDefault();
    this.setState({errorMessage: '' });
    try {
      this.setState({popUp: true})
      console.log('Card Clicked');
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }
  };

  handleClose = () => {
   this.setState({ popUp: false });
 }

  render() {
    return (
      <Layout>
        <h3>Internet Access Contract</h3>
        <h4>You are {this.props.isClient ? 'client' : 'provider'} of the following contract:</h4>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>{this.renderCards()}</Grid.Column>

            {this.renderAccept()}
            {this.renderSendTicket()}

          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
            <Form onSubmit={this.onKill} error={!!this.state.errorMessage}>
            <Button
              floated="left"
              content="Kill Contract"
              icon="remove circle"
              disabled
              primary
            />
            <Message error header="Oops!" content={this.state.errorMessage} />
            </Form>
            </Grid.Column>
          </Grid.Row>
          <Popup open={this.state.popUp}>
            <Popup.Header>Decrypt Ticket</Popup.Header>
            <Popup.Content>
              <div>
              <Icon onClick={this.handleClose} name="remove circle"/>
              <DecryptForm encryptedString={this.props.ticket}/>
              </div>
            </Popup.Content>
          </Popup>
        </Grid>


      </Layout>
    );
  }
}

export default CampaignShow;
