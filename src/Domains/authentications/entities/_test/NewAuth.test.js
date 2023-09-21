const NewAuth = require('../NewAuth');

describe('NewAuth entities', () => {
    it('should throw error when payload did not contains needed property', () => {
        // Arrange
        const payload = {
            accessToken: 'anAccessToken'
        };

        // Action and Assert
        expect(() => new NewAuth(payload)).toThrowError('NEW_AUTH.NOT_CONTAINS_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            accessToken: 12345,
            refreshToken: 'aRefreshToken'
        };

        // Action and Assert
        expect(() => new NewAuth(payload)).toThrowError('NEW_AUTH.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create NewAuth instance correctly', () => {
        // Arrange
        const payload = {
            accessToken: 'anAccessToken',
            refreshToken: 'aRefreshToken'
        };

        // Action
        const newAuth = new NewAuth(payload);

        // Assert
        expect(newAuth).toBeInstanceOf(NewAuth);
        expect(newAuth.accessToken).toEqual(payload.accessToken);
        expect(newAuth.refreshToken).toEqual(payload.refreshToken);
    });
});