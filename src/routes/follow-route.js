const express = require('express');
const followController = require('../controllers/follow-controller');
const authenticateMiddleware = require('../middlewares/authenticate');

const router = express.Router();

router.post('/:receiverId', authenticateMiddleware, followController.requestFollow);

router.delete('/:receiverId/unfollow', authenticateMiddleware, followController.unfollow)


module.exports = router;