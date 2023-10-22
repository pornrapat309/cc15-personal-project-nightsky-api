const express = require('express');
const followController = require('../controllers/follow-controller');
const authenticateMiddleware = require('../middlewares/authenticate');

const router = express.Router();

router.post('/:receiverId', authenticateMiddleware, followController.requestFollow);

module.exports = router;