import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/order.js";
// import Artwork from "../models/artwork.js"; // Uncomment if you manage artwork status

const router = express.Router();

// Ensure required env variables exist
if (!process.env.RZP_KEY_ID || !process.env.RZP_KEY_SECRET) {
  throw new Error("RZP_KEY_ID and RZP_KEY_SECRET must be defined in .env");
}

const razor = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET,
});

// -----------------------------------------
// Route: POST /api/payments/orders
// Desc:  Create Razorpay order
// -----------------------------------------
router.post("/orders", async (req, res) => {
  // Check if user is authenticated
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  let { amount, currency = "INR", receipt, artwork_id } = req.body;

  // If no receipt provided, generate one
  if (!receipt) {
    receipt = `rcpt_${Date.now()}`;
  }
  // Truncate to max 40 chars
  if (receipt.length > 40) {
    receipt = receipt.slice(0, 40);
  }

  try {
    const order = await razor.orders.create({
      amount, // amount in paise
      currency,
      receipt, // now guaranteed ≤ 40 chars
    });

    const newOrder = new Order({
      razorpay_order_id: order.id,
      amount,
      currency,
      receipt,
      status: order.status,
      user_id: userId,
      artwork_id, // Store artwork_id if provided
    });

    await newOrder.save();

    res.status(201).json(order);
  } catch (err) {
    console.error("🛑 Error creating Razorpay order:", err);
    res.status(500).json({ message: "Order creation failed" });
  }
});

// -----------------------------------------
// Route: POST /api/payments/verify
// Desc:  Verify Razorpay payment signature
// -----------------------------------------
router.post("/verify", async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    artwork_id,
  } = req.body;

  try {
    const generated_signature = crypto
      .createHmac("sha256", process.env.RZP_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    // Find the order first to get user_id if needed for additional checks
    const order = await Order.findOne({ razorpay_order_id });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Update the order with payment details
    const updatedOrder = await Order.findOneAndUpdate(
      { razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        status: "paid",
        artwork_id: artwork_id || order.artwork_id, // Keep existing or update
      },
      { new: true }
    );

    // Optionally mark the artwork as sold:
    // if (artwork_id || order.artwork_id) {
    //   await Artwork.findByIdAndUpdate(artwork_id || order.artwork_id, { sold: true });
    // }

    res.json({
      success: true,
      message: "Payment verified successfully",
      order_id: updatedOrder?._id,
    });
  } catch (error) {
    console.error("🛑 Payment verification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during verification" });
  }
});

// -----------------------------------------
// Route: GET /api/payments/user
// Desc:  Get orders by logged-in user
// -----------------------------------------
router.get("/user", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const orders = await Order.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .populate("artwork_id");

    res.json(orders);
  } catch (error) {
    console.error("🛑 Error fetching user orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

export default router;
