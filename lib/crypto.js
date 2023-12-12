const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const secretKey = process.env.SECRETKEY;


module.exports = {
    hash: function (plain) {
        return bcrypt.hash(plain, 10);
    },
    compare_hash: function (hash, real) {
        return bcrypt.compare(real, hash);
    },
    sign_token: function (payload, options = {expiresIn: '1h', algorithm: 'HS256'}) {
        return jwt.sign(payload, secretKey, options);
    },
    verify_token: async function (token, options = {expiresIn: '1h', algorithm: 'HS256'}) {
        return jwt.verify(token, secretKey, options);
    }
}