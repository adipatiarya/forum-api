const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(owner, { content, threadId }) {
    await this._threadRepository.verifyThreadExist(threadId);

    const comment = new AddComment({ content, threadId });
    return this._commentRepository.addComment(owner, comment);
  }
}

module.exports = AddCommentUseCase;
