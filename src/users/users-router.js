const path = require('path')
const express = require('express')
const xss = require('xss')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonParser = express.json()


const serializeUser = user => ({
    id: user.id,
    first_name: xss(user.first_name),
    last_name: xss(user.last_name),
    email: xss(user.email)
})


usersRouter 
    .route('/')
    .post(jsonParser, (req, res, next) => {
        const { first_name, last_name, email} = req.body
        const newUser = { first_name, last_name, email }

        for (const [key, value] of Object.entries(newUser))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in body request`}
                });
            
            UsersService.insertUser(req.app.get('db'), newUser)
                .then(user => {
                    res
                        .status(201)
                        .location(path.posix.join(req.originalUrl, `/${user.id}`))
                        .json(serializeUser(user))
                })
                .catch(next);
    })

    module.exports = usersRouter