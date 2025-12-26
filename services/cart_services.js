const asyncHandler = require('express-async-handler');
const api_error = require('../utils/api_error');
const Cart = require('../modules/cart_module');
const User = require('../modules/user_module');
const MenuItem = require('../modules/menu_items_module');
// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private (Customer)
exports.add_to_cart = asyncHandler(async (req, res, next) => {
    const { menuItemId, quantity } = req.body;
    const userId = req.user.id;
    const parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return next(new api_error('Quantity must be greater than 0', 400));
    }
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
        return next(new api_error('Menu item not found', 404));
    }

    if (!menuItem.availability) {
        return next(new api_error('Menu item is not available', 400));
    }
    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = new Cart({ user: userId, cart: [] });
    }
    // Check if item already in cart
    const cartItemIndex = cart.cart.findIndex(
        item => item.menuItem.toString() === menuItemId
    );
    if (cartItemIndex > -1) {
        // Update existing item quantity
        cart.cart[cartItemIndex].quantity += parsedQuantity;
    } else {
        // Add new item to cart
        cart.cart.push({
            menuItem: menuItemId,
            quantity: parsedQuantity,
            price: menuItem.price
        });
    }
    await cart.save();
    // Populate cart items
    await cart.populate('cart.menuItem', 'name price category image_url');
    // Calculate total
    const total = cart.cart.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
    );
    res.status(200).json({
        success: true,message: 'Item added to cart',cart: cart.cart,total
    });
});
// @desc    Get user cart
// @route   GET /api/cart
// @access  Private (Customer)
exports.get_cart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user.id }).populate('cart.menuItem', 'name price category image_url');
    if (!cart || cart.cart.length === 0) {
        return res.status(200).json({
            success: true,message: 'Your cart is empty',cart: [],total: 0
        });
    }
    // Calculate total
    const total = cart.cart.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
    );
    res.status(200).json({
        success: true,cart: cart.cart, total
    });
});
// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private (Customer)
exports.update_cart_item = asyncHandler(async (req, res, next) => {
    const { quantity } = req.body;
    const { itemId } = req.params;
    const userId = req.user.id;
    const parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return next(new api_error('Quantity must be greater than 0', 400));
    }
    // Get cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        return next(new api_error('Cart not found', 404));
    }
    // Find cart item
    const cartItem = cart.cart.id(itemId);
    if (!cartItem) {
        return next(new api_error('Cart item not found', 404));
    }
    // Update quantity
    cartItem.quantity = parsedQuantity;
    await cart.save();
    // Populate cart items
    await cart.populate('cart.menuItem', 'name price category');
    // Calculate total
    const total = cart.cart.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
    );
    res.status(200).json({
        success: true,message: 'Cart item updated',cart: cart.cart, total
    });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private (Customer)
exports.remove_from_cart = asyncHandler(async (req, res, next) => {
    const { itemId } = req.params;
    const userId = req.user.id;
    // Get cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        return next(new api_error('Cart not found', 404));
    }
    // Find cart item
    const cartItem = cart.cart.id(itemId);
    if (!cartItem) {
        return next(new api_error('Cart item not found', 404));
    }
    // Remove item
    cart.cart.pull(itemId);
    await cart.save();
    // Populate remaining items
    await cart.populate('cart.menuItem', 'name price category');
    // Calculate total
    const total = cart.cart.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
    );
    res.status(200).json({
        success: true,message: 'Item removed from cart',cart: cart.cart,total
    });
});
// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private (Customer)
exports.clear_cart = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        return res.status(200).json({
            success: true, message: 'Cart is already empty',cart: [], total: 0
        });
    }
    cart.cart = [];
    await cart.save();
    res.status(200).json({
        success: true, message: 'Cart cleared',cart: [], total: 0
    });
});