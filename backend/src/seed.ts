import mongoose from "mongoose";
import { connectDB } from "./config/db.ts";
import { UserModel, ProductModel } from "./models/index.ts";
import { hashPassword } from "./utils/password.ts";

const DEMO_SELLER = {
  name: "Demo Store",
  email: "demo.seller@shopsy.test",
  password: "demo1234",
};

type MockProduct = {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
};

const mockProducts: MockProduct[] = [
  {
    name: "Aurora Wireless Headphones",
    description:
      "Over-ear headphones with active noise cancellation and 30-hour battery life.",
    category: "Electronics",
    price: 2999,
    stock: 25,
  },
  {
    name: "Featherlight Running Shoes",
    description: "Breathable, lightweight running shoes built for everyday miles.",
    category: "Apparel",
    price: 3499,
    stock: 40,
  },
  {
    name: "Terra Ceramic Mug Set",
    description: "A set of four hand-glazed stoneware mugs in earthy tones.",
    category: "Home",
    price: 899,
    stock: 100,
  },
  {
    name: "Nimbus Mechanical Keyboard",
    description: "Hot-swappable mechanical keyboard with tactile switches and RGB.",
    category: "Electronics",
    price: 5499,
    stock: 15,
  },
  {
    name: "Sol Linen Shirt",
    description: "Relaxed-fit linen shirt that stays cool through the day.",
    category: "Apparel",
    price: 1799,
    stock: 60,
  },
  {
    name: "Atlas Hardcover Notebook",
    description: "Dotted-grid hardcover notebook with 200 thick, bleed-proof pages.",
    category: "Books",
    price: 499,
    stock: 200,
  },
  {
    name: "Lumen Desk Lamp",
    description: "Dimmable LED desk lamp with adjustable color temperature.",
    category: "Home",
    price: 1599,
    stock: 35,
  },
  {
    name: "Pulse Smartwatch",
    description: "Fitness smartwatch with heart-rate, GPS and a 7-day battery.",
    category: "Electronics",
    price: 6999,
    stock: 20,
  },
  {
    name: "Drift Canvas Backpack",
    description: "Water-resistant 20L canvas backpack with a padded laptop sleeve.",
    category: "Accessories",
    price: 2499,
    stock: 50,
  },
  {
    name: "Bloom Scented Candle",
    description: "Soy-wax candle with notes of jasmine and sandalwood, 45-hour burn.",
    category: "Home",
    price: 699,
    stock: 120,
  },
];

function imageFor(name: string): string {
  // Stable placeholder image per product name.
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `https://picsum.photos/seed/${slug}/600/600`;
}

async function seed() {
  await connectDB();

  // Ensure a demo seller exists to own the products.
  let seller = await UserModel.findOne({ email: DEMO_SELLER.email });
  if (!seller) {
    seller = await UserModel.create({
      name: DEMO_SELLER.name,
      email: DEMO_SELLER.email,
      password: await hashPassword(DEMO_SELLER.password),
      role: "seller",
    });
    console.log(`Created demo seller: ${DEMO_SELLER.email} / ${DEMO_SELLER.password}`);
  }

  // Replace this seller's catalog so re-running is idempotent.
  await ProductModel.deleteMany({ seller: seller._id });
  await ProductModel.insertMany(
    mockProducts.map((p) => ({ ...p, image: imageFor(p.name), seller: seller._id }))
  );

  console.log(`Seeded ${mockProducts.length} products.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
