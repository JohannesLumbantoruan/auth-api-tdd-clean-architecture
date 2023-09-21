const UserLogin = require('../UserLogin');

describe('UserLogin entities', () => {
    it('should throw error when payload do not contains needed property', () => {
        // Arrange
        const payload = {
            username: 'dicoding'
        };

        // Action and Assert
        expect(() => new UserLogin(payload)).toThrowError('USER_LOGIN.NOT_CONTAINS_NEEDED_PROPERTY');
    });

    it('shoud throw error when payload do not meet data type specification', () => {
        // Arrange
        const payload = {
            username: 12345,
            password: 'myPassword'
        };

        // Action and Assert
        expect(() => new UserLogin(payload)).toThrowError('USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create UserLogin instance correctly', () => {
        // Arrange
        const payload = {
            username: 'myUsername',
            password: 'myPassword'
        };

        // Action
        const userLogin = new UserLogin(payload);

        // Assert
        expect(userLogin).toBeInstanceOf(UserLogin);
        expect(userLogin.username).toEqual(payload.username);
        expect(userLogin.password).toEqual(payload.password);
    });
});