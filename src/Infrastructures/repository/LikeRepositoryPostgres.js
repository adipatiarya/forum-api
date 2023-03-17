const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async like(commentId, userId) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      await this._pool.query({
        text: 'INSERT INTO likes(comment_id, user_id) VALUES ($1, $2)',
        values: [commentId, userId],
      });
    } else {
      await this._pool.query({
        text: 'DELETE FROM likes WHERE comment_id = $1 AND user_id = $2',
        values: [commentId, userId],
      });
    }
  }

  async count([...commentIds]) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = ANY($1::text[])',
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}
module.exports = LikeRepositoryPostgres;
