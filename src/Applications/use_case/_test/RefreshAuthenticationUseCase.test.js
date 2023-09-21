const RefreshAuthenticationUseCase = require('../RefreshAuthenticationUseCase');
const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');

describe('RefreshAuthenticationUseCase', () => {
    it('should throw error when use case payload do not contains refresh token', async () => {
        // Arrange
        const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({});

        // Action and Assert
        await expect(refreshAuthenticationUseCase.execute({}))
            .rejects
            .toThrowError('REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAINS_REFRESH_TOKEN');
    });

    it('should throw error when refresh token is not a string', async () => {
        // Arrange
        const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({});

        // Action and Assert
        await expect(refreshAuthenticationUseCase.execute({ refreshToken: 12345 }))
            .rejects
            .toThrowError('REFRESH_AUTHENTICATION_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should orchestrating refresh authentication use case correctly', async () => {
        // Arrange
        const useCasePayload = { refreshToken: 'aRefreshToken' };
        const mockAuthenticationRepository = new AuthenticationRepository({});
        const mockAuthenticationTokenManager = new AuthenticationTokenManager({});

        mockAuthenticationRepository.validateToken = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockAuthenticationTokenManager.verifyRefreshToken = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockAuthenticationTokenManager.decodePayload = jest.fn()
            .mockImplementation(() => Promise.resolve({ username: 'aUsername', id: 'user-123' }));
        mockAuthenticationTokenManager.createAccessToken = jest.fn()
            .mockImplementation(() => Promise.resolve('aNewAccessToken'));

        const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({
            authenticationRepository: mockAuthenticationRepository,
            authenticationTokenManager: mockAuthenticationTokenManager
        });

        // Action
        const newAccessToken = await refreshAuthenticationUseCase.execute(useCasePayload);

        // Assert
        expect(mockAuthenticationRepository.validateToken)
            .toBeCalledWith(useCasePayload.refreshToken);
        expect(mockAuthenticationTokenManager.verifyRefreshToken)
            .toBeCalledWith(useCasePayload.refreshToken);
        expect(mockAuthenticationTokenManager.decodePayload)
            .toBeCalledWith(useCasePayload.refreshToken);
        expect(mockAuthenticationTokenManager.createAccessToken)
            .toBeCalledWith({ username: 'aUsername', id: 'user-123' });
        expect(newAccessToken).toEqual('aNewAccessToken');
    });
});