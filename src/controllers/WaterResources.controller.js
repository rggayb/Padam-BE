const sendResponse = require("../utils/Response.utils");
const { ErrorResponseType } = require("../models/enum/ErrorResponseType.enum");
const { ResponseType } = require("../models/enum/ResponseType.enum");
const WaterSources = require("../services/WaterResources.service");

exports.createWaterResource = async (req, res) => {
    try {
        const waterResource = await WaterSources.createWaterResource(req.body);
        sendResponse(res, ResponseType.SUCCESS, 200, "Water source created successfully", waterResource);
    } catch (error) {
        sendResponse(
            res, 
            ResponseType.ERROR, 
            500, 
            "Internal server error", 
            null, 
            ErrorResponseType.SERVER_ERROR, 
            error.message
        );
    }
};

exports.getWaterSources = async (req, res) => {
    try {
        const waterSources = await WaterSources.getWaterResources();
        sendResponse(res, ResponseType.SUCCESS, 200, "Water sources retrieved successfully", waterSources);
    } catch (error) {
        sendResponse(res, ResponseType.ERROR, 500, "Internal server error", null, ErrorResponseType.SERVER_ERROR, error.message);
    }
};

exports.getWaterSourceById = async (req, res) => {
    try {
        const waterSource = await WaterSources.getWaterResourceById(req.params.id);
        sendResponse(res, ResponseType.SUCCESS, 200, "Water source retrieved successfully", waterSource);
    } catch (error) {
        if (error.message === "Water resource not found") {
            sendResponse(
                res,
                ResponseType.ERROR,
                404,
                "Water source not found",
                null,
                ErrorResponseType.RESOURCE_NOT_FOUND,
                error.message
            );
        } else {
            sendResponse(
                res,
                ResponseType.ERROR,
                500,
                "Internal server error",
                null,
                ErrorResponseType.SERVER_ERROR,
                error.message
            );
        }
    }
};

exports.updateWaterSourceById = async (req, res) => {
    try {
        const waterSource = await WaterSources.updateWaterResourceById(req.params.id, req.body);
        sendResponse(res, ResponseType.SUCCESS, 200, "Water source updated successfully", waterSource);
    } catch (error) {
        if (error.message === "Water resource not found") {
            sendResponse(
                res,
                ResponseType.ERROR,
                404,
                "Water source not found",
                null,
                ErrorResponseType.RESOURCE_NOT_FOUND,
                error.message
            );
        } else {    
            sendResponse(
                res,
                ResponseType.ERROR,
                500,
                "Internal server error",
                null,
                ErrorResponseType.SERVER_ERROR, 
                error.message
            );
        }
    }
};

exports.deleteWaterResourceById = async (req, res) => {
    try {
        await WaterSources.deleteWaterResourceById(req.params.id);
        sendResponse(res, ResponseType.SUCCESS, 200, "Water source deleted successfully", null);
    } catch (error) {
        if (error.message === "Water resource not found") {
            sendResponse(
                res,
                ResponseType.ERROR,
                404,
                "Water source not found",
                null,
                ErrorResponseType.RESOURCE_NOT_FOUND,
                error.message
            );
        } else {
            sendResponse(
                res,
                ResponseType.ERROR,
                500,
                "Internal server error",
                null,
                ErrorResponseType.SERVER_ERROR,
                error.message
            );
        }
    }
};
