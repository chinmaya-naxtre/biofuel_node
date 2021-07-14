const express = require("express");
const { login, validateLogin } = require("../controllers/user.controller");
const { authunticate } = require("../services/auth.service");
const router = express.Router();

router.post("/login", login);
router.get("/validateLogin", authunticate, validateLogin);

module.exports = router;
