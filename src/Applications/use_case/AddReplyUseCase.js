const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(owner, payload) {
    await this._threadRepository.verifyThreadExist(payload.threadId);
    await this._commentRepository.verifyCommentExist(payload.commentId);

    const reply = new AddReply(payload);
    return this._replyRepository.addReply(owner, reply);
  }
}

module.exports = AddReplyUseCase;
