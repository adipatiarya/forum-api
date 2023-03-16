const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetReply = require('../../../Domains/replies/entities/GetReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThreadUseCase = require('../DetailThreadUsaCase');

describe('Detail Thread usecase', () => {
  it('Should orchestrating detail thread use case', async () => {
    /** ARANGE */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    const expectedThread = {
      id: 'thread-123',
      title: 'title',
      body: 'body',
      date: 'date',
      username: 'dicoding',
      comments: [{
        id: 'comment-123',
        username: 'dicoding',
        date: 'date',
        replies: [new GetReply({
          id: 'reply-123', username: 'you', date: 'date', content: 'abc',
        })],
        content: 'abc',
      }],
    };

    mockThreadRepository.verifyThreadExist = jest.fn().mockImplementation();
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(
      () => Promise.resolve({
        id: 'thread-123', title: 'title', body: 'body', date: 'date', username: 'dicoding',
      }),
    );
    // mengembalikan return array
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockImplementation(
      () => Promise.resolve([{
        id: 'comment-123', username: 'dicoding', date: 'date', content: 'abc', is_deleted: 'false',
      }]),
    );
    // mengembalikan return array
    mockReplyRepository.getRepliesByCommentId = jest.fn().mockImplementation(
      () => Promise.resolve([{
        id: 'reply-123', username: 'you', date: 'date', content: 'abc', is_deleted: 'false',
      }]),
    );

    /** ARRANGE */

    // Action
    const detailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const result = await detailThreadUseCase.execute('thread-123');

    expect(result).toStrictEqual(expectedThread);
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-123');
  });
});
