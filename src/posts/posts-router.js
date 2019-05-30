const path = require('path')
const express = require('express')
const xss = require('xss')
const PostsService = require('./posts-service')

const postsRouter = express.Router()
const jsonParser = express.json()

const serializePost = post => ({
    id: post.id,
    dog_name: xss(post.dog_name),
    email: xss(post.email),
    breed: xss(post.breed),
    birthdate: post.birthdate,
    lifestyle: xss(post.lifestyle)
})

postsRouter 
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        PostsService.getAllPosts(knexInstance)
            .then(posts => {
                console.log(posts.map(serializePost))
                // res.json(posts.map(serializePost))
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const { dog_name, email, breed, birthdate, lifestyle } = req.body
        const newPost = { dog_name, email, breed, birthdate, lifestyle}

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

    module.exports = postsRouter