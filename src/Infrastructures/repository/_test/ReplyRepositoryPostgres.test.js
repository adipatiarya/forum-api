const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepository', () => {
  beforeEach(async () => {
    // Menambahkan username decoding dengan id = user-123
    await UsersTableTestHelper.addUser({});

    // decoding membuat thread dengan id = thread-123
    await ThreadsTableTestHelper.addThread({});

    // Menambahkan username kirun dengan id = user-456
    await UsersTableTestHelper.addUser({ id: 'user-456', username: 'kirun' });

    // Kirun mengomentari thread decoding dengan komantar id = comment-123
    await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-456' });
  });
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });
  afterAll(async () => {
    await pool.end();
  });
  describe('getRepliesByCommentId function', () => {
    it('should return of length array 0', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const results = await replyRepositoryPostgres.getRepliesByCommentId('comment-123');
      expect(results).toHaveLength(0);
    });
    it('should return of replies', async () => {
      await RepliesTableTestHelper.addReply({});
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const results = await replyRepositoryPostgres.getRepliesByCommentId('comment-123');

      expect(results).toHaveLength(1);
      expect(results).toEqual([{
        comment_id: 'comment-123',
        content: 'sebuah balasan',
        date: new Date('2023-03-08T21:25:32.286Z'),
        id: 'reply-123',
        is_deleted: false,
        owner: 'user-123',
        username: 'dicoding',
      }]);
    });
  });
  describe('deleteReply function', () => {
    it('should delete reply from database', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const id = 'reply-123';
      await RepliesTableTestHelper.addReply({ id });

      // Action
      await replyRepositoryPostgres.deleteReplyById(id);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(id);
      expect(replies).toHaveLength(0);
    });
  });
  describe('verifyReplyOwner function', () => {
    it('harus merespon exception AuthorizatonError', async () => {
      // Arange
      // Decoding membalas komentar kirun
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123', commentId: 'comment-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-124')).rejects.toThrowError(AuthorizationError);
    });
    it('harus tidak merespon exception AuthorizatonError', async () => {
      // Arange
      // Decoding membalas komentar kirun
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123', commentId: 'comment-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
    it('harus merespon exception NotFoundError ketika balasan yg dihapus tidak tersedia', async () => {
      // Arange
      // Decoding membalas komentar kirun
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123', commentId: 'comment-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-124', 'user-124')).rejects.toThrowError(NotFoundError);
    });
    it('harus tidak merespon exception NotFoundError ketika balasan yang dihapus tersedia', async () => {
      // Arange
      // Decoding membalas komentar kirun
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123', commentId: 'comment-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrowError(NotFoundError);
    });
  });
  describe('addReply function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange

      const owner = 'user-123';
      const reply = new AddReply({
        content: 'sebuah balasan',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(owner, reply);

      // Assert
      const results = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(results).toHaveLength(1);
    });
    it('should return added reply correctly', async () => {
      // Arrange

      const owner = 'user-123';
      const reply = new AddReply({
        content: 'sebuah balasan',
        commentId: 'comment-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await replyRepositoryPostgres.addReply(owner, reply);

      // Assert
      expect(result).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyReplyExist function', () => {
    it('should throw not notfoundError when reply is available', async () => {
      // arange
      await RepliesTableTestHelper.addReply({});
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // asert
      await expect(replyRepositoryPostgres.verifyReplyExist('reply-123')).resolves.not.toThrowError(NotFoundError);
    });
    it('should throw notfoundError when reply is not available', async () => {
      // arange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // assert
      await expect(replyRepositoryPostgres.verifyReplyExist('reply-123')).rejects.toThrowError(NotFoundError);
    });
  });
});
