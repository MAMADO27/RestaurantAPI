const Review = require('../modules/review_module');
const Restaurant = require('../modules/restauant_module');

exports.calc_average_rating = async (restaurant_id) => {
    const reviews = await Review.find({ restaurant: restaurant_id });
    if (reviews.length === 0) {
        await Restaurant.findByIdAndUpdate(restaurant_id, { rating: 0 });
        return;
    }
    const total_rating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average_rating = total_rating / reviews.length;
    await Restaurant.findByIdAndUpdate(restaurant_id, { rating: average_rating });
};