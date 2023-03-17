const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/id/comments endpoints', () => {
  let token = '';
  let tokenjohn = '';

  beforeEach(async () => {
    const server = await createServer(container);
    // add user 1
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'johndoe',
        password: 'secretjohn',
        fullname: 'john doe',
      },
    });
    // login user
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'dicoding',
        password: 'secret',
      },
    });
    // login john
    const loginJohn = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'johndoe',
        password: 'secretjohn',
      },
    });
    const { data: { accessToken } } = JSON.parse(loginResponse.payload);
    token = accessToken;
    const { data: { accessToken: accessTokenJohn } } = JSON.parse(loginJohn.payload);
    tokenjohn = accessTokenJohn;
  });
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });
  describe('PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    describe('saat menambahkan like tanpa authentikasi', () => {
      it('harus merespon  status code 401 dan pesan Missing Authentication message', async () => {
        /** ARANGE */

        const server = await createServer(container);

        const threadResponse = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: { title: 'new-title', body: 'new-body' },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { data: { addedThread: { id: threadId } } } = JSON.parse(threadResponse.payload);
        const commentResponse = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments`,
          payload: { content: 'sebuah komentar' },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { data: { addedComment: { id: commentId } } } = JSON.parse(commentResponse.payload);
        /** ARANGE */

        /** ACTION */
        const response = await server.inject({
          method: 'PUT',
          url: `/threads/${threadId}/comments/${commentId}/likes`,
          headers: {
            Authorization: 'null',
          },
        });
        /** ACTION */

        /** ASSERT */
        const responseJson = JSON.parse(response.payload);
        expect(responseJson.message).toEqual('Missing authentication');
        expect(response.statusCode).toEqual(401);
        /** ASSERT */
      });
    });
    describe('saat like comment', () => {
      it('harus merespon status kode 200 ', async () => {
        /** ARANGE */

        const server = await createServer(container);

        const threadResponse = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: { title: 'new-title', body: 'new-body' },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { data: { addedThread: { id: threadId } } } = JSON.parse(threadResponse.payload);

        const commentResponse = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments`,
          payload: { content: 'sebuah komentar' },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { data: { addedComment: { id: commentId } } } = JSON.parse(commentResponse.payload);
        /** ARANGE */

        /** ACTION */
        const response = await server.inject({
          method: 'PUT',
          url: `/threads/${threadId}/comments/${commentId}/likes`,
          headers: {
            Authorization: `Bearer ${tokenjohn}`,
          },
        });
        /** ACTION */

        /** ASSERT */
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
        /** ASSERT */
      });
    });
  });
});
