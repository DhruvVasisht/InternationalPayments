import express from "express";
import { createPaymentSession, verifyPayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-payment-session", createPaymentSession);

router.post("/verify-payment", verifyPayment);

export default router;
