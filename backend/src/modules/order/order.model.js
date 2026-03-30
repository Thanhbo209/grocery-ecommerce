// order.model.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    thumbnail: { type: String },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);
const shippingAddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    district: { type: String },
    city: { type: String, required: true },
  },
  { _id: false },
);
const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderCode: { type: String, unique: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod: { type: String, enum: ["COD", "online"], default: "COD" },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending",
    },
    note: { type: String },
  },
  { timestamps: true },
);

// ...pre save orderCode, etc.

// Finding 3: tự sinh orderCode trước khi save
// Format: GC-YYYYMMDD-XXXX (XXXX = 4 chữ số ngẫu nhiên + timestamp ms)
orderSchema.pre("save", async function () {
  if (this.orderCode) return; // đã có thì bỏ qua

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // 20240315
  const suffix = String(Date.now()).slice(-4); // 4 chữ số cuối ms
  const rand = String(Math.floor(Math.random() * 100)).padStart(2, "0"); // 2 chữ số random

  this.orderCode = `GC-${date}-${suffix}${rand}`;
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
