const jwt = require('@hapi/jwt');
const JwtTokenManager = require('../JwtTokenManager');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('JwtTokenManager', () => {
    describe('createAccessToken method', () => {
        it('should create access token correctly', async () => {
            // Arrange
            const payload = {
                username: 'myUsername'
            };

            const mockJwtToken = {
                generate: jest.fn().mockImplementation(() => 'aMockAccessToken')
            };

            const tokenManager = new JwtTokenManager(mockJwtToken);

            // Action
            const mockAccessToken = await tokenManager.createAccessToken(payload);

            // Assert
            expect(mockJwtToken.generate).toBeCalledWith(payload, process.env.ACCESS_TOKEN_KEY);
            expect(mockAccessToken).toEqual('aMockAccessToken');
        });
    });

    describe('createRefreshToken method', () => {
        it('should create refresh token correctly', async () => {
            // Arrange
            const payload = {
                username: 'aUsername'
            };

            const mockJwtToken = {
                generate: jest.fn().mockImplementation(() => 'aRefreshToken')
            };

            const tokenManager = new JwtTokenManager(mockJwtToken);

            // Action
            const mockRefreshToken = await tokenManager.createRefreshToken(payload);

            // Assert
            expect(mockJwtToken.generate).toBeCalledWith(payload, process.env.REFRESH_TOKEN_KEY);
            expect(mockRefreshToken).toEqual('aRefreshToken');
        });
    });

    describe('verifyRefreshToken method', () => {
        it('should throw InvariantError when verification failed', async () => {
            // Arrange
            const tokenManager = new JwtTokenManager(jwt.token);
            const accessToken = await tokenManager.createAccessToken({ username: 'aUsername' });

            // Action and Assert
            await expect(tokenManager.verifyRefreshToken(accessToken))
                .rejects
                .toThrowError(InvariantError);
        });

        it('should not throw InvariantError when verification success', async () => {
            // Arrange
            const tokenManager = new JwtTokenManager(jwt.token);
            const refreshToken = await tokenManager.createRefreshToken({ username: 'aUsername' });

            // Action and Assert
            await expect(tokenManager.verifyRefreshToken(refreshToken))
                .resolves
                .not
                .toThrowError(InvariantError);
        });
    });

    describe('decodePayload method', () => {
        it('should decode payload correctly', async () => {
            // Arrange
            const tokenManager = new JwtTokenManager(jwt.token);
            const accessToken = await tokenManager.createAccessToken({ username: 'aUsername' });

            // Action
            const { username: expectedUsername } = await tokenManager.decodePayload(accessToken);

            // Assert
            expect(expectedUsername).toEqual('aUsername');
        });
    });
});