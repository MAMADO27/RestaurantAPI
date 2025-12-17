const asyncHandler = require('express-async-handler');
const User = require('../modules/user_module');
const create_token = require('../utils/create_token');
const api_error = require('../utils/api_error');
// Get user profile
// GET /api/users/profile
exports.get_user_profile = asyncHandler(async (req, res,next) => {
    const user = await User.findById(req.user.id).select('-password');
    if(user) {
        res.status(200).json(user);
    } else {
       
        return next(new api_error('User not found',404));
    }
    next();
});
   