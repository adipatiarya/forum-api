/* eslint-disable max-len */
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment correctly', async () => {
    // Arange
    const id = 'comment-123';
    const owner = 'user-123';
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentExist = jest.fn().mockImplementation();
    mockCommentRepository.verifyCommentOwner = jest.fn().mockImplementation();
    mockCommentRepository.deleteCommentById = jest.fn().mockImplementation();
    const deleteCommentUseCase = new DeleteCommentUseCase({ commentRepository: mockCommentRepository });
    await deleteCommentUseCase.execute(id, owner);

    // Expect
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith(id);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(id, owner);
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(id);
  });
});
