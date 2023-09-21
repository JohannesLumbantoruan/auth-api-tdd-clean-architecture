const LogoutUserUseCase = require('../LogoutUserUseCase');
const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');

describe('LogoutUserUseCase', () => {
    it('should throw error when payload do not contains refresh token', async () => {
        // Arrange
        const logoutUserUseCase = new LogoutUserUseCase({});

        // Action and Assert
        await expect(logoutUserUseCase.execute({}))
            .rejects
            .toThrowError('LOGOUT_USER_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN');
    });

    it('should throw error when refresh token is not a string', async () => {
        // Arrange
        const logoutUserUseCase = new LogoutUserUseCase({});

        // Action and Assert
        await expect(logoutUserUseCase.execute({ refreshToken: 12345 }))
            .rejects
            .toThrowError('LOGOUT_USER_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should orchestrating logout use case correctly', async () => {
        // Arrange
        const useCasePayload = {
            refreshToken: 'aRefreshToken'
        };

        const mockAuthenticationRepository = new AuthenticationRepository();

        mockAuthenticationRepository.validateToken = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockAuthenticationRepository.deleteToken = jest.fn()
            .mockImplementation(() => Promise.resolve());

        const logoutUserUseCase = new LogoutUserUseCase({
            authenticationRepository: mockAuthenticationRepository
        });

        // Action
        await logoutUserUseCase.execute(useCasePayload);

        // Assert
        expect(mockAuthenticationRepository.validateToken)
            .toBeCalledWith(useCasePayload.refreshToken);
        expect(mockAuthenticationRepository.deleteToken)
            .toBeCalledWith(useCasePayload.refreshToken);
    });
});