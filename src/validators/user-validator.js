const Joi = require('joi');

const checkUserIdSchema = Joi.object({
    userId: Joi.number().integer().positive().required()
});
exports.checkUserIdSchema = checkUserIdSchema;

const checkReceiverIdSchema = Joi.object({
    receiverId: Joi.number().integer().positive().required()
});
exports.checkReceiverIdSchema = checkReceiverIdSchema;