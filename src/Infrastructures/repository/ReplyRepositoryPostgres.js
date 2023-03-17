const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGnerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGnerator;
  }

  async addReply(reply) {
    const { content, commentId, owner } = reply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies(id, content, owner, comment_id) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, commentId],
    };

    const result = await this._pool.query(query);

    return new AddedReply(result.rows[0]);
  }

  async verifyReplyExist(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND is_deleted = false',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async getRepliesByCommentId([...commentIds]) {
    /* const query = {
      text: `SELECT replies.*,
             users.username from replies
             JOIN users ON users.id=replies.owner
             WHERE replies.comment_id = $1
             ORDER BY replies.date ASC`,
      values: [commentId],

    }; */
    const query = {
      text: `SELECT replies.*, users.username
      FROM replies
      INNER JOIN users ON users.id = replies.owner
      WHERE replies.comment_id = ANY($1::text[])
      ORDER BY replies.date ASC
      `,
      values: [commentIds], // commentIds bertipe array string
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifyReplyOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }
    const reply = result.rows[0];
    if (reply.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteReplyById(id) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true  WHERE id = $1',
      values: [id],
    };
    await this._pool.query(query);
  }
}
module.exports = ReplyRepositoryPostgres;
