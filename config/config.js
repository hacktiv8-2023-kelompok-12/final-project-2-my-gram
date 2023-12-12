require("dotenv").config();

module.exports = {
    "development": {
        "username": process.env.DB_USERNAME || "postgres",
        "password": process.env.DB_PASSWORD || "secret",
        "database": process.env.DB_NAME || "my_gram_development",
        "host": process.env.DB_HOST || "127.0.0.1",
        "dialect": process.env.DB_DIALECT || "postgres"
    },
    "test": {
        "username": process.env.DB_USERNAME_TEST || "postgres",
        "password": process.env.DB_PASSWORD_TEST || "secret",
        "database": process.env.DB_NAME_TEST || "my_gram_test",
        "host": process.env.DB_HOST_TEST || "127.0.0.1",
        "dialect": process.env.DB_DIALECT_TEST || "postgres",
        "logging": false
    },
    "production": {
        "username": process.env.DB_USERNAME_PROD || "root",
        "password": process.env.DB_PASSWORD_PROD || "secret",
        "database": process.env.DB_NAME_PROD || "my_gram_production",
        "host": process.env.DB_HOST_PROD || "127.0.0.1",
        "dialect": process.env.DB_DIALECT_PROD || "mysql",
        "port": process.env.DB_PORT
    }
}