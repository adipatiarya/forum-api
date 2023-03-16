const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(owner, useCasePayload) {
    const thread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(owner, thread);
  }
}

module.exports = AddThreadUseCase;
