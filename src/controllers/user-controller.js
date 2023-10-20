const fs = require('fs/promises');
const createError = require('../utils/create-error');
const { upload } = require('../utils/coudinary-service');
const prisma = require('../models/prisma');
const { checkUserIdSchema } = require('../validators/user-validator');

exports.updateProfileImage = async(req, res, next) => {
    try {
        if (!req.files) {
            return next(createError('profile image is require'))
        }
        const response = {};
        if (req.files.profileImage) {
            const url = await upload(req.files.profileImage[0].path);
            response.profileImage = url;
            await prisma.user.update({
                data: {
                    profileImage: url
                },
                where: {
                    id: req.user.id
                }
            });
        }
        res.status(200).json(response)
    } catch (err) {
        next(err);
    } finally {
        if (req.files.profileImage) {
            fs.unlink(req.files.profileImage[0].path);
        }
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const {error} = checkUserIdSchema.validate(req.params);
        if (error) {
            return next(error)
        }
        const userId = +req.params.userId;
        const user = await prisma.user.findUnique({
            id: userId
        });
        res.status(200).json({user})
    } catch (err) {
        next (err)
    }
};