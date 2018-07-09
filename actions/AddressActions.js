var alt = require('../alt');

class AddressActions {
  updateAddress(address) {
    return address;
  }
}

module.exports = alt.createActions(AddressActions);
