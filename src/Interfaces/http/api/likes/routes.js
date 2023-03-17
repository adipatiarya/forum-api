const routes = (handler) => ([
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentId}/likes',
    handler: (req) => handler.putLikeHandler(req),
    options: {
      auth: 'forumapi_jwt',
    },
  },
]);
module.exports = routes;
