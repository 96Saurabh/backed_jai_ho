const { getAllBhajans, getBhajanById, addBhajan, deleteBhajanById, updateBhajanById } = require("../services/bhajan.service");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");

// ✅ Upload Bhajan with Cloudinary (Audio, Video, and Thumbnail)
const uploadBhajan = async (req, res) => {
    try {
        console.log("🔥 Received Bhajan Upload Request from:", req.ip);

        // ✅ Extract form fields
        const { title, artist, language, duration, lyrics, genre, album, releaseYear, tags, isFeatured, uploadedBy } = req.body;
        console.log("📥 Request Body:", req.body);

        // ✅ Ensure required fields are present
        if (!title || !artist || !language || !duration) {
            console.error("❌ Validation Error: Missing required fields");
            return res.status(400).json({ 
                error: "Title, artist, language, and duration are required",
                receivedFields: req.body 
            });
        }

        // ✅ Get uploaded files
        console.log("📂 Received Files:", Object.keys(req.files || {}));
        const files = req.files || {};

        // ✅ Handle case with no files
        if (Object.keys(files).length === 0) {
            console.warn("⚠️ No files uploaded, proceeding with text data only");
        }

        // ✅ Prepare upload object
        let uploadedData = { audio: "", video: "", thumbnail: "" };

        // ✅ Upload each file to Cloudinary
        const uploadPromises = Object.entries(files).map(async ([fileKey, fileArray]) => {
            const file = fileArray[0]; // Get first file
            console.log(`📤 Uploading ${fileKey} to Cloudinary...`);

            const resourceType = fileKey === "video" ? "video" : "auto";

            try {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: resourceType },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    streamifier.createReadStream(file.buffer).pipe(stream);
                });
                console.log(`✅ Uploaded ${fileKey}:`, result.secure_url);
                uploadedData[fileKey] = result.secure_url;
            } catch (error) {
                console.error(`❌ Cloudinary Upload Error (${fileKey}):`, error);
                throw new Error(`Failed to upload ${fileKey}`);
            }
        });

        // ✅ Wait for all uploads to complete
        await Promise.all(uploadPromises);

        // ✅ Save Bhajan to MongoDB
        console.log("📦 Storing Bhajan Data in MongoDB...");
        const newBhajan = await addBhajan({
            title,
            artist,
            language,
            duration,
            lyrics: lyrics || "",
            genre: genre || "",
            album: album || "",
            releaseYear: releaseYear || "",
            tags: tags || [],
            isFeatured: isFeatured === "true" || false,
            uploadedBy: uploadedBy || "anonymous",
            ...uploadedData
        });

        console.log("✅ Bhajan Uploaded Successfully:", newBhajan._id);
        res.status(201).json(newBhajan);

    } catch (error) {
        console.error("❌ Unexpected Error Uploading Bhajan:", error.stack);
        res.status(500).json({ 
            error: "Failed to upload bhajan",
            details: error.message 
        });
    }
};

// ✅ Fetch all Bhajans
const getBhajans = async (req, res) => {
    try {
        console.log("📦 Fetching All Bhajans for request from:", req.ip);
        const bhajans = await getAllBhajans();
        if (!bhajans || bhajans.length === 0) {
            console.warn("⚠️ No bhajans found in database");
        }
        res.status(200).json(bhajans);
    } catch (error) {
        console.error("❌ Error Fetching Bhajans:", error.stack);
        res.status(500).json({ 
            error: "Server error while fetching bhajans",
            details: error.message 
        });
    }
};

// ✅ Fetch a single Bhajan by ID
const getBhajan = async (req, res) => {
    try {
        console.log(`🔍 Fetching Bhajan with ID: ${req.params.id} from: ${req.ip}`);
        const bhajan = await getBhajanById(req.params.id);
        if (!bhajan) {
            console.error("❌ Bhajan Not Found");
            return res.status(404).json({ error: "Bhajan not found" });
        }
        res.status(200).json(bhajan);
    } catch (error) {
        console.error("❌ Error Fetching Bhajan:", error.stack);
        res.status(500).json({ 
            error: "Server error while fetching bhajan",
            details: error.message 
        });
    }
};

