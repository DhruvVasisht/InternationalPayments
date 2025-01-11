import {
  createRazorpayOrder,
  createStripeSession,
  verifyRazorpayPayment,
  savePaymentAndUserBalance,
  selectGateway,
} from "../services/paymentService.js";

export const createPaymentSession = async (req, res) => {
  const { ip } = req.body;

  try {
    const { gateway, amount } = selectGateway(ip);

    if (gateway === "razorpay") {
      const razorpayOrder = await createRazorpayOrder(amount);
      return res.json({
        gateway: "razorpay",
        data: razorpayOrder,  
        amount,
      });
    } else if (gateway === "stripe") {
      const stripeSession = await createStripeSession(amount);
      return res.json({
        gateway: "stripe",
        session: stripeSession,  
        amount,
      });
    }

    // If no valid gateway, return an error
    return res.status(400).json({ message: "Invalid payment gateway." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  const { paymentDetails, ip } = req.body;

  try {
    const { gateway, amount } = selectGateway(ip);

    if (gateway === "razorpay" && verifyRazorpayPayment(paymentDetails)) {
      await savePaymentAndUserBalance(paymentDetails, amount);
      return res.json({ 
        success: true, 
        message: "Payment successful" 
      });
    } 
    else if (gateway === "stripe") {
      return res.json({ 
        success: true, 
        message: "Payment successful with Stripe" });
    } 
    else {
      return res.status(400).json({ success: false, 
        message: "Payment verification failed" 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

