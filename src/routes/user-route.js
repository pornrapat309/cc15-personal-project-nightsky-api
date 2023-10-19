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
userController.updateProfile)

module.exports = router;
