const express = require("express");
const {
  updateFormula,
  getFormulaDetails,
  testCalculation,
} = require("../controllers/calc.controller");
const { authunticate } = require("../services/auth.service");
const router = express.Router();

router.post("/updateFormula", authunticate, updateFormula);
router.get("/getFormulaDetails", authunticate, getFormulaDetails);
router.post("/testCalculation", testCalculation);

module.exports = router;
