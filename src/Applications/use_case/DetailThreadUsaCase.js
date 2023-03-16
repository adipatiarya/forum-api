/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
const GetComment = require('../../Domains/comments/entities/GetComment');
const GetReply = require('../../Domains/replies/entities/GetReply');

class DetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExist(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(thread.id);

    return new Promise((resolve) => {
      Promise.all(comments.map(async (comment) => {
        const newComment = new GetComment(comment);

        const getRepliesByComment = await this._replyRepository.getRepliesByCommentId(newComment.id);

        const {
          id, username, date, content,
        } = newComment;

        const replies = getRepliesByComment.map((reply) => new GetReply(reply));
        return {
          id, username, date, replies, content,
        };
      })).then((s) => resolve({ ...thread, comments: s }));
    });
  }
}

module.exports = DetailThreadUseCase;
