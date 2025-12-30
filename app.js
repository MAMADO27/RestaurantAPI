require('dotenv').config();
const express = require('express');
const data_base = require('./config/data_base');
const auth_routes = require('./routes/auth_route');
const user_routes = require('./routes/user_route');
const restaurant_routes = require('./routes/restaurant_route');
const menu_item_routes = require('./routes/menu_item_route');
const global_error = require('./middleware/error_middelware');
const api_error = require('./utils/api_error');
const cart_routes = require('./routes/cart_route');
const order_routes = require('./routes/order_route');
const payment_routes = require('./routes/payment_route');
//DATA BASE CONNECTION
data_base();

const app = express();
app.use(express.json());
app.use('/api/auth', auth_routes);
app.use('/api/users', user_routes);
app.use('/api/restaurants', restaurant_routes);
app.use('/api/menu_items', menu_item_routes);
app.use('/api/cart', cart_routes);
app.use('/api/orders', order_routes);
app.use('/api/payments', payment_routes);


app.all('/*any', (req, res, next) => {
  next(new api_error(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(global_error);

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Welcome to the Restaurant API');
});
