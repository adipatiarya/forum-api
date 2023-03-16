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
  describe('POST /threads/{threadId}/comments/{commentId}/replies', () => {
    describe('saat menambahkan balasan tanpa authentikasi', () => {
      it('harus merespon  status code 401 dan pesan Missing Authentication message', async () => {
        /** ARANGE */
        const requestPayload = {
          content: 'sebuah balasan',
        };

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
          method: 'POST',
          url: `/threads/${threadId}/comments/${commentId}/replies`,
          payload: requestPayload,
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
    describe('saat menambahkan balasan', () => {
      it('harus merespon status kode 201 , payload valid', async () => {
        /** ARANGE */
        const requestPayload = {
          content: 'sebuah balasan',
        };

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
          method: 'POST',
          url: `/threads/${threadId}/comments/${commentId}/replies`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        /** ACTION */

        /** ASSERT */
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.addedReply).toBeDefined();
        /** ASSERT */
      });
      it('harus merespon status kode 400 , payload tidak valid', async () => {
        /** ARANGE */
        const requestPayload = {
          content: '',
        };

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
          payload: { content: ' sebuah komentar ' },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { data: { addedComment: { id: commentId } } } = JSON.parse(commentResponse.payload);
        /** ARANGE */

        /** ACTION */
        const response = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments/${commentId}/replies`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        /** ACTION */

        /** ASSERT */
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        /** ASSERT */
      });
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}/replies', () => {
    describe('saat menghapus balasan tanpa authentikasi', () => {
      it('harus merespon  status code 401 dan pesan Missing Authentication message', async () => {
        /** ARANGE */
        const requestPayload = {
          content: 'sebuah balasan',
        };

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

        const replyResponse = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments/${commentId}/replies`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { data: { addedReply: { id: replyId } } } = JSON.parse(replyResponse.payload);
        /** ARANGE */

        /** ACTION */
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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
    describe('saat menghapus balasan', () => {
      it('harus merespon status kode 200', async () => {
        /** ARANGE */
        const requestPayload = {
          content: 'sebuah balasan',
        };

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
        const replyResponse = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments/${commentId}/replies`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { data: { addedReply: { id: replyId } } } = JSON.parse(replyResponse.payload);
        /** ARANGE */

        /** ACTION */
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        /** ACTION */

        /** ASSERT */
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
        /** ASSERT */
      });
      it('harus merespon status kode 404,  balasan tidak tersedia', async () => {
        /** ARANGE */
        const requestPayload = {
          content: 'sebuah balasan',
        };

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
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}/replies/xxx`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        /** ACTION */

        /** ASSERT */
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
        /** ASSERT */
      });
      it('harus merespon status code 403, hanya pemilik  balasan yg dapat menghapus', async () => {
        /** ARANGE */
        const requestPayload = {
          content: 'sebuah balasan',
        };

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
        const replyResponse = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments/${commentId}/replies`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { data: { addedReply: { id: replyId } } } = JSON.parse(replyResponse.payload);
        /** ARANGE */

        /** ACTION */
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
          headers: {
            Authorization: `Bearer ${tokenjohn}`,
          },
        });

        /** ACTION */

        /** ASSERT */
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(403);
        expect(responseJson.status).toEqual('fail');
        /** ASSERT */
      });
    });
  });
});
