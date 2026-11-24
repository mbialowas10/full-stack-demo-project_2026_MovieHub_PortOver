import { Router } from "express";
import { requireAuth } from "@clerk/express";
import * as favouriteController from "../controllers/favouriteController";

const router = Router();

// Get favourites for a user (public)
router.get("/user/:userId", favouriteController.getUserFavourites);

// Check if a specific movie is favourited by current user
router.get("/status/:tmdbId", requireAuth, favouriteController.checkFavouriteStatus);

// Toggle favourite (protected) - handles both add and remove
router.post("/", favouriteController.toggleFavourite);

// Remove favourite (protected)
router.delete(
  "/:id",
  requireAuth,
  favouriteController.removeFavourite
);

export default router;