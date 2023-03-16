const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{id}/comments',
    handler: (req, h) => handler.postCommentHandler(req, h),
    options: {
      auth: 'forumapi_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{id}/comments/{commentId}',
    handler: (req) => handler.deleteCommentHandler(req),
    options: {
      auth: 'forumapi_jwt',
    },
  },
]);
module.exports = routes;
