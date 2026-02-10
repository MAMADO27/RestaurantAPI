const MenuItem = require('../modules/menu_items_module');
const api_features = require('../utils/api_features');
const asyncHandler = require('express-async-handler');
const api_error = require('../utils/api_error');
const Restaurant = require('../modules/restauant_module');
const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// Upload menu item image
exports.upload_menu_item_image = asyncHandler(async (req, res, next) => {
    const fileBuffer = (req.file && req.file.buffer) || (req.files && req.files.image && req.files.image[0] && req.files.image[0].buffer);
    if (!fileBuffer) {
       return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
    {
        folder: 'images',
        public_id: `image-${uuidv4()}`,
        resource_type: 'image',
        transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' }
        ]
    },
    (error, result) => {
        if (error) return reject(error);
          resolve(result);
    });
    streamifier.createReadStream(fileBuffer).pipe(stream);
});
    req.body = req.body || {};
    req.body.image = result.secure_url;
    req.body.cloudinary_id = result.public_id;

    return next();
});

// Create a new menu item
exports.create_menu_item = asyncHandler(async (req, res) => {
    const { name, description, price, category, restaurant, availability, image } = req.body || {};

    const menu_item = await MenuItem.create({
        name, description, price, category, restaurant, availability, image
    });
    res.status(201).json({ success: true, menu_item });
});
// Get all menu items
exports.get_all_menu_items = asyncHandler(async (req, res,next) => {
    const countFeatures = new api_features(MenuItem.find(), req.query).filter().search('menuitems');
    const restaurant_id = req.params.restaurant_id;
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
        return next(new api_error('Restaurant not found', 404));
    }
    //cursor
  const features = new api_features(
    MenuItem.find({ restaurant: restaurant_id })
      .populate('restaurant', 'name cuisine image'),
    req.query
  ).filter().search('menu_items').sort().limitFields().cursor_paginate();
  
  const menu_items = await features.mongooseQuery;

  let nextCursor = null;
  if (menu_items.length > features.cursor_limit) {
    nextCursor = menu_items[features.cursor_limit - 1].createdAt;
    menu_items.pop();
  }

  res.status(200).json({
    success: true,
    results: menu_items.length,
    nextCursor,
    data: menu_items
  });
});
// Get menu item by ID
exports.get_menu_item_by_id = asyncHandler(async (req, res, next) => {
    const menu_item = await MenuItem.findById(req.params.id).populate('restaurant', 'name cuisine image');
    if(menu_item) {
        res.status(200).json({success: true,menu_item});
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
        if(req.body.image && menu_item.cloudinary_id) {
            await cloudinary.uploader.destroy(menu_item.cloudinary_id);
        }
        menu_item.image = req.body.image || menu_item.image;
        const updated_menu_item = await menu_item.save();
        res.status(200).json({success: true,updated_menu_item});
    } else {
       
        return next(new api_error('Menu item not found',404));
    }
});
// Delete menu item by ID
exports.delete_menu_item_by_id = asyncHandler(async (req, res, next) => {
    const menu_item = await MenuItem.findById(req.params.id);
    if(menu_item) {
      await MenuItem.findByIdAndDelete(req.params.id);
        res.status(200).json({success: true, message: 'Menu item deleted successfully' });
    } else {
        return next(new api_error('Menu item not found',404));
    }});