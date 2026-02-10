const multer = require('multer');
const api_error = require('../utils/api_error');

// Multer configuration
const multer_options = () => {
    const multer_storage = multer.memoryStorage();
    
    const multer_filter = (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new api_error('Not an image! Please upload images only.', 400), false);
        }
    };
    
    return multer({
      storage: multer_storage,
      fileFilter: multer_filter,
      limits: {
         fileSize: 50 * 1024 * 1024 // 50MB max
        }
    });
};

// Upload single image
exports.upload_single_image = (fieldName) => {
  return multer_options().single(fieldName);
};

exports.upload_multiple_images = (array_of_fields) => {
   return multer_options().fields(array_of_fields);
};


