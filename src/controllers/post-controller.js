const fs = require("fs/promises");
const createError = require("../utils/create-error");
const prisma = require("../models/prisma");
const { upload } = require("../utils/coudinary-service");

const getFollowingId = async (targetUserId) => {
  const relationships = await prisma.follow.findMany({
    where: {
      OR: [{ requesterId: targetUserId }, { receiverId: targetUserId }],
    },
    include: {
      requester: true,
      receiver: true,
    },
  });
  let followingIds = [];
  relationships.forEach((el) => {
    if (el.requesterId === targetUserId) {
      followingIds.push(el.receiver.id);
    }
  });
  return followingIds;
};

exports.createPost = async (req, res, next) => {
  try {
    const { message } = req.body;
    if ((!message || !message.trim()) && !req.file) {
      return next(createError("image or message is required", 400));
    }
    const data = { userId: req.user.id };
    if (req.file) {
      data.image = await upload(req.file.path);
    }
    if (message) {
      data.message = message;
    }
    await prisma.post.create({
      data: data,
    });
    res.status(201).json({ message: "Create post complete" });
  } catch (err) {
    next(err);
  } finally {
    if (req.file) {
      fs.unlink(req.file.path);
    }
  }
};

exports.getAllPostIncludeFollowingPost = async (req, res, next) => {
  try {
    const followingIds = await getFollowingId(req.user.id);
    const posts = await prisma.post.findMany({
      where: {
        userId: {
          in: [...followingIds, req.user.id],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });
    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
};
