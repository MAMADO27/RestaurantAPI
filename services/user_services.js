const asyncHandler = require('express-async-handler');
const User = require('../modules/user_module');
const create_token = require('../utils/create_token');
const api_error = require('../utils/api_error');
// Get user profile
// GET /api/users/profile
exports.get_user_profile = asyncHandler(async (req, res,next) => {
    const user = await User.findById(req.user.id).select('-password');
    if(user) {
        res.status(200).json({success: true,user});
    } else {
       
        return next(new api_error('User not found',404));
    }
   
});

exports.update_user = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const { name } = req.body;
    const document = await User.findByIdAndUpdate(
        req.params.id,
        {name: req.body.name,phone: req.body.phone, email: req.body.email, role: req.body.role},
        { new: true }
    );
    if (!document) {
        return next(new api_error('document not found', 404));
    }
    res.status(200).json({ success: true,data: document });
});