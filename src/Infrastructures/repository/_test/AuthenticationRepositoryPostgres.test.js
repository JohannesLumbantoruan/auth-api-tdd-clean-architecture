const AuthenticationTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('AuthenticationRepositoryPostgres', () => {
    afterEach(async () => {
        await AuthenticationTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addToken method', () => {
        it('should add token to database', async () => {
            // Arrange
            const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres(pool);
            const token = 'token';

            // Action
            await authenticationRepositoryPostgres.addToken(token);

            // Assert
            const expectedToken = await AuthenticationTableTestHelper.findToken(token);
            expect(expectedToken).toHaveLength(1);
            expect(expectedToken[0].token).toEqual(token);
        });
    });

    describe('validateToken method', () => {
        it('should throw InvariantError when token not valid', async () => {
            // Arrange
            const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres(pool);

            // Action and Assert
            await expect(authenticationRepositoryPostgres.validateToken('aNotValidToken'))
                .rejects
                .toThrowError(InvariantError);
        });

        it('should not throw InvariantError when token valid', async () => {
            // Arrange
            const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres(pool);
            const token = 'token';

            // Action
            await authenticationRepositoryPostgres.addToken(token);

            // Assert
            await expect(authenticationRepositoryPostgres.validateToken(token))
                .resolves
                .not
                .toThrowError(InvariantError);
        });
    });

    describe('deleteToken method', () => {
        it('should delete token from database', async () => {
            // Arrange
            const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres(pool);
            const token = 'token';

            // Action
            await authenticationRepositoryPostgres.addToken(token);
            await authenticationRepositoryPostgres.deleteToken(token);

            // Assert
            const expectedToken = await AuthenticationTableTestHelper.findToken(token);

            expect(expectedToken).toHaveLength(0);
        });
    });
});