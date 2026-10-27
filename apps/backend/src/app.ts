import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";

import healthRoutes from "./api/v1/routes/health.routes";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger";
import movieRoutes from "./api/v1/routes/movieRoutes";
import favouriteRoutes from "./api/v1/routes/favouriteRoutes";
import reviewRoutes from "./api/v1/routes/reviewRoutes";

dotenv.config();

const app = express();

// NEW: Log every incoming request
app.use((req, _res, next) => {
  console.log("INCOMING:", req.method, req.originalUrl);
  next();
});

// CORS middleware
app.use(cors({
  origin: [
    "http://localhost:5174",
    "http://127.0.0.1:5174"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

// NEW: Initialize Clerk
app.use(clerkMiddleware());

// Root route
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the Movie Hub API" });
});

// Health route
app.use("/api/health", healthRoutes);

// Swagger docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Movie routes
app.use("/api/v1", movieRoutes);

// Favourite routes
app.use("/api/v1/favourites", favouriteRoutes);

// Review routes
app.use("/api/v1/reviews", reviewRoutes);

// Global Error Handler
app.use((
  err: any,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  console.error("Unhandled Error:", err);

  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

export default app;