import express from "express";
import connectDb from "./config/db.js";
import dotenv from "dotenv";
import paymentRoutes from "./routes/payment.router.js";
import cors from 'cors'

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Payment routes
app.use("/api/v1/payments", paymentRoutes);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  connectDb();
  console.log(`Server running on port ${PORT}`);
});
