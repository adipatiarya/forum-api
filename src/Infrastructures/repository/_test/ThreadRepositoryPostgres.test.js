const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({}); // create userid user-123
  });
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });
  describe('verifyThreadExist function', () => {
    it('should throw notfoundError when thread not available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExist('thread-test1')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread available', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-test1', owner: 'user-123' });
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExist('thread-test1')).resolves.not.toThrowError(NotFoundError);
    });
  });
  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      const thread = new AddThread({
        title: 'new title',
        body: 'new body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(thread);

      // Assert
      const results = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(results).toHaveLength(1);
    });
    it('should return added thread correctly', async () => {
      // Arrange
      const thread = new AddThread({
        title: 'new title',
        body: 'new body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await threadRepositoryPostgres.addThread(thread);

      // Assert
      expect(result).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'new title',
        owner: 'user-123',
      }));
    });
  });
  describe('getThreadById function', () => {
    it('should throw InvariantError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return thread id correctly', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({});
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');
      expect(thread.id).toEqual('thread-123');
      expect(thread).toEqual({
        id: 'thread-123',
        title: 'sebuah title',
        body: 'sebuah body',
        date: new Date('2023-03-08T21:25:32.286Z'),
        username: 'dicoding',
      });
    });
  });
});
