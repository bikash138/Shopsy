import { UserModel } from "../../models/index.ts";
import { AppError } from "../../utils/AppError.ts";
import type { UpdateProfileInput } from "../../validators/index.ts";

// The password hash has select:false, so it is never returned by these reads.

export async function getProfile(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return user;
}

export async function updateProfile(userId: string, updates: UpdateProfileInput) {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return user;
}
