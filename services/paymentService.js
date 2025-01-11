import Razorpay from "razorpay";
import crypto from "crypto";
import Stripe from "stripe";
import geoip from "geoip-lite";
import dotenv from "dotenv";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";

dotenv.config();

// Razorpay and Stripe instances
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEYID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Function to select payment gateway based on IP address
export const selectGateway = (ip) => {
  const geo = geoip.lookup(ip);
  if (geo && geo.country === "IN") {
    return { gateway: "razorpay", amount: 350 }; // INR for Indian users
  }
  return { gateway: "stripe", amount: 35 }; // USD/EUR for non-Indian users
};

// Create Razorpay order
export const createRazorpayOrder = async (amount) => {
  const options = {
    amount: Math.round(amount * 100), // Convert to paise
    currency: "INR",
    receipt: crypto.randomBytes(10).toString("hex"),
    payment_capture: 1,
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
};

// Create Stripe session
export const createStripeSession = async (amount) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "D&D Stylist Appointment" },
            unit_amount: Math.round(amount * 100), 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?paymentStatus=success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel?paymentStatus=cancel`,
    });

    return session;
  } catch (error) {
    throw new Error(`Failed to create Stripe session: ${error.message}`);
  }
};;

// Verify Razorpay payment
export const verifyRazorpayPayment = (data) => {
  const { razorpay_signature, razorpay_payment_id, razorpay_order_id } = data;

  const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(sign)
    .digest("hex");

  return expectedSignature === razorpay_signature;
};

// Save payment data and update user balance
// Not Gonna Work For Now
export const savePaymentAndUserBalance = async (paymentData, amount) => {
  const hardcodedUserName = "Dhruv"; // Hardcoded user name

  try {
    // Save the payment data
    const payment = new Payment(paymentData);
    await payment.save();
    console.log("Payment saved successfully:", payment);

    // Find or create the hardcoded user
    let user = await User.findOne({ name: hardcodedUserName });

    if (!user) {
      user = new User({ name: hardcodedUserName, userBalance: amount });
      console.log("New user created:", user);
    } else {
      user.userBalance += amount;
      console.log("Updated user balance:", user.userBalance);
    }

    await user.save();
    console.log("User saved successfully:", user);
  } catch (err) {
    console.error("Error saving payment or user:", err.message);
    throw new Error("Failed to save payment or update user balance.");
  }
};
