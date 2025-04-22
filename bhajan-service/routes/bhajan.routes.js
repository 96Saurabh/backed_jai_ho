const express = require("express");
const { 
    uploadBhajan, 
    getBhajans, 
    getBhajan, 
    deleteBhajan, 
    updateBhajan,
    healthCheck 
} = require("../controllers/bhajan.controller");
const multer = require("multer");

const router = express.Router();

// ✅ Configure Multer for memory storage (for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit per file
        files: 3 // Max 3 files (audio, video, thumbnail)
    },
    fileFilter: (req, file, cb) => {
        // ✅ Basic file type validation
        const allowedTypes = {
            'audio': ['audio/mpeg', 'audio/mp3', 'audio/wav'],
            'video': ['video/mp4', 'video/mpeg'],
            'thumbnail': ['image/jpeg', 'image/png', 'image/jpg']
        };
        
        const fieldName = file.fieldname;
        if (allowedTypes[fieldName] && allowedTypes[fieldName].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type for ${fieldName}. Allowed types: ${allowedTypes[fieldName].join(', ')}`));
        }
    }
});

const uploadFields = upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]);

// ✅ Middleware to log requests
const logRequest = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.ip}`);
    next();
};

// ✅ Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error("❌ Multer Error:", err.message);
        return res.status(400).json({ 
            error: "File upload error",
            details: err.message 
        });
    } else if (err) {
        console.error("❌ File Validation Error:", err.message);
        return res.status(400).json({ 
            error: "Invalid file",
            details: err.message 
        });
    }
    next();
};

// ✅ Define Routes

// Health check route
router.get("/health", logRequest, healthCheck);

// Get all bhajans
router.get("/", logRequest, getBhajans);

// Get single bhajan by ID
router.get("/:id", logRequest, getBhajan);

// Upload new bhajan
router.post(
    "/upload", 
    logRequest,
    uploadFields, 
    handleMulterError,
    uploadBhajan
);

// Update bhajan (partial update)
router.patch(
    "/:id", 
    logRequest,
    uploadFields, 
    handleMulterError,
    updateBhajan
);

// Delete bhajan
router.delete("/:id", logRequest, deleteBhajan);

module.exports = router;