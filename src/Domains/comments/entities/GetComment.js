/* eslint-disable camelcase */
class GetComment {
  constructor(payload) {
    const {
      id, username, date, content,
    } = payload;
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    if (payload.is_deleted === true) {
      this.content = '**komentar telah dihapus**';
    }
  }
}

module.exports = GetComment;
