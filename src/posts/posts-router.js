const path = require('path')
const express = require('express')
const xss = require('xss')
const PostsService = require('./posts-service')
const { requireAuth } = require('../middleware/auth')

const postsRouter = express.Router()
const jsonParser = express.json()

const serializePost = post => ({
    id: post.id,
    dog_name: xss(post.dog_name),
    email: xss(post.email),
    breed: xss(post.breed),
    birthdate: post.birthdate,
    lifestyle: xss(post.lifestyle),
    owner: post.owner
})

postsRouter 
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        PostsService.getAllPosts(knexInstance)
            .then(posts => {
                res.json(posts.map(serializePost))
            })
            .catch(next);
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const owner = req.user.id;
        const { dog_name, email, breed, birthdate, lifestyle} = req.body
        const newPost = { dog_name, email, breed, birthdate, lifestyle, owner}

        for (const [key, value] of Object.entries(newPost))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in body request`}
                });


            PostsService.insertPost(req.app.get('db'), newPost)
                .then(post => {
                    res
                        .status(201)
                        .location(path.posix.join(req.originalUrl, `/${post.id}`))
                        .json(serializePost(post))
                })
                .catch(next);
    })

    postsRouter
        .route('/myPost')
        .get(requireAuth, (req, res, next) => {
            const owner = req.user.id;
            PostsService.getByOwnerId(req.app.get('db'), owner)
                .then(posts => {
                    res.json(posts.map(serializePost))
                })
                .catch(next);
        })

    postsRouter
        .route('/:post_id')
        .all((req, res, next) => {
            const knexInstance = req.app.get('db');
            PostsService.getById(knexInstance, req.params.post_id)
                .then(post => {
                    if (!post) {
                        return res.status(404).json({
                            error:{ message: `Post doesn't exist` }
                        })
                    }
                    res.post = post
                    next()
                })
                .catch(next)
        })
        .get((req, res, next) => {res.json(serializePost(res.post))})
        .delete(requireAuth, (req, res, next) => {
            PostsService.deletePost(
                req.app.get('db'),
                req.params.post_id
            )
                .then(() => {
                    res.status(204).end()
                })
                .catch(next)
        })
        .patch(requireAuth, jsonParser, (req,res, next) => {
            const { dog_name, email, breed, birthdate, lifestyle } = req.body
            const postToUpdate= { dog_name, email, breed, birthdate, lifestyle}

            const numberOfValues = Object.values(postToUpdate).filter(Boolean).length
            if (numberOfValues === 0)
                return res.status(400).json({
                    error: {
                        message: `Request must contain either 'dog name', 'email', 'breed', 'birthdate', 'lifestyle'`
                    }
                })
            
            PostsService.updatePost(
                req.app.get('db'),
                req.params.post_id,
                postToUpdate
            )
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                .catch(next)
        })

    module.exports = postsRouter