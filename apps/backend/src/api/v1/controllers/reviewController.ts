import { Request, Response } from "express";
import * as reviewService from "../services/reviewService";

// Add or update review
export const addReview = async (req: any, res: Response) => {
  try {
    //const userId = req.auth?.userId;
    const userId = '1234' // hardcode userid to bypass clerk
    const { movie, rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const review = await reviewService.addReview(
      userId,
      movie,
      rating,
      comment
    );

    res.status(201).json(review);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllReviews = async (_req: Request, res: Response) => {
  try {
    const reviews = await reviewService.getAllReviews();
    res.json(reviews);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Remove review (SECURE)
export const removeReview = async (req: any, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const tmdbId = Number(req.params.tmdbId);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await reviewService.removeReview(userId, tmdbId);

    res.json({ message: "Review removed" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Get user reviews
export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const reviews = await reviewService.getUserReviews(userId);
    res.json(reviews);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getMovieReviews = async (req: Request, res: Response) => {
  try {
    const tmdbId = Number(req.params.tmdbId);
    const reviews = await reviewService.getMovieReviews(tmdbId);
    res.json(reviews);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};