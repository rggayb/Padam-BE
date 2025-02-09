const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const WaterResourceInputType = require("./enum/WaterResourceInputType.enum");

const waterResourcesSchema = new mongoose.Schema({
    // id: {
    //     type: String,
    //     default: uuidv4,
    // },
    name: {
        type: String,
        required: true,             
    },
    description: {
        type: String,
    },
    type: {
        type: String,
        required: true,
        enum: WaterResourceInputType,
    },
    longitude: {
        type: Number,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    photos: {
        type: [String],
    },
}, { versionKey: false });

const WaterResources = mongoose.model("WaterResources", waterResourcesSchema);

module.exports = {
    WaterResources,
    waterResourcesSchema
};

