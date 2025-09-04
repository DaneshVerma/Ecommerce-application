const Payment = require("../models/payment.model");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function initiateOrder(req, res) {
  const { id } = req.body;
  const options = {
    ammount: req.body.ammount * 100,
    currency: req.body.currency,
  };
  try {
    const order = await razorpay.orders.create(options);
    await Payment.create({
      orderId: order.id,
      productId: id,
      user: req.user._id,
      amount: order.amount,
      currency: order.currency,
      status: "pending",
    });
    res.json({ message: "order created", orderId: order.id });
  } catch (error) {
    res.status(500).send("Error creating order");
  }
}

async function verifyPayement(req, res) {
  const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  try {
    const {
      validatePaymentVerification,
    } = require("../node_modules/razorpay/dist/utils/razorpay-utils.js");

    const result = validatePaymentVerification(
      { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
      signature,
      secret
    );
    if (result) {
      const payment = await Payment.findOne({ orderId: razorpayOrderId });
      payment.paymentId = razorpayPaymentId;
      payment.signature = signature;
      payment.status = "completed";
      await payment.save();
      res.json({ status: "success" });
    } else {
      res.status(400).send("Invalid signature");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error verifying payment");
  }
}

module.exports = { initiateOrder, verifyPayement };
