const prisma = require("../models/prisma");
const createError = require("../utils/create-error");

exports.createComment = async (req, res, next) => {
  try {
    const { message, postId } = req.body;
    if (!message || !message.trim()) {
      return next(createError("message is required", 400));
    }
    const data = {};
    data.userId = req.user.id;
    data.postId = +postId;

    if (message) {
      data.message = message;
    }
    const comment = await prisma.comment.create({
      data: {
        message: data.message,
        userId: data.userId,
        postId: data.postId,
      },
    });
    await prisma.post.update({
      data: {
        totalComment: {
          increment: 1,
        },
      },
      where: {
        id: data.postId,
      },
    });
    res.status(201).json({ message: "Create comment complete", comment });
  } catch (err) {
    next(err);
  }
};

exports.getCommentByPostId = async (req, res, next) => {
  try {
    const id = +req.params.postId;
    const comment = await prisma.comment.findMany({
      where: {
        postId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            profileImage: true,
            username: true,
          },
        },
      },
    });
    res.status(200).json({ comment });
  } catch (err) {
    next(err);
  }
};
