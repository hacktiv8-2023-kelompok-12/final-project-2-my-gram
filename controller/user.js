const {User} = require("../models");

class UserC {
    static #hash;
    static #compare_hash;
    static #sign_token;

    static Init({hash, compare_hash, sign_token}) {
        this.#hash = hash;
        this.#compare_hash = compare_hash;
        this.#sign_token = sign_token;
    }

    static register = async (req, res) => {
        try {
            const {email, full_name, username, password, profile_image_url, age, phone_number} = req.body;
            if (await User.findOne({
                where: {email}
            })) {
                throw {
                    code: 409,
                    message: "email is used"
                }
            }
            const newUser = new User({
                email, full_name, username, password: await this.#hash(password), profile_image_url, age, phone_number
            });
            await newUser.save().catch(err => {
                throw {
                    code: 400,
                    message: err
                };
            });
            res.status(201).json({
                user: {
                    email, full_name, username, profile_image_url, age, phone_number
                }
            });
        } catch (err) {
            res.status(err.code || 500).send(err);
        }
    }
    static login = async (req, res) => {
        try {
            const {email, password} = req.body;
            const newUser = await User.findOne({where: {email}});
            if (!newUser) {
                throw {
                    code: 404, message: "user not found"
                };
            }
            if (!await this.#compare_hash(newUser.password, password)) {
                throw {
                    code: 400, message: "user password is wrong"
                };
            }
            res.status(200).json({
                token: this.#sign_token({id: newUser.id})
            });
        } catch (err) {
            res.status(err.code || 500).send(err);
        }
    }
    static updateUser = async (req, res) => {
        try {
            const {userId} = req.params;
            const {
                email = null,
                full_name = null,
                username = null,
                profile_image_url = null,
                age = null,
                phone_number = null
            } = req.body;
            if (parseInt(userId) !== req.user.id) {
                throw {
                    code: 403,
                    message: "forbidden"
                }
            }
            if(! await User.findByPk(userId)) {
                throw {
                    code: 404,
                    message: "user not found"
                }
            }
            await User.update({
                email,
                full_name,
                username,
                profile_image_url,
                age,
                phone_number
            }, {
                where: {
                    id: parseInt(userId)
                }
            }).catch(_ => {
                throw {
                    code: 400
                }
            });
            res.json({
                user: {
                    email, full_name, username, profile_image_url, age, phone_number
                }
            });
        } catch (err) {
            res.status(err.code || 500).send(err);
        }
    }
    static deleteUser = async (req, res) => {
        try {
            const {userId} = req.params;
            if (parseInt(userId) !== req.user.id) {
                throw {
                    code: 403,
                    message: "forbidden"
                }
            }
            if(! await User.findByPk(userId, {})) {
                throw {
                    code: 404,
                    message: "user not found"
                }
            }
            await User.destroy({
                where: {
                    id: parseInt(userId)
                }
            });
            res.json({
                message: "Your account has been successfully deleted"
            })
        } catch (err) {
            res.status(err.code || 500).send(err);
        }
    }
}

module.exports = UserC;