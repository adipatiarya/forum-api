const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('Delete Reply UseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.verifyReplyExist = jest.fn().mockImplementation();
    mockReplyRepository.verifyReplyOwner = jest.fn().mockImplementation();
    mockReplyRepository.deleteReplyById = jest.fn().mockImplementation();

    const deleteReply = new DeleteReplyUseCase({ replyRepository: mockReplyRepository });
    await deleteReply.execute('reply-123', 'user-123');
    expect(mockReplyRepository.verifyReplyExist).toBeCalledWith('reply-123');
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith('reply-123', 'user-123');
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith('reply-123');
  });
});
