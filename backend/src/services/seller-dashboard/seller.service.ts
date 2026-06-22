import { ProductModel, OrderModel } from "../../models/index.ts";
import { AppError } from "../../utils/AppError.ts";
import type { CreateProductInput, UpdateProductInput } from "../../validators/index.ts";

// --- Products owned by the seller ---

export async function createProduct(sellerId: string, input: CreateProductInput) {
  return ProductModel.create({ ...input, seller: sellerId });
}

export async function getSellerProducts(sellerId: string) {
  return ProductModel.find({ seller: sellerId }).sort({ createdAt: -1 });
}

async function findOwnedProduct(sellerId: string, productId: string) {
  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  // Ownership check: a seller may only touch their own listings.
  if (String(product.seller) !== sellerId) {
    throw new AppError(403, "You do not own this product");
  }
  return product;
}

export async function updateProduct(
  sellerId: string,
  productId: string,
  updates: UpdateProductInput
) {
  const product = await findOwnedProduct(sellerId, productId);
  Object.assign(product, updates);
  await product.save();
  return product;
}

export async function deleteProduct(sellerId: string, productId: string) {
  const product = await findOwnedProduct(sellerId, productId);
  await product.deleteOne();
}

// --- Orders containing this seller's products ---

export async function getSellerOrders(sellerId: string) {
  const productIds = await ProductModel.find({ seller: sellerId }).distinct("_id");
  return OrderModel.find({ "products.product": { $in: productIds } })
    .sort({ createdAt: -1 })
    .populate("customer", "name email");
}
