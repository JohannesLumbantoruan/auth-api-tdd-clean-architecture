class UserLogin{
    constructor(payload) {
        this._verifyPayload(payload);

        this.username = payload.username;
        this.password = payload.password;
    }

    _verifyPayload({ username, password }) {
        if (!username || !password) {
            throw new Error('USER_LOGIN.NOT_CONTAINS_NEEDED_PROPERTY');
        }

        if (typeof username !== 'string' || typeof password !== 'string') {
            throw new Error('USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = UserLogin;