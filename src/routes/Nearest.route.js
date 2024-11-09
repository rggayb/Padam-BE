const Express = require("express");
const router = Express.Router();
const nearestController = require("../controllers/Nearest.controller");

router.post("/get-water-source", nearestController.getWaterSource);

module.exports = router;
