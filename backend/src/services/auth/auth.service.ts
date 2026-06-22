import { UserModel } from "../../models/index.ts";
import { hashPassword, comparePassword } from "../../utils/password.ts";
import { signToken } from "../../utils/jwt.ts";
import { AppError } from "../../utils/AppError.ts";

interface SignupInput {
  name: string;
  email: string;
  password: string;
  role?: "seller" | "customer";
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

interface SigninInput {
  email: string;
  password: string;
}

// Shape returned to clients — never includes the password hash.
function toPublicUser(user: {
  _id: unknown;
  name: string;
  email: string;
  role: "seller" | "customer";
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function signup(input: SignupInput) {
  const existing = await UserModel.findOne({ email: input.email });
  if (existing) {
    throw new AppError(409, "An account with this email already exists");
  }

  const password = await hashPassword(input.password);

  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    password,
    role: input.role ?? "customer",
    address: input.address,
  });

  // Token is returned so the route can set it as an httpOnly cookie.
  const token = signToken({ sub: String(user._id), role: user.role });
  return { user: toPublicUser(user), token };
}

export async function signin(input: SigninInput) {
  // password has select:false, so explicitly include it
  const user = await UserModel.findOne({ email: input.email }).select("+password");
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const valid = await comparePassword(input.password, user.password);
  if (!valid) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = signToken({ sub: String(user._id), role: user.role });
  return { user: toPublicUser(user), token };
}
