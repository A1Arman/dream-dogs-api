const PostsService = {
    getAllPosts(knex) {
        return knex.select('*').from('dog_posts')
    },
    insertPost(knex, newPost) {
        return knex
            .insert(newPost)
            .into('dog_posts')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex.from('dog_posts').select('*').where('id', id).first()
    },
    deletePost(knex, id) {
        return knex('dog_posts')
            .where({ id })
            .delete()
    }
}

module.exports = PostsService