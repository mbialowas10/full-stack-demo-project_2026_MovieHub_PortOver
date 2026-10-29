import { Router } from "express";
import { requireAuth } from "@clerk/express";
import * as reviewController from "../controllers/reviewController";

const router = Router();

/**
 * @swagger
 * tags: 
 *  - name: Reviews
 *    description: Movie review management endpoints
 */


/*
 * @swagger
 * /api/v1/reviews:
 *   get:
 *     summary: Get all reviews
 *     description: Returns all movie reviews.
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  reviewController.getAllReviews
);

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: Create or update a review
 *     description: Creates or updates a movie review.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tmdbId
 *               - rating
 *             properties:
 *               tmdbId:
 *                 type: integer
 *                 example: 550
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Great movie!
 *               title:
 *                 type: string
 *                 example: Fight Club
 *               overview:
 *                 type: string
 *                 example: A movie overview.
 *               poster_path:
 *                 type: string
 *                 nullable: true
 *                 example: /poster.jpg
 *               release_date:
 *                 type: string
 *                 format: date
 *                 example: "1999-10-15"
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  (req, _res, next) => {
    console.log("1. POST request reached Express");

    console.log(
      "Authorization header present:",
      Boolean(req.headers.authorization)
    );

    console.log(
      "Bearer token:",
      req.headers.authorization?.startsWith("Bearer ")
    );

    next();
  },

  //requireAuth(),

  (_req, _res, next) => {
    console.log("2. Clerk authentication successful");
    next();
  },

  reviewController.addReview
);

/**
 * @swagger
 * /api/v1/reviews/{tmdbId}:
 *   delete:
 *     summary: Delete a movie review
 *     description: Deletes the authenticated user's review for a movie.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tmdbId
 *         required: true
 *         description: The TMDB movie ID
 *         schema:
 *           type: integer
 *         example: 550
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       400:
 *         description: Invalid movie ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:tmdbId",
  requireAuth(),
  reviewController.removeReview
);

/**
 * @swagger
 * /api/v1/reviews/movie/{tmdbId}:
 *   get:
 *     summary: Get reviews for a movie
 *     description: Retrieves all reviews for a specific TMDB movie.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: tmdbId
 *         required: true
 *         description: The TMDB movie ID
 *         schema:
 *           type: integer
 *         example: 550
 *     responses:
 *       200:
 *         description: Movie reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Invalid movie ID
 *       500:
 *         description: Internal server error
 */
router.get(
  "/movie/:tmdbId",
  reviewController.getMovieReviews
);

/**
 * @swagger
 * /api/v1/reviews/user/{userId}:
 *   get:
 *     summary: Get reviews by user
 *     description: Retrieves all reviews submitted by a specific user.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Clerk user ID
 *         schema:
 *           type: string
 *         example: user_abc123
 *     responses:
 *       200:
 *         description: User reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 */
router.get(
  "/user/:userId",
  reviewController.getUserReviews
);

export default router;