const mongoose = require("mongoose");

const BhajanSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    language: { type: String, required: true, default: "Hindi" },
    audio: { type: String, required: true },
    video: { type: String },
    duration: { type: Number, required: true },
    lyrics: { type: String }, // Optional field for lyrics
    genre: { type: String }, // Example: "Kirtan", "Aarti", etc.
    album: { type: String }, // Example: "Bhakti Sangeet Collection"
    releaseYear: { type: Number },
    thumbnail: { type: String }, // URL for thumbnail image
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    tags: [{ type: String }], // Example: ["Hanuman", "Krishna", "Morning Bhajan"]
    isFeatured: { type: Boolean, default: false }, // Flag for featured bhajans
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to user schema
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bhajan", BhajanSchema);