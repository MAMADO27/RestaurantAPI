const auth_routes = require('./auth_route');
const user_routes = require('./user_route');
const restaurant_routes = require('./restaurant_route');
const menu_item_routes = require('./menu_item_route');
const cart_routes = require('./cart_route');
const order_routes = require('./order_route');
const review_routes = require('./review_route');
const copon_routes = require('./copon_route');
const payment_route = require('./payment_route');

const all_routes = (app) => {
    app.use('/api/auth', auth_routes);
    app.use('/api/users', user_routes);
    app.use('/api/restaurants', restaurant_routes);
    app.use('/api/menu_items', menu_item_routes);
    app.use('/api/cart', cart_routes);
    app.use('/api/orders', order_routes);
    app.use('/api/reviews', review_routes);
    app.use('/api/copons', copon_routes);
    app.use('/api/payment', payment_route);
}

module.exports = all_routes;