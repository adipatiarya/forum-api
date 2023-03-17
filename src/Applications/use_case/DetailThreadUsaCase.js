/* eslint-disable max-len */
const GetComment = require('../../Domains/comments/entities/GetComment');
const GetReply = require('../../Domains/replies/entities/GetReply');

class DetailThreadUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExist(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const commentRepo = await this._commentRepository.getCommentsByThreadId(thread.id);

    const args = commentRepo.map((comment) => comment.id);

    const replyRepo = await this._replyRepository.getRepliesByCommentId(args);
    const likeRepo = await this._likeRepository.count(args);

    const comments = commentRepo.map((comment) => {
      const newComment = new GetComment(comment);
      const replies = replyRepo.filter((reply) => reply.comment_id === newComment.id).map((r) => new GetReply(r));
      const likeCount = likeRepo.filter((like) => like.comment_id === newComment.id).length;

      const {
        id, username, date, content,
      } = newComment;
      return {
        id, username, date, replies, content, likeCount,
      };
    });

    return { ...thread, comments };
  }
}

module.exports = DetailThreadUseCase;
