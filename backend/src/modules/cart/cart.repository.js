import Cart from "./cart.model.js";

const findByUser = (userId) =>
  Cart.findOne({ user: userId }).populate(
    "items.product",
    "name thumbnail price discountPrice unit stock isActive",
  );

const upsertCart = (userId) =>
  Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { upsert: true, returnDocument: "after" },
  );

const addOrUpdateItem = async (userId, { productId, quantity }) => {
  if (quantity <= 0) throw new Error("Quantity không hợp lệ");

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product không tồn tại");

  const finalPrice = product.discountPrice || product.price;

  const cart = await upsertCart(userId);

  const existingIndex = cart.items.findIndex(
    (i) => i.product.toString() === productId.toString(),
  );

  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: finalPrice,
    });
  }

  await cart.save();

  return cart.populate(
    "items.product",
    "name thumbnail price discountPrice unit stock isActive",
  );
};

const updateItemQuantity = async (userId, productId, quantity) => {
  const cart = await upsertCart(userId);
  if (!cart) return null;

  const index = cart.items.findIndex((i) => i.product.equals(productId));
  if (index < 0) return null;

  if (quantity <= 0) {
    cart.items.splice(index, 1);
  } else {
    cart.items[index].quantity = quantity;
  }

  return cart.save();
};

const removeItem = async (userId, productId) => {
  const cart = await upsertCart(userId);
  if (!cart) return null;

  cart.items = cart.items.filter((i) => !i.product.equals(productId));
  return cart.save();
};

const clearCart = (userId) =>
  Cart.findOneAndUpdate(
    { user: userId },
    { items: [] },
    { returnDocument: "after" },
  );

export const cartRepository = {
  findByUser,
  upsertCart,
  addOrUpdateItem,
  updateItemQuantity,
  removeItem,
  clearCart,
};
