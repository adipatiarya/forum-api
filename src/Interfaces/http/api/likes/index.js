const routes = require('./routes');
const Handler = require('./handler');

module.exports = {
  name: 'likes',
  register: async (server, { container }) => {
    const handler = new Handler(container);
    server.route(routes(handler));
  },
};
