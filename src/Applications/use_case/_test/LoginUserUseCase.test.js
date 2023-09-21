const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const NewAuthentication = require('../../../Domains/authentications/entities/NewAuth');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const UserRepository = require('../../../Domains/users/UserRepository');
const PasswordHash = require('../../security/PasswordHash');
const LoginUserUseCase = require('../LoginUserUseCase');

describe('LoginUserUseCase', () => {
    it('should orchestrating the login user action correctly', async () => {
        // Arrange
        const useCasePayload = {
            username: 'myUsername',
            password: 'myPassword'
        };

        const mockNewAuthentication = new NewAuthentication({
            accessToken: 'anAccessToken',
            refreshToken: 'aRefreshToken'
        });

        /** creating dependency of use case */
        const mockAuthenticationRepository = new AuthenticationRepository();
        const mockAuthenticationTokenManager = new AuthenticationTokenManager();
        const mockUserRepository = new UserRepository();
        const mockPasswordHash = new PasswordHash();

        /** mocking needed function */
        mockAuthenticationTokenManager.createAccessToken = jest.fn()
            .mockImplementation(() => Promise.resolve('anAccessToken'));
        mockAuthenticationTokenManager.createRefreshToken = jest.fn()
            .mockImplementation(() => Promise.resolve('aRefreshToken'));
        mockAuthenticationRepository.addToken = jest.fn()
            .mockImplementation(() => Promise.resolve('aRefreshToken'));
        mockUserRepository.getPasswordByUsername = jest.fn()
            .mockImplementation(() => Promise.resolve('hashedPassword'));
        mockUserRepository.getIdByUsername = jest.fn()
            .mockImplementation(() => Promise.resolve('12345'));
        mockPasswordHash.comparePassword = jest.fn()
            .mockImplementation(() => Promise.resolve(true));

        /** creating use case instance */
        const loginUserUseCase = new LoginUserUseCase({
            userRepository: mockUserRepository,
            authenticationRepository: mockAuthenticationRepository,
            tokenManager: mockAuthenticationTokenManager,
            passwordHash: mockPasswordHash
        });

        // Action
        const newAuthentication = await loginUserUseCase.execute(useCasePayload);

        // Assert
        expect(newAuthentication).toStrictEqual(mockNewAuthentication);
        expect(mockAuthenticationTokenManager.createAccessToken).toBeCalledWith({
            username: 'myUsername',
            id: '12345'
        });
        expect(mockAuthenticationTokenManager.createRefreshToken).toBeCalledWith({
            username: 'myUsername',
            id: '12345'
        });
        expect(mockAuthenticationRepository.addToken).toBeCalledWith('aRefreshToken');
        expect(mockUserRepository.getPasswordByUsername).toBeCalledWith('myUsername');
        expect(mockUserRepository.getIdByUsername).toBeCalledWith('myUsername');
        expect(mockPasswordHash.comparePassword).toBeCalledWith('myPassword', 'hashedPassword');
    });
});