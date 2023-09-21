const pool = require('../../database/postgres/pool');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const createServer = require('../createServer');
const container = require('../../container');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');

describe('/authentications endpoint', () => {
    afterEach(async () => {
        await AuthenticationsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('when POST /authentications', () => {
        it('should response status code 201 and new authentication', async () => {
            // Arrange
            const requestPayload = {
                username: 'aUsername',
                password: 'aPassword'
            };

            const server = await createServer(container);

            // add user
            await server.inject({
                method: 'POST',
                url: '/users',
                payload: {
                    username: 'aUsername',
                    password: 'aPassword',
                    fullname: 'A Full Name'
                }
            });

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/authentications',
                payload: requestPayload
            });

            // Assert
            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(201);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.accessToken).toBeDefined();
            expect(responseJson.data.refreshToken).toBeDefined();
        });

        it('should response 400 when username not found', async () => {
            // Arrange
            const requestPayload = {
                username: 'aUsername',
                password: 'aPassword'
            };

            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/authentications',
                payload: requestPayload
            });

            // Assert
            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('username tidak ditemukan');
        });

        it('should response status code 401 when password wrong', async () => {
            // Arrange
            const requestPayload = {
                username: 'aUsername',
                password: 'aWrongPassword'
            };

            const server = await createServer(container);

            await server.inject({
                method: 'POST',
                url: '/users',
                payload: {
                    username: 'aUsername',
                    password: 'aPassword',
                    fullname: 'A Full Name'
                }
            });

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/authentications',
                payload: requestPayload
            });

            // Assert
            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(401);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('kredensial yang anda masukkan salah');
        });

        it('should response status code 400 when payload do not contains needed property', async () => {
            // Arrange
            const requestPayload = {
                username: 'aUsername'
            };

            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/authentications',
                payload: requestPayload
            });

            // Assert
            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('harus mengirimkan username dan password');
        });

        it('should response status code 400 when payload data type wrong', async () => {
            // Arrange
            const requestPayload = {
                username: 'aUsername',
                password: 12345
            };

            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/authentications',
                payload: requestPayload
            });

            // Assert
            const responseJson = await JSON.parse(response.payload);

            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('username dan password harus berupa string');
        });
    });

    describe('when PUT /authentications', () => {
        it('should response status code 200 and new access token', async () => {
            // Arrange
            // create server
            const server = await createServer(container);

            // add user
            await server.inject({
                method: 'POST',
                url: '/users',
                payload: {
                    username: 'myUsername',
                    password: 'myPassword',
                    fullname: 'My Full Name'
                }
            });

            // login user
            const newAuth = await server.inject({
                method: 'POST',
                url: '/authentications',
                payload: {
                    username: 'myUsername',
                    password: 'myPassword'
                }
            });

            // Action
            const { data: { refreshToken } } = JSON.parse(newAuth.payload);

            const newAccessToken = await server.inject({
                method: 'PUT',
                url: '/authentications',
                payload: {
                    refreshToken
                }
            });

            // Assert
            const responseJson = JSON.parse(newAccessToken.payload);

            expect(newAccessToken.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.accessToken).toBeDefined();
        });

        it('should response status code 400 when payload do not contains refresh token', async () => {
            // Arrange
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'PUT',
                url: '/authentications',
                payload: {}
            });

            // Assert
            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('harus mengirimkan refresh token');
        });

        it('should response status code 400 when refresh token is not a string', async () => {
            // Arrange
            const server = await createServer(container);

            const requestPayload = {
                refreshToken: 12345
            };

            // Action
            const response = await server.inject({
                method: 'PUT',
                url: '/authentications',
                payload: requestPayload
            });

            // Assert
            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('refresh token harus berupa string');
        });

        it('should response status code 400 when refresh token is invalid', async () => {
            // Arrange
            const requestPayload = {
                refreshToken: 'anInvalidRefreshToken'
            };

            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'PUT',
                url: '/authentications',
                payload: requestPayload
            });

            // Assert
            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('refresh token tidak valid');
        });

        it('should response status code 400 when refresh token not in database', async () => {
            // Arrange
            const server = await createServer(container);
            const refreshToken = await container.getInstance(AuthenticationTokenManager.name)
                .createRefreshToken({
                    username: 'aUsername',
                    id: 'user-123'
                });

            // Action
            const response = await server.inject({
                method: 'PUT',
                url: '/authentications',
                payload: {
                    refreshToken
                }
            });

            // Assert
            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('refresh token tidak ditemukan di database');
        });
    });

    describe('when DELETE /authentications', () => {
        it('should response status code 400 when payload do not contains refresh token', async () => {
            // Arrange
            const server = await createServer(container);

            // Action
            const respnose = await server.inject({
                method: 'DELETE',
                url: '/authentications',
                payload: {}
            });

            // Assert
            const responseJson = JSON.parse(respnose.payload);

            expect(respnose.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('harus mengirimkan refresh token');
        });

        it('should response status code 400 when refresh token do not registered in database', async () => {
            // Arrange
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: '/authentications',
                payload: {
                    refreshToken: 'aRefreshToken'
                }
            });

            // Assert
            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('refresh token tidak ditemukan di database');
        });
    });
});