// cart.model.js
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true }, // snapshot giá lúc thêm
  },
  { _id: false },
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true },
);

cartSchema.virtual("totalPrice").get(function () {
  return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
});

cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

export default mongoose.model("Cart", cartSchema);
