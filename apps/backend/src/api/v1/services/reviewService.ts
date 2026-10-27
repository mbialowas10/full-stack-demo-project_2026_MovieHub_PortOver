import { prisma } from "../../../db/prisma";

export const addReview = async (
  userId: string,
  movieData: {
    tmdb_id: number;
    title: string;
    overview?: string;
    poster_path?: string;
    release_date?: string;
  },
  rating: number,
  comment: string
) => {

  // 1. convert TMDB date to JavaScript date
  let releaseDate: Date | null = null;

  if (movieData.release_date) {
    releaseDate = new Date(movieData.release_date);

    if (Number.isNaN(releaseDate.getTime())) {
      throw new Error("Invalid release date");
    }
  }

  console.log("Original date:", movieData.release_date);
  console.log("Converted date:", releaseDate);
  console.log("Is Date object:", releaseDate instanceof Date);


  console.log("Release date: ", movieData.release_date);

  // 1️⃣ Ensure user exists
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });

  // 2️⃣ Upsert movie
  const movie = await prisma.tMDBMovie.upsert({
    where: { tmdb_id: movieData.tmdb_id },
    update: {},
    create: {
      tmdb_id: movieData.tmdb_id,
      title: movieData.title,
      overview: movieData.overview,
      poster_path: movieData.poster_path,
      release_date: new Date(movieData.release_date?movieData.release_date:'')
        
    },
  });

  // 3️⃣ Upsert review (IMPORTANT FIX)
  const review = await prisma.review.upsert({
    where: {
      userId_movieId: {
        userId,
        movieId: movie.id,
      },
    },
    update: {
      rating,
      comment,
    },
    create: {
      userId,
      movieId: movie.id,
      rating,
      comment,
    },
  });

  return review;
};

export const removeReview = async (userId: string, tmdbId: number) => {
  const movie = await prisma.tMDBMovie.findUnique({
    where: { tmdb_id: tmdbId },
  });

  if (!movie) throw new Error(`Movie ${tmdbId} not found`);

  return prisma.review.delete({
    where: {
      userId_movieId: {
        userId,
        movieId: movie.id,
      },
    },
  });
};

export const getUserReviews = async (userId: string) => {
  return prisma.review.findMany({
    where: { userId },
    include: { movie: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getMovieReviews = async (tmdbId: number) => {
  const movie = await prisma.tMDBMovie.findUnique({
    where: { tmdb_id: tmdbId },
  });

  if (!movie) return [];

  return prisma.review.findMany({
    where: { movieId: movie.id },
    include: { movie: true, user: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllReviews = async () => {
  return prisma.review.findMany({
    include: { movie: true, user: true },
    orderBy: { createdAt: "desc" },
  });
};