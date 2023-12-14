const {User} = require("../models");

class AuthMid {
    static #verify_token;

    static Init({verify_token}) {
        this.#verify_token = verify_token;
    }

    static isAuth = async (req, res, next) => {
        try {
            const {token} = req.headers;
            if (!token) {
                throw {
                    code: 401,
                    message: "unauthorized"
                };
            }
            const claim = await this.#verify_token(token).catch(()=>{
                throw {
                    code: 401,
                    message: "unauthorized"
                };
            });
            if (!claim) {
                throw {
                    code: 401,
                    message: "unauthorized"
                };
            }
            req.user = await User.findByPk(claim.id);
            if (!req.user) {
                throw {
                    code: 401,
                    message: "unauthorized"
                };
            }
            next();
        }catch (err) {
            res.status(err.code || 500).send(err);
        }
    }
}

module.exports = AuthMid;