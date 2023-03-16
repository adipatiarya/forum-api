const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: (req, h) => handler.postThreadHandler(req, h),
    options: {
      auth: 'forumapi_jwt',
    },
  },
  {
    method: 'GET',
    path: '/threads/{id}',
    handler: (req) => handler.getDetailThreadHandler(req),
  },
]);
module.exports = routes;
