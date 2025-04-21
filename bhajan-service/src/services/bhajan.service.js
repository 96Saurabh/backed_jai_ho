const Bhajan = require("../models/bhajan.model");

// ✅ Helper function for logging
const log = (message, data) => {
    console.log(`[${new Date().toISOString()}] ${message}`, data || '');
};

// ✅ Get all Bhajans
const getAllBhajans = async () => {
    try {
        log("Fetching all bhajans from database");
        const bhajans = await Bhajan.find();
        log(`Found ${bhajans.length} bhajans`);
        return bhajans;
    } catch (error) {
        log("Error fetching all bhajans:", error.message);
        throw new Error(`Database error while fetching bhajans: ${error.message}`);
    }
};

// ✅ Get Bhajan by ID
const getBhajanById = async (id) => {
    try {
        if (!id || typeof id !== 'string') {
            log("Invalid ID provided for getBhajanById:", id);
            throw new Error("Invalid bhajan ID");
        }
        log(`Fetching bhajan with ID: ${id}`);
        const bhajan = await Bhajan.findById(id);
        if (!bhajan) {
            log(`Bhajan not found with ID: ${id}`);
            return null;
        }
        log(`Found bhajan: ${bhajan.title}`);
        return bhajan;
    } catch (error) {
        log("Error fetching bhajan by ID:", error.message);
        if (error.name === 'CastError') {
            throw new Error("Invalid bhajan ID format");
        }
        throw new Error(`Database error while fetching bhajan: ${error.message}`);
    }
};

// ✅ Add new Bhajan
const addBhajan = async (data) => {
    try {
        if (!data || typeof data !== 'object') {
            log("Invalid data provided for addBhajan:", data);
            throw new Error("Invalid bhajan data");
        }
        log("Adding new bhajan:", data.title);
        const bhajan = new Bhajan(data);
        const savedBhajan = await bhajan.save();
        log(`Successfully added bhajan with ID: ${savedBhajan._id}`);
        return savedBhajan;
    } catch (error) {
        log("Error adding bhajan:", error.message);
        if (error.name === 'ValidationError') {
            throw new Error(`Validation error: ${error.message}`);
        }
        throw new Error(`Database error while adding bhajan: ${error.message}`);
    }
};

// ✅ Delete Bhajan by ID
const deleteBhajanById = async (id) => {
    try {
        if (!id || typeof id !== 'string') {
            log("Invalid ID provided for deleteBhajanById:", id);
            throw new Error("Invalid bhajan ID");
        }
        log(`Deleting bhajan with ID: ${id}`);
        const result = await Bhajan.findByIdAndDelete(id);
        if (!result) {
            log(`No bhajan found to delete with ID: ${id}`);
            return null;
        }
        log(`Successfully deleted bhajan: ${result.title}`);
        return result;
    } catch (error) {
        log("Error deleting bhajan:", error.message);
        if (error.name === 'CastError') {
            throw new Error("Invalid bhajan ID format");
        }
        throw new Error(`Database error while deleting bhajan: ${error.message}`);
    }
};

// ✅ Update Bhajan by ID (Partial Update)
const updateBhajanById = async (id, data) => {
    try {
        if (!id || typeof id !== 'string') {
            log("Invalid ID provided for updateBhajanById:", id);
            throw new Error("Invalid bhajan ID");
        }
        if (!data || typeof data !== 'object') {
            log("Invalid data provided for updateBhajanById:", data);
            throw new Error("Invalid update data");
        }
        log(`Updating bhajan with ID: ${id}`, data);
        const updatedBhajan = await Bhajan.findByIdAndUpdate(
            id, 
            data, 
            { 
                new: true, // Return the updated document
                runValidators: true // Validate the update against the schema
            }
        );
        if (!updatedBhajan) {
            log(`No bhajan found to update with ID: ${id}`);
            return null;
        }
        log(`Successfully updated bhajan: ${updatedBhajan.title}`);
        return updatedBhajan;
    } catch (error) {
        log("Error updating bhajan:", error.message);
        if (error.name === 'CastError') {
            throw new Error("Invalid bhajan ID format");
        }
        if (error.name === 'ValidationError') {
            throw new Error(`Validation error: ${error.message}`);
        }
        throw new Error(`Database error while updating bhajan: ${error.message}`);
    }
};

module.exports = { 
    getAllBhajans, 
    getBhajanById, 
    addBhajan, 
    deleteBhajanById,
    updateBhajanById 
};