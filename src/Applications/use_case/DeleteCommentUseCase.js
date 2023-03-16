class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(id, owner) {
    await this._commentRepository.verifyCommentExist(id);
    await this._commentRepository.verifyCommentOwner(id, owner);
    await this._commentRepository.deleteCommentById(id);
  }
}
module.exports = DeleteCommentUseCase;
