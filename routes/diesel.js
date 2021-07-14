const express = require("express");
const { updateNewPrice } = require("../controllers/diesel.controller");
const router = express.Router();
const dieselController = require("../controllers/diesel.controller");
const { authunticate } = require("../services/auth.service");

router.get("/loadDieselPriceByState", dieselController.loadStateDieselPrice);
router.get("/LoadDieselPriceByCity", dieselController.loadDieselPriceByCity);

router.get("/stateDetails", dieselController.getStateDieselPrice);
router.get("/getInitialPrice", dieselController.getInitialPrice);

router.get("/cityDetails", dieselController.getCityDieselPrice);

router.get(
  "/getDieselPriceByCity/:city",
  dieselController.getDieselPriceByCity
);
router.get("/updateNewPrice", authunticate, updateNewPrice);
router.get("/updateNewPriceAuto",  updateNewPrice);


router.get("/search/:keyword", dieselController.searchStateCity)

module.exports = router;
