const mongoose = require("mongoose");

const waterSourcesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,             
    },
    notes: {
        type: String,
        default: ""
    },
    address: {
        type: String,
    },
    coordinates: {
        type: {
            longitude: {
                type: String,
                required: true,
            },
            latitude: {
                type: String,
                required: true,
            }
        },
        required: true,
    },
    status: {
        type: Boolean,  // Changed to Boolean
        default: false  // Default to false (mati)
    },
    images: {
        type: [String],  // Array of image URLs or file paths
        default: []
    },
}, { 
    versionKey: false,
    collection: 'waterSources'  // Explicitly specify collection name
});

const WaterSources = mongoose.model("WaterSources", waterSourcesSchema);

module.exports = {
    WaterSources,
    waterSourcesSchema
};

