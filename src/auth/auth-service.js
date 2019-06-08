const AuthService = {
    getUserWithEmail(db, email) {
        return db('users')
            .where({ email })
            .first()
    },
    parseToken(token) {
        return Buffer
            .from(token, 'base64')
            .toString()
            .split(':')
    }
}

module.exports = AuthService;