const { WaterResources } = require("../models/WaterResources.model")

exports.createWaterResource = async (body) => {
    const { name, description, type, longitude, latitude } = body;
    if (!name) {
        throw new Error("Name is required");
    }
    if (!type) {
        throw new Error("Type is required");
    }
    if (!longitude) {
        throw new Error("Longitude is required");
    }
    if (!latitude) {
        throw new Error("Latitude is required");
    }

    const waterResource = new WaterResources({
        name,
        description,
        type,
        longitude,
        latitude
    })

    await waterResource.save();

    return waterResource;
};

exports.getWaterResources = async () => {
    const waterResources = await WaterResources.find();
    return waterResources;
};

exports.getWaterResourceById = async (params) => {
    const waterResource = await WaterResources.findById(params);
    if (!waterResource) {
        throw new Error("Water resource not found");
    }
    return waterResource;
};

exports.updateWaterResourceById = async (params, body) => {
    const waterResource = await WaterResources.findByIdAndUpdate(params, body, { new: true });
    if (!waterResource) {
        throw new Error("Water resource not found");
    }

    return waterResource;
};

exports.deleteWaterResourceById = async (params) => {
    const waterResource = await WaterResources.findByIdAndDelete(params);
    if (!waterResource) {
        throw new Error("Water resource not found");
    }
   
    return {
        message: "Water resource deleted successfully"
    };
};
