/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', content = 'sebuah komentar', owner = 'user-123', threadId = 'thread-123', date = new Date('2023-03-08T21:25:32.286Z'),
  }) {
    const query = {
      text: 'INSERT INTO comments(id, content, owner, thread_id, date) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, owner, threadId, date],
    };

    await pool.query(query);
  },
  async deleteComment({ id = 'comment-123' }) {
    const query = {
      text: `UPDATE comments 
             SET is_deleted = true, 
             content = '**komentar telah dihapus**'
             WHERE id = $1`,
      values: [id],
    };

    await pool.query(query);
  },
  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND is_deleted = false',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },
};
module.exports = CommentsTableTestHelper;
