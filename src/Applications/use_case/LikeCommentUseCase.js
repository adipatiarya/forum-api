class LikeCommentUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(param, owner) {
    await this._threadRepository.verifyThreadExist(param.threadId);
    await this._commentRepository.verifyCommentExist(param.commentId);
    await this._likeRepository.like(param.commentId, owner);
  }
}

module.exports = LikeCommentUseCase;
