const UsersService = {
    insertUser(knex, newUser) {
        return knex
            .insert(newUser)
            .into('users')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteUser(knex, id) {
        return knex('users')
            .where({ id })
            .delete()
    }
}

module.exports = UsersService