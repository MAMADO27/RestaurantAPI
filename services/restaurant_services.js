const Restaurant = require('../modules/restauant_module');
const asyncHandler = require('express-async-handler');
const api_features = require('../utils/api_features');
const api_error = require('../utils/api_error');
// Create a new restaurant
// POST /api/restaurants
exports.create_restaurant = asyncHandler(async (req, res) => {
    const { name, address, cuisine,phone} = req.body;
    const owner = req.user.id;
    const restaurant = await Restaurant.create({
        name,
        address,
        cuisine,
        owner,
        phone
    });
    res.status(201).json(restaurant);
});
// Get all restaurants
// GET /api/restaurants
exports.get_all_restaurants = asyncHandler(async (req, res) => {
   const countFeatures = new api_features(Restaurant.find(), req.query)
    .filter()
    .search('restaurants');
    const filteredDocs = await countFeatures.mongooseQuery;
    const count_docs = filteredDocs.length;
    const features = new api_features(Restaurant.find().populate('owner', 'name email'), req.query)
        .filter()
        .search('restaurants')
        .sort()
        .limitFields()
        .paginate(count_docs);
    const restaurants = await features.mongooseQuery;
    res.status(200).json({
        results: restaurants.length,
        pagination: features.pagination_result,
        data: restaurants
    });
});
// Get restaurant by ID
// GET /api/restaurants/:id
exports.get_restaurant_by_id = asyncHandler(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email');
    if(restaurant) {
        res.status(200).json(restaurant);
    } else {
        return next(new api_error('Restaurant not found',404));
    }
});
// Update restaurant by ID
// PUT /api/restaurants/:id
exports.update_restaurant_by_id = asyncHandler(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if(restaurant) {
        if(restaurant.owner.toString() !== req.user.id) {
            return next(new api_error('Not authorized to update this restaurant',403));
        }
        restaurant.name = req.body.name || restaurant.name;
        restaurant.address = req.body.address || restaurant.address;
        restaurant.cuisine = req.body.cuisine || restaurant.cuisine;
        restaurant.phone = req.body.phone || restaurant.phone;
        const updated_restaurant = await restaurant.save();
        res.status(200).json(updated_restaurant);
    } else {
        return next(new api_error('Restaurant not found', 404));
    }
});
// Delete restaurant by ID
// DELETE /api/restaurants/:id
exports.delete_restaurant_by_id = asyncHandler(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if(restaurant) {
        if(restaurant.owner.toString() !== req.user.id) {
            return next(new api_error('Not authorized to delete this restaurant',403));
        }
            await Restaurant.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Restaurant removed' });
    } else {
        return next(new api_error('Restaurant not found', 404));
    }
});
