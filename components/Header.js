import React, { Component } from 'react';
import { Menu, Button, Message, Icon, Label } from 'semantic-ui-react';
import { Link, Router } from '../routes';
import web3 from '../ethereum/web3';
const AddressStore = require('../stores/AddressStore');
const AddressActions = require('../actions/AddressActions');


class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      myAddress: AddressStore.getState().address,
      loading: false
    }
  }

  onUpdate = async event => {
    event.preventDefault();
    try {
      this.setState({ loading: true});
      await window.web3.eth.getAccounts((error, accounts) => {

        // Do whatever you need to.
        this.setState({myAddress: accounts[0]});
        AddressActions.updateAddress(accounts[0]);
        this.setState({ loading: false});
        Router.pushRoute(window.location.href);
      });


    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: true, value: '' });
  };

  async componentDidMount(): Promise<void> {
    window.web3.eth.getAccounts((error, accounts) => {

      // Do whatever you need to.
      this.setState({myAddress: accounts[0]});
    });

  }

  render() {
    return (
      <Menu style={{ marginTop: '10px' }}>




        <Menu.Item
            name='address'
            position='left'
            //content = {'Address: '+this.state.myAddress}
          >
          <Button as='div' labelPosition='left'>
              <Label as='a' basic color='blue' pointing='right'>
                {'Address: '+this.state.myAddress}
              </Label>
              <Button color='blue' onClick={this.onUpdate}>
                <Icon name='refresh' />
                Update
              </Button>
            </Button>

          </Menu.Item>

        <Menu.Menu position="right">
          <Link route="/show">
            <a className="item">Contracts</a>
          </Link>

          <Link route="/contracts/new">
            <a className="item">+</a>
          </Link>
        </Menu.Menu>
      </Menu>
    );
  }
}

export default Header;
