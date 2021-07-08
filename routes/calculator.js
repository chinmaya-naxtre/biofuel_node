const express = require("express");
const {
  updateFormula,
  getFormulaDetails,
  testCalculation,
  getCalcData,
} = require("../controllers/calc.controller");
const { authunticate } = require("../services/auth.service");
const router = express.Router();

router.post("/updateFormula", authunticate, updateFormula);
router.get("/getFormulaDetails", getFormulaDetails);
router.post("/testCalculation", testCalculation);

module.exports = router;
