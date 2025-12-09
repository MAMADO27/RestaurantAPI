require('dotenv').config();
const express = require('express');
const data_base = require('./config/data_base');
const auth_routes = require('./routes/auth_route');
const user_routes = require('./routes/user_route');
const restaurant_routes = require('./routes/restaurant_route');
//DATA BASE CONNECTION
data_base();

const app = express();
app.use(express.json());
app.use('/api/auth', auth_routes);
app.use('/api/users', user_routes);
app.use('/api/restaurants', restaurant_routes);

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Welcome to the Restaurant API');
});
