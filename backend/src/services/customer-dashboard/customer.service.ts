import { CartModel, ProductModel, OrderModel } from "../../models/index.ts";
import { AppError } from "../../utils/AppError.ts";
import { Types } from "mongoose";
import type { Product } from "../../types/index.ts";

// Shape of a cart item once its `product` ref has been populated.
type PopulatedCartItem = {
  product: (Product & { _id: Types.ObjectId }) | null;
  quantity: number;
};

// --- Cart ---

// Returns the user's cart, creating an empty one on first access.
export async function getCart(userId: string) {
  const cart = await CartModel.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { new: true, upsert: true }
  ).populate("items.product");
  return cart;
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  if (product.stock < quantity) {
    throw new AppError(400, "Not enough stock available");
  }

  const cart = await CartModel.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { new: true, upsert: true }
  );

  const existing = cart.items.find((i) => String(i.product) === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: new Types.ObjectId(productId), quantity });
  }
  await cart.save();
  return cart.populate("items.product");
}

export async function updateCartItem(userId: string, productId: string, quantity: number) {
  const cart = await CartModel.findOne({ user: userId });
  if (!cart) {
    throw new AppError(404, "Cart not found");
  }
  const index = cart.items.findIndex((i) => String(i.product) === productId);
  if (index === -1) {
    throw new AppError(404, "Item not in cart");
  }

  if (quantity <= 0) {
    // setting quantity to 0 removes the line
    cart.items.splice(index, 1);
  } else {
    cart.items[index]!.quantity = quantity;
  }
  await cart.save();
  return cart.populate("items.product");
}

export async function removeFromCart(userId: string, productId: string) {
  const cart = await CartModel.findOneAndUpdate(
    { user: userId },
    { $pull: { items: { product: productId } } },
    { new: true }
  ).populate("items.product");
  if (!cart) {
    throw new AppError(404, "Cart not found");
  }
  return cart;
}

export async function clearCart(userId: string) {
  await CartModel.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
}

// --- Orders / checkout ---

// Converts the cart into an order: validates stock, snapshots prices,
// decrements stock, persists the order and empties the cart.
export async function placeOrder(userId: string) {
  const cart = await CartModel.findOne({ user: userId }).populate<{
    items: PopulatedCartItem[];
  }>("items.product");
  if (!cart || cart.items.length === 0) {
    throw new AppError(400, "Your cart is empty");
  }

  let totalAmount = 0;
  const orderItems = cart.items.map((item) => {
    const product = item.product;
    if (!product) {
      throw new AppError(400, "A product in your cart no longer exists");
    }
    if (product.stock < item.quantity) {
      throw new AppError(400, `Not enough stock for "${product.name}"`);
    }
    totalAmount += product.price * item.quantity;
    return {
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    };
  });

  // Decrement stock for each purchased product.
  await Promise.all(
    orderItems.map((item) =>
      ProductModel.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } })
    )
  );

  const order = await OrderModel.create({
    customer: new Types.ObjectId(userId),
    products: orderItems,
    totalAmount,
  });

  // Empty the cart now that the order is placed.
  cart.items.splice(0, cart.items.length);
  await cart.save();

  return order;
}

export async function getCustomerOrders(userId: string) {
  return OrderModel.find({ customer: userId }).sort({ createdAt: -1 });
}

export async function getCustomerOrderById(userId: string, orderId: string) {
  const order = await OrderModel.findOne({ _id: orderId, customer: userId });
  if (!order) {
    throw new AppError(404, "Order not found");
  }
  return order;
}
