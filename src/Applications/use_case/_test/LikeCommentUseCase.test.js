const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  it('Mengorkrestasi like', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();
    const owner = 'user-id';
    const useCasePayload = {
      threadId: 'thread-id',
      commentId: 'comment-id',
    };

    mockThreadRepository.verifyThreadExist = jest.fn();
    mockCommentRepository.verifyCommentExist = jest.fn();
    mockLikeRepository.like = jest.fn();

    const likeUseCase = new LikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    await likeUseCase.execute(useCasePayload, owner);
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-id');
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith('comment-id');
    expect(mockLikeRepository.like).toBeCalledWith('comment-id', 'user-id');
  });
});
