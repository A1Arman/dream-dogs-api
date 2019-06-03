const knex = require('knex');
const app = require('../src/app');
const {
    makeDogPostArray,
    makeMaliciousPost
} = require('./dream-dogs.fixtures.js');
const { makeUserArray } = require('./users.fixtures');

describe('Posts Endpoints', () => {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: "pg",
            connection: process.env.TEST_DB_URL
        });
        app.set('db', db)
    });

    after('disconnect from db', () => db.destroy());

    before(() => db("dog_posts").truncate());

    afterEach(() => db("dog_posts").truncate());

    describe('GET /api/posts', () => {
        context('given no posts', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/posts')
                    .expect(200, []);
            });
        });

        context('given there are posts in the database', () => {
            const testUsers = makeUserArray();
            const testPosts = makeDogPostArray();

            beforeEach('insert posts', () => {
                return db.into('dog_posts').insert(testUsers).then(() => {
                    return db
                        .into('dog_posts')
                        .insert(testPosts)
                });
            });

            it('responds with 200 and all of the posts', () => {
                return supertest(app)
                    .get('/api/posts')
                    .expect(200, testPosts)
            });
        });

        context(`Given an XSS attack post`, () => {
            const testUsers = makeUsersArray();
            const { maliciousPost, expectedPost } = makeMaliciousPost();

            beforeEach('insert malicious post', () => {
                return db.into('dog_posts').insert(testUsers).then(() => {
                    return db
                        .into('dog_posts')
                        .insert([ maliciousPost ])
                });
            });

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/posts`)
                    .expect(200)
                    .expect(res => {
                        expect(unescape(res.body[0].dog_name)).to.eql(expectedPost.dog_name);
                        expect(res.body[0].email).to.eql(expectedPost.email);
                        expect(res.body[0].breed).to.eql(expectedPost.breed);
                        expect(res.body[0].lifestyle).to.eql(expectedPost.lifestyle);
                    });
            });
        });
    });
});