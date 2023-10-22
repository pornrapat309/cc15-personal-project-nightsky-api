const { STATUS_FOLLOWER } = require("../config/constants");
const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const { checkReceiverIdSchema } = require("../validators/user-validator");

exports.requestFollow = async (req, res, next) => {
    try {
        const {error, value} = checkReceiverIdSchema.validate(req.params);
        if (error) {
            return next(error)
        }
        // const receiverId = +req.params.receiverId;
        if (value.receiverId === req.user.id) {
            return next(createError('Can not follow yourself', 400))
        }
        const targetUser = await prisma.user.findUnique({
            where: {
                id: value.receiverId
            }
        });
        if (!targetUser) {
            return next(createError('User does not exist', 400))
        }

        const existRelationship = await prisma.follow.findFirst({
            where: {
                OR: [
                    {requesterId: req.user.id, receiverId: value.receiverId}
                ]
            }
        })

        if (existRelationship) {
            return next(createError('User has following', 400))
        }
        await prisma.follow.create({
            data: {
                requesterId: req.user.id,
                receiverId: value.receiverId,
                status: STATUS_FOLLOWER
            }
        })

        res.status(201).json({message: 'Success following'})
    } catch (err) {
        next(err)
    }
};

