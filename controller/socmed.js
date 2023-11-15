const {SocialMedia, User} = require("../models");

class SocialMediaC {

    static async getAllSocialMedias(req, res) {
        try {
            const data = await SocialMedia.findAll({
                include: [{model: User, attributes: ["id", "username", "profile_image_url"]}]
            })

            res.status(200).json(data)
        } catch (error) {
            res.status(500).json(error)
        }
    }

    // Akses susuai ID
    static async getSocialMediaById(req, res) {
        try {
            const {SocialMediaId} = req.params
            const user = req.user
            const data = await SocialMedia.findOne({
                where: {
                    id: parseInt(SocialMediaId),
                    UserId: user.id
                }
            })

            if (!data) {
                throw {
                    code: 404,
                    message: "SocialMedia not found!"
                }
            }

            res.status(200).json(data)
        } catch (error) {
            res.status(error.code || 500).json(error.message)
        }
    }

    // Add SocialMedias
    static async addSocialMedia(req, res) {
        try {
            const {
                name,
                social_media_url
            } = req.body

            const user = req.user

            const data = await SocialMedia.create({
                name,
                social_media_url,
                UserId: user.id
            }).catch((err) => {
                console.log(err);
                throw {
                    code: 400
                }
            });

            res.status(201).json(data)
        } catch (error) {
            res.sendStatus(error.code || 500)
        }
    }

    // Update SocialMedia
    static async updateSocialMedia(req, res) {
        try {
            const {
                name = null,
                social_media_url = null
            } = req.body

            const {SocialMediaId} = req.params
            const foundSocmed = await SocialMedia.findByPk(parseInt(SocialMediaId),{});
            if(!foundSocmed){
                throw {
                    code: 404
                }
            }
            if(req.user.id !== parseInt(foundSocmed.UserId)){
                throw {
                    code: 403
                }
            }

            const data = await SocialMedia.update({
                name,
                social_media_url
            }, {
                where: {
                    id: parseInt(SocialMediaId)
                },
                returning: true
            })

            if (!data[0]) {
                throw {
                    code: 404,
                    message: "SocialMedia not Found!"
                }
            }

            res.status(201).json(data[1][0])
        } catch (error) {
            res.status(error.code || 500).json(error.message)
        }
    }

    //Delete SocialMedia By ID
    static async deleteSocialMediaById(req, res) {
        try {
            const {SocialMediaId} = req.params
            const foundSocmed = await SocialMedia.findByPk(parseInt(SocialMediaId),{});
            if(!foundSocmed){
                throw {
                    code: 404
                }
            }
            if(req.user.id !== parseInt(foundSocmed.UserId)){
                throw {
                    code: 403
                }
            }
            const data = await SocialMedia.destroy({
                where: {
                    id: parseInt(SocialMediaId)
                }
            })
            if (!data) {
                throw {
                    code: 404,
                    message: "SocialMedia not found!"
                }
            }
            res.status(200).json("Your SocialMedia has been successfully deleted")

        } catch (error) {
            res.sendStatus(error.code || 500)
        }
    }
}

module.exports = SocialMediaC;