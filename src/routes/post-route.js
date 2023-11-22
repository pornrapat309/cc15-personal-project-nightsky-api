const express = require("express");
const authenticateMiddleware = require("../middlewares/authenticate");
const uploadMiddleware = require("../middlewares/upload");
const postController = require("../controllers/post-controller");
const likeController = require("../controllers/like-controller");

const router = express.Router();

router.post(
  "/",
  authenticateMiddleware,
  uploadMiddleware.single("image"),
  postController.createPost
);

router.patch(
  "/editPost/:postId",
  authenticateMiddleware,
  uploadMiddleware.single("image"),
  postController.editPost
);

router.get(
  "/following",
  authenticateMiddleware,
  postController.getAllPostIncludeFollowingPost
);

router.get("/getAllPosts", authenticateMiddleware, postController.getAllPosts);

router.delete("/:postId", authenticateMiddleware, postController.deletePost);

router.post("/:postId/like", authenticateMiddleware, likeController.toggleLike);

module.exports = router;
