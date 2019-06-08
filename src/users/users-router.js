const path = require('path')
const express = require('express')
const xss = require('xss')
const UsersService = require('./users-service')
const { requireAuth } = require('../middleware/auth')
const usersRouter = express.Router()
const jsonParser = express.json()


const serializeUser = user => ({
    id: user.id,
    first_name: xss(user.first_name),
    last_name: xss(user.last_name),
    email: xss(user.email),
    password: user.password
})


usersRouter 
    .route('/')
    .post(jsonParser, (req, res, next) => {
        const { first_name, last_name, email, password } = req.body
        const newUser = { first_name, last_name, email, password }

        for (const [key, value] of Object.entries(newUser))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in body request`}
                });
            
            newUser.email = email;
            newUser.password = password;
            
            UsersService.insertUser(req.app.get('db'), newUser)
                .then(user => {
                    res
                        .status(201)
                        .location(path.posix.join(req.originalUrl, `/${user.id}`))
                        .json(serializeUser(user))
                })
                .catch(next);
    })
    .get(requireAuth, (req, res, next) => {
        UsersService.getAllUsers(
            req.app.get('db')
        )
            .then(user => {
                if (!user) {
                    return res.status(404).json({
                        error: {message: `User does not exist`}
                    })
                }
                res.json(user)
                next()
            })
            .catch(next)
    })

    usersRouter
        .route('/user')
        .all(requireAuth, (req, res, next) => {
            UsersService.getById(
                req.app.get('db'),
                req.user.id
            )
                .then(user => {
                    if (!user) {
                        return res.status(404).json({
                            error: { message: `User does not exist`}
                        })
                    }
                    res.user = user
                    next()
                })
                .catch(next)
        })
        .get(requireAuth, (req, res, next) => {
            UsersService.getById(
                req.app.get('db'),
                req.user.id
            )
                .then(user => {
                    if (!user) {
                        return res.status(404).json({
                            error: { message: `User does not exist`}
                        })
                    }
                    res.json(user)
                    next()
                })
                .catch(next)
        })
        .delete(requireAuth, (req, res, next) => {
            UsersService.deleteUser(
                req.app.get('db'),
                req.user.id
            )
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                .catch(next)
        })
        .patch(requireAuth, jsonParser, (req, res, next) => {
            const { first_name, last_name, email, password } = req.body
            const userToUpdate = { first_name, last_name, email, password}

            const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
            if (numberOfValues === 0)
                return res.status(400).json({
                    error: {
                        message: `Request body must contain 'firstname', 'lastname', 'email', 'password'`
                    }
                })

            UsersService.updateUser(
                req.app.get('db'),
                req.user.id,
                userToUpdate
            )
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                .catch(next)
        })
    module.exports = usersRouter