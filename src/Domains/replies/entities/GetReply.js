class GetReply {
  constructor(payload) {
    const {
      id, username, date, content,
    } = payload;
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    if (payload.is_deleted === true) {
      this.content = '**balasan telah dihapus**';
    }
  }
}

module.exports = GetReply;
