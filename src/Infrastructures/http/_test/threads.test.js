const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');

const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  let token = '';

  beforeEach(async () => {
    const server = await createServer(container);
    // add user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
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
    const { data: { accessToken } } = JSON.parse(loginResponse.payload);
    token = accessToken;
  });
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });
  describe('POST /threads', () => {
    describe('saat menambahkan thread tanpa autheentikasi', () => {
      it('harus merespon  status code 401 dan pesan Missing Authentication message', async () => {
        // Arrange
        const requestPayload = {
          title: 'new title',
          body: 'new body',
        };

        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: requestPayload,
          headers: {
            Authorization: '',
          },
        });
        const responseJson = JSON.parse(response.payload);
        // Assert
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toEqual('Missing authentication');
      });
    });
    describe('saat menambahkan thread', () => {
      it('harus merespon status kode 201,  payload valid', async () => {
        // Arrange
        const requestPayload = {
          title: 'new title',
          body: 'new body',
        };

        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.addedThread).toBeDefined();
      });
      it('harus merespon status code 400 , payload tidak lengkap', async () => {
        // Arrange
        const requestPayload = {
          title: 'new title',
        };

        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads',
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
      it('harus merespon status code 400, payload yg di input tidak sesuai', async () => {
        // Arrange
        const requestPayload = {
          title: 'new title',
          body: true,
        };

        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads',
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
    });
  });
  describe('GET /threads/id', () => {
    it('harus merespon status kode 200, thread tersedia', async () => {
      // Arrange
      const requestPayload = {
        title: 'new title',
        body: 'new body',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { data: { addedThread: { id: threadId } } } = JSON.parse(response.payload);
      const threads = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });
      expect(threads.statusCode).toEqual(200);
      expect(threads.result.status).toEqual('success');
    });
    it('harus merespon status kode 404, thread tidak tersedia', async () => {
      const server = await createServer(container);

      // Action
      const threads = await server.inject({
        method: 'GET',
        url: '/threads/thread-null',
      });

      expect(threads.statusCode).toEqual(404);
      expect(threads.result.status).toEqual('fail');
    });
  });
});
