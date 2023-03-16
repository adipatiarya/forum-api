class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(id, owner) {
    await this._replyRepository.verifyReplyExist(id);
    await this._replyRepository.verifyReplyOwner(id, owner);
    await this._replyRepository.deleteReplyById(id);
  }
}
module.exports = DeleteReplyUseCase;
