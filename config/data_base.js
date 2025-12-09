const mongoose = require('mongoose');
const data_base =() =>{
     mongoose.connect(process.env.MONGO_URL)
        .then(() => {
            console.log('DB connection successful!');
        })
        .catch((err) => {
            console.error('DB connection error:', err);
            process.exit(1);
        });
}
module.exports = data_base;
