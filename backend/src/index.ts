import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.ts";
import { connectDB } from "./config/db.ts";
import { apiRouter } from "./routes/index.ts";
import { notFound, errorHandler } from "./middleware/error.middleware.ts";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", apiRouter);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
