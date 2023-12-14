const {Comment, Photo, User} = require("../models");

class PhotoC {

    // Akses Sudah Login
    static async getAllPhotos(req, res) {
        try {
            const data = await Photo.findAll({
                include: [{
                    model: User,
                    attributes: ["id", "username", "profile_image_url"]
                }, {
                    model: Comment,
                    attributes: ["comment"],
                    include: {
                        model: User,
                        attributes: ["username"]
                    }
                }]
            })

            res.status(200).json({photos: data})
        } catch (error) {
            res.sendStatus(error.code || 500)
        }
    }

    // Akses susuai ID
    static async getPhotoById(req, res) {
        try {
            const {photoId} = req.params
            const user = req.user
            const data = await Photo.findOne({
                where: {
                    id: parseInt(photoId),
                    UserId: user.id
                }
            })

            if (!data) {
                throw {
                    code: 404,
                    message: "Photo not found!"
                }
            }

            res.status(200).json(data)
        } catch (error) {
            res.sendStatus(error.code || 500)
        }
    }

    // Add Photos
    static async addPhoto(req, res) {
        try {
            const {
                title,
                caption,
                poster_image_url
            } = req.body

            const user = req.user

            const data = await Photo.create({
                title,
                caption,
                poster_image_url,
                UserId: user.id
            }).catch((err) => {
                throw {
                    code: 400,
                    message: err.errors
                }
            });

            res.status(201).json(data)
        } catch (error) {
            res.status(error.code || 500).send(error);
        }
    }

    // Update Photo
    static async updatePhoto(req, res) {
        try {
            const {
                title = null,
                caption = null,
                poster_image_url = null
            } = req.body

            const {photoId} = req.params
            const foundPhoto = await Photo.findByPk(parseInt(photoId), {});
            if (!foundPhoto) {
                throw {
                    code: 404,
                    message: "photo not found"
                }
            }
            if (req.user.id !== parseInt(foundPhoto.UserId)) {
                throw {
                    code: 403,
                    message: "forbidden"
                }
            }

            const data = await Photo.update({
                title,
                caption,
                poster_image_url
            }, {
                where: {
                    id: parseInt(photoId)
                },
                returning: true
            }).catch((err) => {
                throw {
                    code: 400,
                    message: err.errors
                }
            })

            if (!data[0]) {
                throw {
                    code: 404,
                    message: "photo not found"
                }
            }

            res.status(200).json({photo: data[1][0]})
        } catch (error) {
            res.status(error.code || 500).send(error);
        }
    }

    //Delete Photo By ID
    static async deletePhotoById(req, res) {
        try {
            const {photoId} = req.params
            const foundPhoto = await Photo.findByPk(parseInt(photoId), {});
            if (!foundPhoto) {
                throw {
                    code: 404,
                    message: "photo not found"
                }
            }
            if (req.user.id !== parseInt(foundPhoto.UserId)) {
                throw {
                    code: 403,
                    message: "forbidden"
                }
            }
            const data = await Photo.destroy({
                where: {
                    id: parseInt(photoId)
                }
            })
            if (!data) {
                throw {
                    code: 404,
                    message: "photo not found"
                }
            }
            res.status(200).json({message: "Your photo has been successfully deleted"})

        } catch (error) {
            res.status(error.code || 500).send(error);
        }
    }
}

module.exports = PhotoC;