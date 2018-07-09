var alt = require('../alt');
var AddressActions = require('../actions/AddressActions');

class AddressStore {
  constructor() {
    this.address = undefined;

    this.bindListeners({
      handleUpdateAddress: AddressActions.UPDATE_ADDRESS
    });
  }

  handleUpdateAddress(address) {
    this.address = address;
  }
}

module.exports = alt.createStore(AddressStore, 'AddressStore');
