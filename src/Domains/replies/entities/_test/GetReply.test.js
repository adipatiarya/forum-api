const GetReply = require('../GetReply');

describe('a GeReply entities', () => {
  it('return content is deleted', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'dicoding',
      content: 'sebuah balasan',
      date: 'date',
      is_deleted: true,
    };

    // Action
    const {
      id, username, content, date,
    } = new GetReply(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toEqual('**balasan telah dihapus**');
    expect(date).toEqual(payload.date);
  });
  it('return content not deleted ', () => {
    // Arrange
    const payload = {
      id: 'relpy-123',
      username: 'dicoding',
      content: 'sebuah balasan',
      date: 'date',
      is_deleted: false,
    };

    // Action
    const {
      id, username, content, date,
    } = new GetReply(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
  });
});
