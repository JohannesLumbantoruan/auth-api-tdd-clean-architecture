class RefreshAuthenticationUseCase {
    constructor({
        authenticationRepository,
        authenticationTokenManager
    }) {
        this._authenticationRepository = authenticationRepository;
        this._authenticationTokenManager = authenticationTokenManager;
    }

    async execute(useCasePayload) {
        this._verifyPayload(useCasePayload);

        await this._authenticationTokenManager.verifyRefreshToken(useCasePayload.refreshToken);
        await this._authenticationRepository.validateToken(useCasePayload.refreshToken);

        const { username, id } = await this._authenticationTokenManager
            .decodePayload(useCasePayload.refreshToken);

        const accessToken = await this._authenticationTokenManager
            .createAccessToken({ username, id });

        return accessToken;
    }

    _verifyPayload(payload) {
        const { refreshToken } = payload;

        if (!refreshToken) {
            throw new Error('REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAINS_REFRESH_TOKEN');
        }

        if (typeof refreshToken !== 'string') {
            throw new Error('REFRESH_AUTHENTICATION_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = RefreshAuthenticationUseCase;