const asyncHandler = require('express-async-handler');
const User = require('../modules/user_module');
const create_token = require('../utils/create_token');
// Get user profile
// GET /api/users/profile
exports.get_user_profile = asyncHandler(async (req, res,next) => {
    const user = await User.findById(req.user.id).select('-password');
    if(user) {
        res.status(200).json(user);
    } else {
        res.status(404);
        return next(new Error('User not found'));
    }
    next();
});
   