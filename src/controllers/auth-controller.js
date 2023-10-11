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
        console.log(value)
        const user = await prisma.user.create({
            data: value
        });
        const payload = {userId: user.id};
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY || 'poiuytrewqlkjhgfdsa', {expiresIn: process.env.JWT_EXPIRE});
        // delete user.password
        res.status(201).json({accessToken});
    } catch (err) {
        next(err)
    }
};