const fs = require('fs/promises');
const createError = require('../utils/create-error');
const { upload } = require('../utils/coudinary-service');
const prisma = require('../models/prisma');
const { registerSchema } = require('../validators/auth-validator');

exports.updateProfile = async(req, res, next) => {
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