module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DATABASE_URL || 'postgresql://dundermifflin@localhost/dream_dogs',
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'https://localhost:8000'
}