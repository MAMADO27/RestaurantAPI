const MenuItem = require('../modules/menu_items_module');
const api_features = require('../utils/api_features');
const asyncHandler = require('express-async-handler');
const api_error = require('../utils/api_error');

// Create a new menu item
exports.create_menu_item = asyncHandler(async (req, res) => {
    const { name, description, price, category, restaurant, availability, image_url } = req.body;
    const menu_item = await MenuItem.create({
        name,description, price,category,restaurant,availability, image_url
    });
    res.status(201).json(menu_item);
});
// Get all menu items
exports.get_all_menu_items = asyncHandler(async (req, res) => {
    const countFeatures = new api_features(MenuItem.find(), req.query)
    .filter()
    .search('menuitems');

    const filteredDocs = await countFeatures.mongooseQuery;
    const count_docs = filteredDocs.length;
    const features = new api_features(MenuItem.find().populate('restaurant', 'name cuisine'), req.query)
        .filter().search('menuitems').sort().limitFields().paginate(count_docs);
    const menu_items = await features.mongooseQuery;
    res.status(200).json({
        results: menu_items.length,
        pagination: features.pagination_result,
        data: menu_items
    });
});
// Get menu item by ID
exports.get_menu_item_by_id = asyncHandler(async (req, res, next) => {
    const menu_item = await MenuItem.findById(req.params.id).populate('restaurant', 'name cuisine');
    if(menu_item) {
        res.status(200).json(menu_item);
    } else {
        return next(new api_error('Menu item not found',404));
    }
});
// Update menu item by ID
exports.update_menu_item_by_id = asyncHandler(async (req, res, next) => {
    const menu_item = await MenuItem.findById(req.params.id);
    if(menu_item) {
        menu_item.name = req.body.name || menu_item.name;
        menu_item.description = req.body.description || menu_item.description;
        menu_item.price = req.body.price || menu_item.price;
        menu_item.category = req.body.category || menu_item.category;
        menu_item.availability = req.body.availability !== undefined ? req.body.availability : menu_item.availability;
        menu_item.image_url = req.body.image_url || menu_item.image_url;
        const updated_menu_item = await menu_item.save();
        res.status(200).json(updated_menu_item);
    } else {
       
        return next(new api_error('Menu item not found',404));
    }
});
// Delete menu item by ID
exports.delete_menu_item_by_id = asyncHandler(async (req, res, next) => {
    const menu_item = await MenuItem.findById(req.params.id);
    if(menu_item) {
      await MenuItem.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Menu item deleted successfully' });
    } else {
        return next(new api_error('Menu item not found',404));
    }});