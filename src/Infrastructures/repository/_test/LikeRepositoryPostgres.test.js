const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({}); // user-123
    await UsersTableTestHelper.addUser({ id: 'user-456', username: 'ayaas' });
    await ThreadsTableTestHelper.addThread({}); // thread-123
    await CommentsTableTestHelper.addComment({}); // comment-123
  });
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });
  afterAll(async () => {
    await pool.end();
  });
  describe('Like function', () => {
    it('should like correctly', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action
      await likeRepositoryPostgres.like('comment-123', 'user-123');

      const result = await LikesTableTestHelper.findLikes('comment-123', 'user-123');
      // console.log(result);

      // Assert
      expect(result).toHaveLength(1);
    });
    it('should unlike correctly', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);

      // Action
      await likeRepositoryPostgres.like('comment-123', 'user-123');

      await likeRepositoryPostgres.like('comment-123', 'user-123');

      const result = await LikesTableTestHelper.findLikes('comment-123', 'user-123');

      // Assert
      expect(result).toHaveLength(0);
    });
  });
  describe('Count function', () => {
    it('should count correctly', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool);
      await LikesTableTestHelper.like('comment-123', 'user-123');
      await LikesTableTestHelper.like('comment-123', 'user-456');

      // Action
      const result = await likeRepositoryPostgres.count(['comment-123']);

      // except
      expect(result.length).toEqual(2);
    });
  });
});
