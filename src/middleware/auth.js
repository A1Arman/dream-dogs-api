const AuthService = require('../auth/auth-service')

function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || ''
    
    let basicToken
    if(!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'missing token'})
    } else {
        basicToken = authToken.slice('bearer '.length, authToken.length)
    }

    const [tokenEmail, tokenPassword] = AuthService.parseToken(basicToken)

  
    if (!tokenEmail || !tokenPassword ) {
        return res.status(401).json({error: 'Unauthorized request'})
    }
    
    AuthService.getUserWithEmail(
        req.app.get('db'),
        tokenEmail
    )
        .then(user => {
            if (!user || user.password !== tokenPassword) {
                return res.status(401).json({ error:  'Unauthorized request'})
            }
            req.user = user
            next()
        })
        .catch(next)
}

module.exports = {
    requireAuth
}