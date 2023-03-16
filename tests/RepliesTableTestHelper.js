/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123', content = 'sebuah balasan', owner = 'user-123', commentId = 'comment-123', date = new Date('2023-03-08T21:25:32.286Z'),
  }) {
    const query = {
      text: 'INSERT INTO replies(id, content, owner, comment_id, date) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, owner, commentId, date],
    };

    await pool.query(query);
  },
  async deleteReply({ id = 'reply-123' }) {
    const query = {
      text: `UPDATE replies 
             SET is_deleted = true, 
             content = '**balasan telah dihapus**'
             WHERE id = $1`,
      values: [id],
    };

    await pool.query(query);
  },
  async findRepliesById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND is_deleted = false',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },
};
module.exports = RepliesTableTestHelper;
