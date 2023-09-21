const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const pool = require('../../database/postgres/pool');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

describe('UserRepositoryPostgres', () => {
    afterEach(async () => {
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('verifyAvailableUsername function', () => {
        it('should throw InvariantError when username not available', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ username: 'dicoding' });
            const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

            // Action & Assert
            await expect(userRepositoryPostgres.verifyAvailableUsername('dicoding')).rejects.toThrowError(InvariantError);
        });

        it('should not throw InvariantError when username available', async () => {
            // Arrange
            const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

            // Action & Assert
            await expect(userRepositoryPostgres.verifyAvailableUsername('dicoding')).resolves.not.toThrowError(InvariantError);
        });
    });

    describe('addUser function', () => {
        it('should persist register user', async () => {
            // Arrange
            const registerUser = new RegisterUser({
                username: 'dicoding',
                password: 'secret_password',
                fullname: 'Dicoding Indonesia'
            });

            const fakeIdGenerator = () => '123';

            const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            await userRepositoryPostgres.addUser(registerUser);

            // Assert
            const users = await UsersTableTestHelper.findUsersById('user-123');
            expect(users).toHaveLength(1);
        });

        it('should return registered user correctly', async () => {
            // Arrange
            const registerUser = new RegisterUser({
                username: 'dicoding',
                password: 'secret_password',
                fullname: 'Dicoding Indonesia'
            });

            const fakeIdGenerator = () => '123';
            const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            const registeredUser = await userRepositoryPostgres.addUser(registerUser);

            // Assert
            expect(registeredUser).toStrictEqual(new RegisteredUser({
                id: 'user-123',
                username: 'dicoding',
                fullname: 'Dicoding Indonesia'
            }));
        });
    });

    describe('getPasswordByUsername', () => {
        it('should throw InvariantError when user not found', async () => {
            // Arrange
            const userRepositoryPostgres = new UserRepositoryPostgres(pool);

            // Action and Assert
            await expect(userRepositoryPostgres.getPasswordByUsername('anInvalidUsername'))
                .rejects
                .toThrowError(InvariantError);
        });

        it('should return correct password', async () => {
            // Arrange
            const userRepositoryPostgres = new UserRepositoryPostgres(pool);

            // Action
            await UsersTableTestHelper.addUser({
                username: 'aUsername',
                password: 'aPassword',
            });

            // Assert
            const password = await userRepositoryPostgres.getPasswordByUsername('aUsername');

            expect(password).toEqual('aPassword');
        });
    });

    describe('getIdByUsername method', () => {
        it('should throw InvariantError when user not found', async () => {
            // Arrange
            const userRepositoryPostgres = new UserRepositoryPostgres(pool);

            // Action and Assert
            await expect(userRepositoryPostgres.getIdByUsername('anInvalidUsername'))
                .rejects
                .toThrowError(InvariantError);
        });

        it('should return correct user id', async () => {
            // Arrange
            const userRepositoryPostgres = new UserRepositoryPostgres(pool);

            // Action
            await UsersTableTestHelper.addUser({
                username: 'aUsername',
                id: 'user-789'
            });

            // Assert
            const userId = await userRepositoryPostgres.getIdByUsername('aUsername');

            expect(userId).toEqual('user-789');
        });
    });
});