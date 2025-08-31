const express = require("express");
const router = express.Router();
const nearestController = require("../controllers/Nearest.controller");

router.post("/get-water-source", nearestController.getWaterSource);

module.exports = router;
