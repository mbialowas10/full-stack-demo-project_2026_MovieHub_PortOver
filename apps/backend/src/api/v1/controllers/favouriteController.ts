import { Request, Response } from "express";
import { prisma } from "../../../db/prisma";// make sure you export prisma instance


// Extend Request to include Clerk auth


// Add a favourite (protected)
export const addFavourite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const { movieId } = req.body;
    if (!movieId) return res.status(400).json({ error: "Missing movieId" });

    // Check if favourite already exists
    const existing = await prisma.favourite.findUnique({
      where: {
        userId_movieId: { userId, movieId },
      },
    });
    if (existing) return res.status(400).json({ error: "Already favourited" });

    const favourite = await prisma.favourite.create({
      data: { userId, movieId },
    });

    res.status(201).json({ message: "Favourite added", favourite });
  } catch (err) {
    console.error("Error adding favourite:", err);
    res.status(500).json({ error: "Failed to add favourite" });
  }
};

// Remove a favourite (protected)
export const removeFavourite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const favId = Number(req.params.id);
    if (isNaN(favId)) return res.status(400).json({ error: "Invalid favourite ID" });

    // Ensure favourite belongs to this user
    const existing = await prisma.favourite.findUnique({
      where: { id: favId },
    });
    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ error: "Cannot delete this favourite" });
    }

    const deleted = await prisma.favourite.delete({
      where: { id: favId },
    });

    res.json({ message: "Favourite removed", deleted });
  } catch (err) {
    console.error("Error removing favourite:", err);
    res.status(500).json({ error: "Failed to remove favourite" });
  }
};

// Get all favourites for a user


export const getUserFavourites = async (req: Request, res: Response) => {
  try {
    // req.params.userId could be string | string[]
    const userIdRaw = req.params.userId;
    const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;

    const favourites = await prisma.favourite.findMany({
      where: { userId }, // now TypeScript knows this is a string
      include: {
        movie: true,
      },
    });

    res.json({ favourites });
  } catch (err) {
    console.error("Error fetching favourites:", err);
    res.status(500).json({ error: "Failed to fetch favourites" });
  }
};

/**
 * Check if a specific movie is favourited by the current user and if it's stored locally in our DB
 * This endpoint is used by the frontend to determine the favourite status of a movie for the logged-in user
 * It returns an object with isFavourite (boolean), isStoredLocally (boolean), and favouriteId (number | null)
 */

export const checkFavouriteStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    const tmdbId = Number(req.params.tmdbId);

    // user must be authenticated to favourite a movie
    if (!userId) return res.json({ isFavourite: false, isStoredLocally: false });

    const movie = await prisma.tMDBMovie.findUnique({
      where: { tmdb_id: tmdbId },
    });

    if (!movie) {
      return res.json({ isFavourite: false, isStoredLocally: false });
    }

    const favourite = await prisma.favourite.findUnique({
      where: { userId_movieId: { userId, movieId: movie.id } },
    });

    res.json({
      isFavourite: !!favourite, // !! converts to boolean - returns true if favourite exists, false if null
      isStoredLocally: true,
      favouriteId: favourite?.id
    });
  } catch (err) {
    console.error("Error checking favourite status:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const toggleFavourite = async (req: Request, res: Response) => {
  try {
    console.log("inside be.")
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const { tmdb_id, title, overview, poster_path, popularity, vote_average, vote_count, release_date } = req.body;

    if (!tmdb_id) return res.status(400).json({ error: "tmdb_id is required" });

    console.log(`Toggling favourite for user ${userId} and movie ${tmdb_id}`);

    // 1. Ensure user exists in our DB
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });

    // 2. Upsert movie
    const movie = await prisma.tMDBMovie.upsert({
      where: { tmdb_id },
      update: {}, // if movie already exists, we don't need to update any fields for this use case, just return the  movie record
      create: { tmdb_id, title, overview, poster_path, popularity, vote_average, vote_count, release_date: release_date ? new Date(release_date) : undefined },
    });

    // 3. Check if favourite exists
    const existingFav = await prisma.favourite.findUnique({
      where: { userId_movieId: { userId, movieId: movie.id } },
    });

    if (existingFav) {
      console.log(`Removing favourite ${existingFav.id} for user ${userId}`);
      // Remove favourite
      await prisma.favourite.delete({ where: { id: existingFav.id } });
      return res.json({ message: "Removed from favourites", isFavourite: false });
    } else {
      console.log(`Adding favourite for user ${userId} and movie ${movie.id}`);
      // ✅ Add favourite
      const newFav = await prisma.favourite.create({
        data: { userId, movieId: movie.id },
      });
      return res.json({ message: "Added to favourites", isFavourite: true, favouriteId: newFav.id });
    }
  } catch (err) {
    console.error("Error toggling favourite:", err);
    res.status(500).json({ error: "Server error" });
  }
};