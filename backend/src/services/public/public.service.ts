import { ProductModel } from "../../models/index.ts";
import { AppError } from "../../utils/AppError.ts";
import { isValidObjectId } from "mongoose";

interface ListProductsParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// Public catalog browsing — no authentication required.
export async function listProducts(params: ListProductsParams) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));

  const filter: Record<string, unknown> = {};
  if (params.category) filter.category = params.category;
  if (params.search) filter.name = { $regex: params.search, $options: "i" };
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    filter.price = {
      ...(params.minPrice !== undefined ? { $gte: params.minPrice } : {}),
      ...(params.maxPrice !== undefined ? { $lte: params.maxPrice } : {}),
    };
  }

  const [items, total] = await Promise.all([
    ProductModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("seller", "name"),
    ProductModel.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getProductById(id: string) {
  if (!isValidObjectId(id)) {
    throw new AppError(400, "Invalid product id");
  }
  const product = await ProductModel.findById(id).populate("seller", "name");
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  return product;
}

export async function listCategories() {
  return ProductModel.distinct("category");
}
