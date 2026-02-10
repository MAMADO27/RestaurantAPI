const asyncHandler = require('express-async-handler');
const api_error = require('../utils/api_error');
const User = require('../modules/user_module');
const Copon = require('../modules/copon_module');
const Order = require('../modules/order_modules');
exports.create_copon = asyncHandler(async (req, res, next) => {
    const { code, discount_value, expiration_date } = req.body;
    // Check if copon code already exists
    const copon_exists = await Copon.findOne({ code: code.toUpperCase() });
    if (copon_exists) {
        return next(new api_error('Copon code already exists', 400));
    }
    const copon = await Copon.create({
        code: code.toUpperCase(),
        discount_value,
        expiration_date,
        usage_limit: req.body.usage_limit
    });
    res.status(201).json({ success: true, data: copon });
});

exports.get_copons = asyncHandler(async (req, res, next) => {
    const copons = await Copon.find();
    res.status(200).json({ success: true, count: copons.length, data: copons });
});

exports.apply_copon = asyncHandler(async (req, res, next) => {
    const { code } = req.body;
    const copon = await Copon.findOne({ code: code.toUpperCase(), active: true });
    if (!copon) {
        return next(new api_error('Invalid or inactive copon code', 404));
    }
    if (new Date() > copon.expiration_date) {
        return next(new api_error('Copon code has expired', 400));
    }
    if (copon.usage_limit && copon.times_used >= copon.usage_limit) {
        return next(new api_error('Copon usage limit reached', 400));
    }
    
    
    res.status(200).json({ success: true, data: copon });
});

exports.deactivate_copon = asyncHandler(async (req, res, next) => {
    const { code } = req.body;
    const copon = await Copon.findOne({ code: code.toUpperCase() });
    if (!copon) {
        return next(new api_error('Copon code not found', 404));
    }
    copon.active = false;
    await copon.save();
    res.status(200).json({ success: true, data: copon });
}
);

exports.delete_copon = asyncHandler(async (req, res, next) => {
    const { code } = req.body;
    const copon = await Copon.findOneAndDelete({ code: code.toUpperCase() });
    if (!copon) {
        return next(new api_error('Copon code not found', 404));
    }
    res.status(200).json({ success: true, message: 'Copon deleted successfully' });
});