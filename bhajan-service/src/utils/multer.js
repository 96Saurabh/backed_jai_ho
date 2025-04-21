// utils/multer.js
const multer = require("multer");
const cloudinary = require("./cloudinary");

// Configure Multer (for handling file uploads)
const upload = multer({ storage: multer.memoryStorage() });

const uploadToCloudinary = (fileBuffer, resourceType) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: resourceType },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
};


module.exports = { upload, uploadToCloudinary };
