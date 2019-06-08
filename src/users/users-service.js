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
    getById(knex, id) {
        return knex
          .from('users')
          .select('*')
          .where('id', id)
          .first()
    },
    getAllUsers(knex) {
        return knex.select('*').from('users')
    },
    deleteUser(knex, id) {
        return knex('users')
            .where({ id })
            .delete()
    },
    updateUser(knex, id, newUser) {
        return knex('users')
            .where({ id })
            .update(newUser)
    }
}

module.exports = UsersService