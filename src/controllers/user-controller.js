const fs = require('fs/promises');
const createError = require('../utils/create-error');
const { upload } = require('../utils/coudinary-service');
const prisma = require('../models/prisma');
const { checkUserIdSchema } = require('../validators/user-validator');
const { AUTH_USER, UNKNOWN, FOLLOWER, FOLLOWING, INRELATIONSHIP } = require('../config/constants');

const getTargetUserStatusWithAuthUser = async (targetUserId, authUserId) => {
    if (targetUserId === authUserId) {
        return AUTH_USER
    }
    const relationship = await prisma.follow.findFirst({
        where: {
            OR: [
                {requesterId: targetUserId, receiverId: authUserId},
                {requesterId: authUserId, receiverId: targetUserId},
    
            ]
        }
    });

    // if ((relationship.requesterId === authUserId && relationship.receiverId === targetUserId) && (relationship.requesterId === targetUserId && relationship.receiverId === authUserId)) {
    //     return INRELATIONSHIP
    // }
    if (!relationship) {
        return UNKNOWN
    } 
    if (relationship.requesterId === authUserId) {
        return FOLLOWING
    }
    if (relationship.receiverId === authUserId) {
        return FOLLOWER
    }
}

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
                    profileImage: url,
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
            where: {
                id: userId
            }
        });

        let status = null;

        if (user) {
            delete user.password;
            status = await getTargetUserStatusWithAuthUser(userId, req.user.id)
        }
        res.status(200).json({user, status})
    } catch (err) {
        next (err)
    }
};