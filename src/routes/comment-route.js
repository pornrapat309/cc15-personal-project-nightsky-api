const express = require("express");
const authenticateMiddleware = require("../middlewares/authenticate");
const commentController = require("../controllers/comment-controller");

const router = express.Router();

router.post("/", authenticateMiddleware, commentController.createComment);

module.exports = router;
