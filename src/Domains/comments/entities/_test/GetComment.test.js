const GetComment = require('../GetComment');

describe('a GetComment entities', () => {
  it('return content is deleted', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      content: 'sebuah comment',
      date: 'date',
      is_deleted: true,
    };

    // Action
    const {
      // eslint-disable-next-line camelcase
      id, username, content, date,
    } = new GetComment(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toEqual('**komentar telah dihapus**');
    expect(date).toEqual(payload.date);
  });
  it('return content not deleted ', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      content: 'sebuah comment',
      date: 'date',
      is_deleted: false,
    };

    // Action
    const {
      // eslint-disable-next-line camelcase
      id, username, content, date,
    } = new GetComment(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
  });
});
