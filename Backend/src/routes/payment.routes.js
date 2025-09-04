const express = require("express");
const paymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/order", authMiddleware, paymentController);

module.exports = router;
