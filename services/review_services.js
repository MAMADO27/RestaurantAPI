const Review = require('../modules/review_module');
const Restaurant = require('../modules/restauant_module');
const api_error = require('../utils/api_error');
const asyncHandler = require('express-async-handler');
const api_features = require('../utils/api_features');
const Order = require('../modules/order_modules');
const { calc_average_rating } = require('./rating_avrg');

exports.create_review = asyncHandler(async (req, res, next) => {
    const { restaurant_id, rating, comment } = req.body;
    const user_id = req.user.id;
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
        return next(new api_error('Restaurant not found', 404));
    }
    const hands_on= await Order.findOne({ customer: user_id, restaurant: restaurant_id, status: 'delivered' });
    if (!hands_on) {
        return next(new api_error('You can only review restaurants you have ordered from', 400));
    }
    const existing_review = await Review.findOne({ user: user_id, restaurant: restaurant_id });
    if (existing_review) {
        return next(new api_error('You have already reviewed this restaurant', 400));
    }
    const review = await Review.create({
        user: user_id,
        restaurant: restaurant_id,
        rating,
        comment
    });
    calc_average_rating(restaurant_id);
    // -----Emit socket.io event to notify restaurant of new review------
    const socket_io = req.app.get('socket_io');
       socket_io.to(`restaurant_${restaurant_id}`).emit('new_review', {
        type: 'new_review',
        message: 'New review received',
        reviewId: review._id,
        rating: review.rating,
        customerName: req.user.name,
        timestamp: new Date()
    });
    res.status(201).json(review);
});

exports.get_restaurant_reviews = asyncHandler(async (req, res, next) => {
    const restaurant_id = req.params.restaurant_id;
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
        return next(new api_error('Restaurant not found', 404));
    }
    const apiFeatures = new api_features(Review.find({ restaurant: restaurant_id }).populate('user', 'name email'), req.query)
        .sort()
        .limitFields()
        .paginate(count_docs);
    const reviews = await apiFeatures.mongooseQuery;
    calc_average_rating(restaurant_id);
    res.status(200).json({
        results: reviews.length,
        data: reviews
    });
});

exports.get_my_reviews = asyncHandler(async (req, res, next) => {
    const user_id = req.user.id;
    const apiFeatures = new api_features(Review.find({ user: user_id }).populate('restaurant', 'name cuisine'), req.query)
        .sort()
        .limitFields()
        .paginate(count_docs);
    const reviews = await apiFeatures.mongooseQuery;
    res.status(200).json({
        results: reviews.length,
        data: reviews
    });
});

exports.update_review_by_id = asyncHandler(async (req, res, next) => {
    const review_id = req.params.id;
    const user_id = req.user.id;
    const review = await Review.findById(review_id);
    if (!review) {
        return next(new api_error('Review not found', 404));
    }
    if (review.user.toString() !== user_id) {
        return next(new api_error('Not authorized to update this review', 403));
    }
    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    const updated_review = await review.save();
    calc_average_rating(review.restaurant);
    res.status(200).json(updated_review);
});

exports.delete_review_by_id = asyncHandler(async (req, res, next) => {
    const review_id = req.params.id;
    const user_id = req.user.id;
    const review = await Review.findById(review_id);
    if (!review) {
        return next(new api_error('Review not found', 404));
    }
    if (review.user.toString() !== user_id) {
        return next(new api_error('Not authorized to delete this review', 403));
    }
    await Review.findByIdAndDelete(review_id);
    calc_average_rating(review.restaurant);
    res.status(204).json();
});