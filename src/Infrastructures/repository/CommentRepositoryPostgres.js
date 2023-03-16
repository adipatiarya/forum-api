const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.*,
             users.username FROM comments
             JOIN users ON users.id=comments.owner
             WHERE comments.thread_id = $1
             ORDER BY comments.date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async addComment({ content, threadId, owner }) {
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments(id, content, owner, thread_id) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, threadId],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentExist(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND is_deleted = false',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
    const comment = result.rows[0];
    if (comment.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET is_deleted = TRUE WHERE id = $1',
      values: [id],
    };
    await this._pool.query(query);
  }
}
module.exports = CommentRepositoryPostgres;
