# Restaurant Management System API

A comprehensive RESTful API for restaurant management with real-time order tracking, payment processing, and multi-authentication support.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Express](https://img.shields.io/badge/Express-v5.2.1-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v9.0-brightgreen)
![PayPal](https://img.shields.io/badge/PayPal-Integrated-blue)
![SendGrid](https://img.shields.io/badge/Email-SendGrid-00a4bd)
![Cloudinary](https://img.shields.io/badge/Images-Cloudinary-blue)
![Socket.IO](https://img.shields.io/badge/Real--time-Socket.IO-black)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Features

### Authentication & Authorization
- **JWT-based authentication** with role-based access control (Customer, Staff, Admin)
- **Social OAuth** login (Facebook & Google)
- **Password recovery** with email verification
- **Secure password hashing** using bcrypt (12 rounds)

### Restaurant & Menu Management
- **CRUD operations** for restaurants and menu items
- **Advanced search & filtering** with pagination
- **Cloudinary integration** for image uploads
- **Category-based menu organization**
- **Availability toggle** for menu items

### Shopping Cart
- **Persistent cart** per user
- **Multi-item support** from single restaurant
- **Real-time price calculation**

### Order Management
- **Complete order lifecycle** (Pending → Preparing → Delivered)
- **Order tracking** with real-time updates
- **Coupon system** with discount validation
- **Order history** with cursor pagination
- **Admin dashboard** for order statistics

### Payment Processing
- **PayPal integration** (Sandbox )
- **Cash on delivery** option
- **Webhook support** for automated order updates
- **Payment verification** and capture
- **Refund handling**

### Coupon System
- **Usage limits** and expiration dates
- **Per-user redemption** tracking
- **Minimum order value** requirements
- **Admin-only management**

### Real-time Notifications
- **Socket.IO integration** for live updates
- **Order status changes** notifications
- **Restaurant-specific** event rooms
- **Customer notifications**

###  Security Features
- **Rate limiting** (100 requests/15 min)
- **Helmet.js** for security headers
- **Input sanitization** (NoSQL injection prevention)
- **XSS protection**
- **HPP** (HTTP Parameter Pollution) prevention
- **CORS** configuration
- **Request compression**

---

## Tech Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js v5.2.1
- **Database:** MongoDB v9.0
- **ODM:** Mongoose
- **Authentication:** JWT, Passport.js
- **Payment:** PayPal SDK
- **Real-time:** Socket.IO
- **Email:** SendGrid
- **Image Upload:** Cloudinary
- **Validation:** Express-validator

### Security & Performance
- **Rate Limiting:** express-rate-limit
- **Security Headers:** Helmet
- **Sanitization:** express-mongo-sanitize, xss-clean
- **Compression:** compression
- **Password Hashing:** bcryptjs

---

## Project Structure
```
Restaurant-API/
├── config/
│   ├── data_base.js          # MongoDB connection
│   ├── FB_passport.js         # Facebook OAuth
│   └── google_passport.js     # Google OAuth
├── middleware/
│   ├── allow_to.js     
│   ├── error_middleware.js    # Global error handler
│   ├── upload_image_middleware.js        # Multer config
│   └── validator_middleware.js
├── modules/
│   ├── cart_module.js
│   ├── coupon_module.js
│   ├── menu_items_module.js
│   ├── order_modules.js
│   ├── restaurant_module.js
|   |__ review_module.js
│   └── user_module.js
├── routes/
│   ├── auth_route.js
│   ├── user_route.js
│   ├── restaurant_route.js
│   ├── menu_item_route.js
│   ├── cart_route.js
│   ├── order_route.js
│   ├── payment_route.js
│   ├── review_route.js
│   └── copon_route.js
|   └── index.js
│
├── services/
│   ├── auth_services.js
│   ├── user_services.js
│   ├── restaurant_services.js
│   ├── menu_item_services.js
│   ├── cart_services.js
│   ├── order_services.js
│   ├── payment_services.js
│   ├── review_services.js
│   └── copon_services.js
|   └── rating_avrg.js
├── utils/
│   ├── api_error.js           # Custom error class
│   ├── api_features.js        # Query features
│   ├── create_token.js        # JWT generation
│   ├── paypal.js              # PayPal SDK config
│   ├── sanitize.js            # Input sanitization
│   └── send_email.js          # Email service
├── validation/
│   ├── auth_validator.js
│   ├── cart_validator.js
│   ├── coupon_validator.js
│   └── ...
├── .env.example
├── .gitignore
├── app.js                     
|__ package.json
|__tst_notifications.html
```

---

## Installation

### Prerequisites
- Node.js v18 or higher
- MongoDB v6 or higher
- PayPal Developer Account
- SendGrid Account (for emails)
- Cloudinary Account (for images)

## Roles
- **Customer:** Can browse, order, and manage their own orders
- **Staff:** Can manage menu items and update order status
- **Admin:** Full access to all resources



## Security

### Implemented Measures

 **Rate Limiting:** 100 requests per 15 minutes  
 **Helmet:** Security headers (CSP, HSTS, etc.)  
 **Input Sanitization:** NoSQL injection prevention  
 **XSS Protection:** Clean user input  
 **HPP Protection:** Prevent parameter pollution  
 **CORS:** Configured origins  
 **Password Hashing:** bcrypt with 12 rounds  
 **JWT Expiration:** 30 days default  
 **Request Size Limit:** 10MB max  

### Best Practices

- Never commit `.env` file
- Use strong JWT secrets (32+ characters)
- Enable HTTPS in production
- Use environment-specific configs
- Regular security audits (`npm audit`)
---

##  License

This project is licensed under the MIT License .

---

## Author

**Your Name**
- GitHub: [@yourusername](https://github.com/MAMADO27)
- LinkedIn: [Your Profile](https://linkedin.com/in/mohammad-abd-elrahman)


---


<p align="center">Made by Your Name</p>

