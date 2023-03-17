/* eslint-disable no-underscore-dangle */

const LikeCommentUseCase = require('../../../../Applications/use_case/LikeCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;
  }

  async putLikeHandler(request) {
    const { id: owner } = request.auth.credentials;
    const likeCommentCase = this._container.getInstance(LikeCommentUseCase.name);
    await likeCommentCase.execute(request.params, owner);
    return {
      status: 'ok',
    };
  }
}
module.exports = LikesHandler;
