const fs = require("fs/promises");
const createError = require("../utils/create-error");
const { upload } = require("../utils/coudinary-service");
const prisma = require("../models/prisma");
const { checkUserIdSchema } = require("../validators/user-validator");
const {
  AUTH_USER,
  UNKNOWN,
  FOLLOWER,
  FOLLOWING,
  INRELATIONSHIP,
} = require("../config/constants");

const getTargetUserStatusWithAuthUser = async (targetUserId, authUserId) => {
  if (targetUserId === authUserId) {
    return AUTH_USER;
  }
  const relationship = await prisma.follow.findMany({
    where: {
      OR: [
        { requesterId: targetUserId, receiverId: authUserId },
        { requesterId: authUserId, receiverId: targetUserId },
      ],
    },
  });

  if (relationship.length === 2) {
    return INRELATIONSHIP;
  }

  if (relationship.length === 0) {
    return UNKNOWN;
  }
  if (relationship[0].requesterId === authUserId) {
    return FOLLOWING;
  }
  if (relationship[0].receiverId === authUserId) {
    return FOLLOWER;
  }
};

const getTargetUserFollows = async (targetUserId) => {
  const relationships = await prisma.follow.findMany({
    where: {
      OR: [{ requesterId: targetUserId }, { receiverId: targetUserId }],
    },
    include: {
      requester: true,
      receiver: true,
    },
  });
  return relationships;
};

exports.getAlluser = async (req, res, next) => {
  try {
    const allUser = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        profileImage: true,
      },
    });
    res.status(200).json(allUser);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    if (!req.files) {
      return next(createError("profile image is require"));
    }
    const response = {};
    if (req.files.profileImage) {
      const url = await upload(req.files.profileImage[0].path);
      response.profileImage = url;
    }
    if (req.body.fullName) {
      response.fullName = req.body.fullName;
    }
    await prisma.user.update({
      data: response,
      where: {
        id: req.user.id,
      },
    });
    res.status(200).json(response);
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
    const { error } = checkUserIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    const userId = +req.params.userId;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    let status = null;

    if (user) {
      delete user.password;
      status = await getTargetUserStatusWithAuthUser(userId, req.user.id);
    }

    const follows = await getTargetUserFollows(userId);

    let following = [];
    let follower = [];

    follows.forEach((el) => {
      if (el.requesterId === userId) {
        following.push(el.receiver);
      } else if (el.receiverId === userId) {
        follower.push(el.requester);
      }
    });

    res.status(200).json({
      user,
      status,
      follower,
      following,
    });
  } catch (err) {
    next(err);
  }
};
