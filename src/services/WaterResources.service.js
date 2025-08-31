const { WaterSources } = require("../models/WaterResources.model")

exports.createWaterResource = async (body) => {
    const waterResource = new WaterSources({
        name: body.name,
        notes: body.notes || "",
        address: body.address,
        coordinates: {
            longitude: body.longitude,
            latitude: body.latitude
        },
        status: typeof body.status === 'boolean' ? body.status : false, // Handle boolean status
        images: body.images || []
    });

    const result = await waterResource.save();
    return result;
};

exports.getWaterResources = async () => {
    const waterResources = await WaterSources.find();
    return waterResources;
};

exports.getWaterResourceById = async (params) => {
    const waterResource = await WaterSources.findById(params);
    if (!waterResource) {
        throw new Error("Water resource not found");
    }
    return waterResource;
};

exports.updateWaterResourceById = async (params, body) => {
    // Handle coordinates update
    const updateData = { ...body };
    if (body.longitude || body.latitude) {
        updateData.coordinates = {
            longitude: body.longitude || body.coordinates?.longitude,
            latitude: body.latitude || body.coordinates?.latitude
        };
        // Remove individual longitude/latitude from update data
        delete updateData.longitude;
        delete updateData.latitude;
    }

    const waterResource = await WaterSources.findByIdAndUpdate(params, updateData, { new: true });
    if (!waterResource) {
        throw new Error("Water resource not found");
    }
    return waterResource;
};

exports.deleteWaterResourceById = async (params) => {
    const waterResource = await WaterSources.findByIdAndDelete(params);
    if (!waterResource) {
        throw new Error("Water resource not found");
    }
    return waterResource;
};
