const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: (req, h) => handler.postReplyHandler(req, h),
    options: {
      auth: 'forumapi_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
    handler: (req) => handler.deleteReplyHandler(req),
    options: {
      auth: 'forumapi_jwt',
    },
  },
]);
module.exports = routes;
