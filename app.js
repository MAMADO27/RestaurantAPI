require('dotenv').config();
const express = require('express');
const data_base = require('./config/data_base');
const global_error = require('./middleware/error_middelware');
const api_error = require('./utils/api_error');
const all_routes = require('./routes/index');
const rate_limit = require('express-rate-limit');
const hpp = require('hpp');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const app = express();

app.set('trust proxy', 1);
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// Custom sanitizer middleware (replaces mongo-sanitize)
const customSanitizer = (req, res, next) => {
    const sanitize = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                // Replace MongoDB operators
                obj[key] = obj[key].replace(/[$.]/g, '_');
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };
    // Only sanitize body, not query
    if (req.body) {
        sanitize(req.body);
    }
    next();
};


const limiter = rate_limit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/api/payment/paypal/webhook'
});

app.use(limiter);

app.use(helmet({contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    }}));

app.use(cors());
app.options('/*any', cors());
app.use(compression());


//Prevent HTTP Parameter Pollution attacks
app.use(hpp({
    whitelist: ['price','rating','category','cuisine','tags','page','limit','sort','fields','search']
}));
//Data sanitization against NoSQL query injection
//Prevent MongoDB Operator Injection (custom sanitizer - only on req.body)
app.use(customSanitizer);

// Passport configuration (Facebook & Google)
const passport = require('passport');
require('./config/FB_paasport');
require('./config/google_passport');
app.use(passport.initialize());

//DATA BASE CONNECTION
data_base();

//ALL ROUTES
all_routes(app);

//GLOBAL ERROR HANDLER
app.all('/*any', (req, res, next) => {
  next(new api_error(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(global_error);

//SOCKET IO SETUP
const server = require('http').createServer(app);

const socket_io = require('socket.io')(server, {
    cors: {origin: '*',methods: ['GET', 'POST']}
});
//SOCKET IO CONNECTION
socket_io.on('connection', (socket) => {
     // Customer joins his private room
    socket.on('join', (userId) => {
        socket.join(`customer_${userId}`);
    });
// Restaurant joins its room
    socket.on('join_restaurant', (restaurantId) => {
        socket.join(`restaurant_${restaurantId}`);
    });
//disconniction
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});
app.set('socket_io', socket_io);

const PORT = process.env.PORT || 2000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Welcome to the Restaurant API');
});
