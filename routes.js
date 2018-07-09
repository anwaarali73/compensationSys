const routes = require('next-routes')();

routes
  .add('/show','/show')
  .add('/contracts/new', '/contracts/new')
  .add('/contracts/:address', '/contracts/show')
  .add('/contracts/:address/requests', '/contracts/requests/index')
  .add('/contracts/:address/requests/new', '/contracts/requests/new');

module.exports = routes;
