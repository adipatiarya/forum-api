/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async like(commentId, userId) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await pool.query(query);

    if (!result.rowCount) {
      await pool.query({
        text: 'INSERT INTO likes(comment_id, user_id) VALUES ($1, $2)',
        values: [commentId, userId],
      });
    } else {
      await pool.query({
        text: 'DELETE FROM likes(comment_id, user_id) VALUES ($1, $2)',
        values: [commentId, userId],
      });
    }
  },
  async findLikes(commentId, userId) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await pool.query(query);
    return result.rows;
  },
};
module.exports = LikesTableTestHelper;
