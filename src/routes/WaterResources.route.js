const express = require("express");
const waterSourceController = require("../controllers/WaterResources.controller");
const router = express.Router();

router.get("/", waterSourceController.getWaterSources);
router.post("/", waterSourceController.createWaterResource);
router.get("/:id", waterSourceController.getWaterSourceById);
router.put("/:id", waterSourceController.updateWaterSourceById);
router.delete("/:id", waterSourceController.deleteWaterResourceById);

module.exports = router;
