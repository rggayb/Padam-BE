const nearestService = require("../services/Nearest.service");
const sendResponse = require("../utils/Response.utils");
const { ErrorResponseType } = require("../models/enum/ErrorResponseType.enum");
const { ResponseType } = require("../models/enum/ResponseType.enum");

exports.getWaterSource = async (req, res) => {
  try {
    const result = await nearestService.getWaterSources(req.body);
    sendResponse(
      res,
      ResponseType.SUCCESS,
      200,
      "Water sources retrieved successfully",
      result
    );
  } catch (error) {
    console.log(error);

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
