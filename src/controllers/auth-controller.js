const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {registerSchema, loginSchema} = require('../validators/auth-validator');
const prisma = require('../models/prisma');
const createError = require('../utils/create-error');

exports.register = async(req, res, next) => {
    try {
        const {value, error} = registerSchema.validate(req.body);
        if(error) {
            return next(error);
        }
        value.password = await bcrypt.hash(value.password, 12);

        const userExist = await prisma.user.findFirst({
            where: {
                OR: [
                    {email: value.email},
                    {mobile: value.mobile},
                    {username: value.username}
                ]
            }
        });
        if (value.email && userExist?.email === value.email) {
            res.status(400).json({
                message: "Email or Mobile is already in use",
                emailOrMobileExist: true
            });
        } else if ( value.mobile && userExist?.mobile === value.mobile) {
            res.status(400).json({
                message: "Email or Mobile is already in use",
                emailOrMobileExist: true
            });
        } else if (value.username && userExist?.username === value.username) {
            res.status(400).json({
                message: "username is already in use",
                usernameExist: true
            });
        }

        const user = await prisma.user.create({
            data: value
        });
        const payload = {userId: user.id};
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY || 'poiuytrewqlkjhgfdsa', {expiresIn: process.env.JWT_EXPIRE});
        delete user.password
        res.status(201).json({accessToken, user});    
    } catch (err) {
        next(err)
    }
};

exports.login = async(req, res, next) => {
    try {
        const {value, error} = loginSchema.validate(req.body);
        if (error) {
            next (error);
        }
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    {email: value.emailOrMobileOrUsername}, 
                    {mobile: value.emailOrMobileOrUsername}, 
                    {username: value.emailOrMobileOrUsername}
                ]
            }
        });
        if (!user) {
            return next(createError('Invalid credential', 400));
        }
        const isMatch = await bcrypt.compare(value.password, user.password);
        if (!isMatch) {
            return next(createError('Invalid credential', 400));
        }
        const payload = {userId: user.id};
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY || 'poiuytrewqlkjhgfdsa', {
            expiresIn: process.env.JWT_EXPIRE
        });
        delete user.password;
        res.status(200).json({accessToken, user});
    } catch (err) {
        next(err)
    }
};

exports.getMe = (req, res) => {
    res.status(200).json({ user: req.user });
};