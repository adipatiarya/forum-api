const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgress', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({}); // user-123
    await ThreadsTableTestHelper.addThread({}); // thread-123
  });
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });
  afterAll(async () => {
    await pool.end();
  });
  describe('getComments By ThreadId func', () => {
    it('should return of length array 0', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const results = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');
      expect(results).toHaveLength(0);
    });
    it('should return of comments', async () => {
      await CommentsTableTestHelper.addComment({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const results = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');
      expect(results).toHaveLength(1);
      expect(results).toEqual([{
        content: 'sebuah komentar',
        date: new Date('2023-03-08T21:25:32.286Z'),
        id: 'comment-123',
        is_deleted: false,
        owner: 'user-123',
        thread_id: 'thread-123',
        username: 'dicoding',
      }]);
    });
  });
  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange

      const owner = 'user-123';
      const comment = new AddComment({
        content: 'sebuah comment',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(owner, comment);

      // Assert
      const results = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(results).toHaveLength(1);
    });
    it('should return added comment correctly', async () => {
      // Arrange

      const owner = 'user-123';
      const comment = new AddComment({
        content: 'sebuah comment',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await commentRepositoryPostgres.addComment(owner, comment);

      // Assert
      expect(result).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'sebuah comment',
        owner: 'user-123',
      }));
    });
  });
  describe('deleteComment', () => {
    it('should delete comment from database', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const id = 'comment-123';
      await CommentsTableTestHelper.addComment({ id });

      // Action
      await commentRepositoryPostgres.deleteCommentById(id);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(id);
      expect(comments).toHaveLength(0);
    });
  });
  describe('verifyCommentExist function', () => {
    it('should throw not notfoundError when comment is available', async () => {
      // arange
      await CommentsTableTestHelper.addComment({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentExist('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
    it('should throw notfoundError when comment is not available', async () => {
      // arange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentExist('comment-123')).rejects.toThrowError(NotFoundError);
    });
  });
  describe('verifyCommentOwner function', () => {
    it('should throw InvariantError when comment is not available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({}); // comment-123 user-123

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-tidakada', 'user-123')).rejects.toThrowError(NotFoundError);
    });
    it('should throw not InvariantError when comment is available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({}); // comment-123 user-123

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrowError(NotFoundError);
    });
    it('should throw AuthorizationError if comment is not created by', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({}); // comment-123 user-123

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-lain')).rejects.toThrowError(AuthorizationError);
    });
    it('should throw not AuthorizationError if comment created by', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({}); // comment-123 user-123

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
    it('should throw wnot notfoundError when comment not available', async () => {
      // arange
      await CommentsTableTestHelper.addComment({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.deleteCommentById('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
  });
});