// ✅ Delete Bhajan (Including Cloudinary Files)
const deleteBhajan = async (req, res) => {
    try {
        console.log(`🗑️ Deleting Bhajan with ID: ${req.params.id} requested by: ${req.ip}`);
        const bhajan = await getBhajanById(req.params.id);
        if (!bhajan) {
            console.error("❌ Bhajan Not Found for Deletion");
            return res.status(404).json({ error: "Bhajan not found" });
        }

        // ✅ Delete from Cloudinary
        console.log("🚀 Removing Bhajan Files from Cloudinary...");
        const deletePromises = [];
        if (bhajan.audio) deletePromises.push(cloudinary.uploader.destroy(bhajan.audio));
        if (bhajan.video) deletePromises.push(cloudinary.uploader.destroy(bhajan.video));
        if (bhajan.thumbnail) deletePromises.push(cloudinary.uploader.destroy(bhajan.thumbnail));
        await Promise.all(deletePromises);

        // ✅ Remove from MongoDB
        await deleteBhajanById(req.params.id);
        console.log("✅ Bhajan Deleted Successfully");
        res.status(200).json({ message: "Bhajan deleted successfully" });

    } catch (error) {
        console.error("❌ Error Deleting Bhajan:", error.stack);
        res.status(500).json({ 
            error: "Error deleting bhajan",
            details: error.message 
        });
    }
};

// ✅ Update Bhajan (Partial Update - PATCH)
const updateBhajan = async (req, res) => {
    try {
        console.log(`✏️ Updating Bhajan with ID: ${req.params.id} from: ${req.ip}`);

        const { title, artist, language, duration, lyrics, genre, album, releaseYear, tags, isFeatured } = req.body;
        const files = req.files || {};

        const bhajan = await getBhajanById(req.params.id);
        if (!bhajan) {
            console.error("❌ Bhajan Not Found for Update");
            return res.status(404).json({ error: "Bhajan not found" });
        }

        // ✅ Prepare updated data object
        let updatedData = {
            title: title || bhajan.title,
            artist: artist || bhajan.artist,
            language: language || bhajan.language,
            duration: duration || bhajan.duration,
            lyrics: lyrics || bhajan.lyrics,
            genre: genre || bhajan.genre,
            album: album || bhajan.album,
            releaseYear: releaseYear || bhajan.releaseYear,
            tags: tags || bhajan.tags,
            isFeatured: isFeatured !== undefined ? isFeatured : bhajan.isFeatured,
        };

        // ✅ Upload new media files to Cloudinary (if provided)
        const uploadPromises = Object.entries(files).map(async ([fileKey, fileArray]) => {
            const file = fileArray[0];
            console.log(`📤 Uploading ${fileKey} to Cloudinary...`);

            const resourceType = fileKey === "video" ? "video" : "auto";
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: resourceType },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                streamifier.createReadStream(file.buffer).pipe(stream);
            });
            updatedData[fileKey] = result.secure_url;
        });

        await Promise.all(uploadPromises);

        // ✅ Update Bhajan in MongoDB
        const updatedBhajan = await updateBhajanById(req.params.id, updatedData);

        console.log("✅ Bhajan Updated Successfully:", updatedBhajan._id);
        res.status(200).json(updatedBhajan);

    } catch (error) {
        console.error("❌ Error Updating Bhajan:", error.stack);
        res.status(500).json({ 
            error: "Error updating bhajan",
            details: error.message 
        });
    }
};

// ✅ Health check endpoint
const healthCheck = (req, res) => {
    console.log("🏥 Health check requested from:", req.ip);
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
};

module.exports = { 
    uploadBhajan, 
    getBhajans, 
    getBhajan, 
    deleteBhajan, 
    updateBhajan,
    healthCheck 
};