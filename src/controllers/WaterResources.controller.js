const sendResponse = require("../utils/Response.utils");
const { ErrorResponseType } = require("../models/enum/ErrorResponseType.enum");
const { ResponseType } = require("../models/enum/ResponseType.enum");
const WaterResources = require("../services/WaterResources.service");

exports.createWaterResource = async (req, res) => {
    try {
        const waterResource = await WaterResources.createWaterResource(req.body);
        sendResponse(res, ResponseType.SUCCESS, 200, "Water resource created successfully", waterResource);
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

exports.getWaterResources = async (req, res) => {
    try {
        const waterResources = await WaterResources.getWaterResources();
        sendResponse(res, ResponseType.SUCCESS, 200, "Water resources retrieved successfully", waterResources);
    } catch (error) {
        sendResponse(res, ResponseType.ERROR, 500, "Internal server error", null, ErrorResponseType.SERVER_ERROR, error.message);
    }
};

exports.getWaterResourceById = async (req, res) => {
    try {
        const waterResource = await WaterResources.getWaterResourceById(req.params.id);
        sendResponse(res, ResponseType.SUCCESS, 200, "Water resource retrieved successfully", waterResource);
    } catch (error) {
        if (error.message === "Water resource not found") {
            sendResponse(
                res,
                ResponseType.ERROR,
                404,
                "Water resource not found",
                null,
                ErrorResponseType.RESOURCE_NOT_FOUND,
                error.message
            )
        } else {
            sendResponse(
                res,
                ResponseType.ERROR,
                500,
                "Internal server error",
                null,
                ErrorResponseType.SERVER_ERROR,
                error.message
            )
        }
    }
};

exports.updateWaterResourceById = async (req, res) => {
    try {
        const waterResource = await WaterResources.updateWaterResourceById(req.params.id, req.body);
        sendResponse(res, ResponseType.SUCCESS, 200, "Water resource updated successfully", waterResource);
    } catch (error) {
        if (error.message === "Water resource not found") {
            sendResponse(
                res,
                ResponseType.ERROR,
                404,
                "Water resource not found",
                null,
                ErrorResponseType.RESOURCE_NOT_FOUND,
                error.message
            )
        } else {    
            sendResponse(
                res,
                ResponseType.ERROR,
                500,
                "Internal server error",
                null,
                ErrorResponseType.SERVER_ERROR, error.message
            );
        }
    }
};

exports.deleteWaterResourceById = async (req, res) => {
    try {
        await WaterResources.deleteWaterResourceById(req.params.id);
        sendResponse(res, ResponseType.SUCCESS, 200, "Water resource deleted successfully", null);
    } catch (error) {
        if (error.message === "Water resource not found") {
            sendResponse(
                res,
                ResponseType.ERROR,
                404,
                "Water resource not found",
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
