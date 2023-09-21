const InvariantError = require('../../Commons/exceptions/InvariantError');
const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');

class JwtTokenManager extends AuthenticationTokenManager {
    constructor(jwt) {
        super();
        this._jwt = jwt;
    }

    async createAccessToken(payload) {
        return this._jwt.generate(payload, process.env.ACCESS_TOKEN_KEY);
    }

    async createRefreshToken(payload) {
        return this._jwt.generate(payload, process.env.REFRESH_TOKEN_KEY);
    }

    async verifyRefreshToken(refreshToken) {
        try {
            const artifacts = this._jwt.decode(refreshToken);

            this._jwt.verify(artifacts, process.env.REFRESH_TOKEN_KEY);
        } catch {
            throw new InvariantError('refresh token tidak valid');
        }
    }

    async decodePayload(token) {
        const artifacts = this._jwt.decode(token);

        return artifacts.decoded.payload;
    }
}

module.exports = JwtTokenManager;