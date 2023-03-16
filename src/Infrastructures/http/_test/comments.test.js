/* eslint-disable no-unused-vars */
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
  describe('POST /threads/id/comments', () => {
    describe('saat menambahkan komentar tanpa authentikasi', () => {
      it('harus merespon  status code 401 dan pesan Missing Authentication message', async () => {
        // Arrange
        const requestPayload = {
          content: 'sebuah comment',
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

        // Action
        const response = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments`,
          payload: requestPayload,
          headers: {
            Authorization: 'tokenerror',
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toEqual('Missing authentication');
      });
    });
    describe('saat menambahkan komentar', () => {
      it('harus merespon status kode 201 , payload valid', async () => {
        // Arrange
        const requestPayload = {
          content: 'sebuah comment',
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

        // Action
        const response = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.addedComment).toBeDefined();
      });
      it('harus merespon status kode 400 , payload error', async () => {
        // Arrange
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

        // Action
        const response = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
      });
      it('harus merespon status kode 404 , thread tidak ditemukan', async () => {
        // Arrange
        const requestPayload = {
          content: 'hello content',
        };

        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads/thread-error/comments',
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
      });
    });
  });
  describe('DELETE /threads/id/comments/id', () => {
    describe('saat menghapus komentar tanpa authentikasi', () => {
      it('harus merespon  status code 401 dan pesan Missing Authentication message', async () => {
        // Arrange
        const requestPayload = {
          content: 'sebuah comment',
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
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { data: { addedComment: { id: commentId } } } = JSON.parse(commentResponse.payload);

        // act
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}`,
          headers: {
            Authorization: 'null',
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toEqual('Missing authentication');
      });
    });
    describe('saat menghapus komentar', () => {
      it('harus merespon status kode 200', async () => {
        // Arrange
        const requestPayload = {
          content: 'sebuah comment',
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

        // Action
        const commentResponse = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { data: { addedComment: { id: commentId } } } = JSON.parse(commentResponse.payload);
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
      });
      it('harus merespon status kode 404, thread atau komentar tidak ada', async () => {
        // Arrange
        const requestPayload = {
          content: 'sebuah comment',
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

        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/comment-gaada`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
      });
      it('harus merespon status kode 403, hanya pemilik komentar yg dapat menghapus', async () => {
        // Arrange
        const requestPayload = {
          content: 'sebuah comment',
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

        // Action
        const commentResponse = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // john menghapus komentar milik decoding
        const { data: { addedComment: { id: commentId } } } = JSON.parse(commentResponse.payload);
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}`,
          headers: {
            Authorization: `Bearer ${tokenjohn}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(403);
        expect(responseJson.status).toEqual('fail');
      });
    });
  });
});
