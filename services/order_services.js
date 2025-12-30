const Order = require('../modules/order_modules');
const mongoose = require('mongoose');
const api_error = require('../utils/api_error');
const asyncHandler = require('express-async-handler');
const Cart = require('../modules/cart_module');
const MenuItem = require('../modules/menu_items_module');
const api_features = require('../utils/api_features');

exports.create_order= asyncHandler(async (req, res, next) => {
    const { deliveryAddress, notes } = req.body;
    const order = new Order({
        deliveryAddress,notes
    });
    const user_id=req.user.id;
    if (!user_id) {
        return next(new api_error('User not authenticated', 401));
    }
    let cart = await Cart.findOne({ user: user_id }).populate('cart.menuItem');
    if (!cart || cart.cart.length === 0) {
        return next(new api_error('Cart is empty', 400));
    }
    const first_item = cart.cart[0].menuItem.restaurant;
    const restaurant_id=first_item;
    
    const same_restaurant = cart.cart.every(
    item => item.menuItem.restaurant.toString() === first_item.toString());
    if(!same_restaurant){
        return next(new api_error('All items in the cart must be from the same restaurant',400));
    }
    const unavailableItems = cart.cart.filter(
    item => !item.menuItem.availability
    );

    if (unavailableItems.length > 0) {
        return next(new api_error('Some items are not available', 400));
    }     
    order.items = cart.cart.map(item => ({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: item.price
    }));
    order.customer = user_id;
    order.restaurant = restaurant_id;
    const subtotal = order.items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
);
    const tax = subtotal * 0.14;
    const deliver_fee = 10;
    order.totalPrice = subtotal + tax + deliver_fee;
    order.tax = tax;
    order.deliver_fee = deliver_fee;
    await order.save();
    cart.cart = [];
    await cart.save();
    res.status(201).json({
        success: true,
        message: 'Order created successfully',
       order
    });
});

exports.get_users_order= asyncHandler(async (req, res, next) => {
    const user_id=req.user.id;
    const count_docs = await Order.countDocuments({ customer: user_id });
    const features = new api_features(Order.find({ customer: user_id }).populate('items.menuItem', 'name price')
    .populate('restaurant', 'name address'), req.query)
    .sort()
    .limitFields()
    .paginate(count_docs);
    const orders = await features.mongooseQuery;
    res.status(200).json({
        success: true,
        orders,
        pagination: features.pagination_result
    });
});

exports.get_restaurant_orders= asyncHandler(async (req, res, next) => {
    const restaurant_id=req.params.restaurant_id;
    if(!restaurant_id){
        return next(new api_error('User not authenticated as restaurant',401));
    }
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        return next(new api_error('Access denied: Not a restaurant user', 403));
    }

    const count_docs = await Order.countDocuments({ restaurant: restaurant_id });
    const features = new api_features(Order.find({ restaurant: restaurant_id }).populate('items.menuItem', 'name price')
    .populate('customer', 'name email'), req.query)
    .sort()
    .limitFields()
    .paginate(count_docs);
    const orders = await features.mongooseQuery;
    res.status(200).json({
        success: true,
        orders,
        pagination: features.pagination_result
    });
});

exports.get_order_by_id= asyncHandler(async (req, res, next) => {
    const order_id=req.params.id;
    const order = await Order.findById(order_id)
    .populate('items.menuItem', 'name price')
    .populate('customer', 'name email')
    .populate('restaurant', 'name address');
    if(!order){
        return next(new api_error('Order not found',404));
    }
    const is_customer=order.customer._id.toString() === req.user._id.toString();
    const is_admin=req.user.role==='admin';
    if (!is_customer && !is_admin) {
        return next(new api_error('Not authorized to view this order',403));
    }
   
    res.status(200).json({
        success: true,
        order
    });
});

exports.update_order_status= asyncHandler(async (req, res, next) => {
    const order_id=req.params.id;
    const order = await Order.findById(order_id);
    const { status } = req.body;
    const validTransitions = {
    'pending': ['preparing', 'cancelled'],
    'preparing': ['delivered', 'cancelled'],
    'delivered': [],
    'cancelled': []
    };
    if (!validTransitions[order.status]?.includes(status)) {
    return next(new api_error(
        `Cannot change status from ${order.status} to ${status}`, 
        400
    ));
   }
    
    if(!order){
        return next(new api_error('Order not found',404));
    }
    order.status = status;
    await order.save();
    res.status(200).json({
        success: true,
        message: 'Order status updated',
        order
    });
});

exports.cansel_order= asyncHandler(async (req, res, next) => {
    const order_id=req.params.id;
    const order = await Order.findById(order_id);
    if(!order){
        return next(new api_error('Order not found',404));
    }
    if (order.customer.toString() !== req.user._id.toString()) {
    return next(new api_error('Not authorized', 403));
    }
    if (order.status !== 'pending') {
    return next(new api_error('Can only cancel pending orders', 400));
    }
    order.status = 'cancelled';
    await order.save();
    res.status(200).json({
        success: true,
        message: 'Order cancelled',
        order
    });
});

exports.get_order_stats= asyncHandler(async (req, res, next) => {
    const restaurant_id = req.params.restaurant_id;
    const stats = await Order.aggregate([
        { $match: { restaurant: new mongoose.Types.ObjectId(restaurant_id) } },
        { $group: {
            _id: '$status',
            count: { $sum: 1 },
            total_revenue: { $sum: '$totalPrice' }
        } }
    ]);
    res.status(200).json({
        success: true,
        stats
    });
});

   