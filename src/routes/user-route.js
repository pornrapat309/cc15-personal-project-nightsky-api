const express = require('express');
const userController = require('../controllers/user-controller');
const authenticateMiddleware = require('../middlewares/authenticate');
const uploadMiddleware = require('../middlewares/upload');

const router = express.Router();

router.patch('/', 
authenticateMiddleware, 
uploadMiddleware.fields([
    {name: 'profileImage', maxCount: 1},
]),
userController.updateProfileImage)

router.get('/:userId', authenticateMiddleware, userController.getUserById)

module.exports = router;
