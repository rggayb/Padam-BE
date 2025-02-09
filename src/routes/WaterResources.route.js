const Express = require("express");
const router = Express.Router();
const waterResourceController = require("../controllers/WaterResources.controller");

router.post("/", waterResourceController.createWaterResource);
router.get("/", waterResourceController.getWaterResources);
router.get("/:id", waterResourceController.getWaterResourceById);
router.put("/:id", waterResourceController.updateWaterResourceById);
router.delete("/:id", waterResourceController.deleteWaterResourceById);

module.exports = router;
