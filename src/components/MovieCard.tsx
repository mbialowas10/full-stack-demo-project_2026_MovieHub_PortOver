// src/components/MovieCard.tsx
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import type { MovieCardProps } from "../types/MovieCardProps";
import { useUser, useAuth } from "@clerk/clerk-react";




/**
 * MovieCard component displays individual movie details and allows users to add/remove from favourites
 * and to initially save to a local postgreSQL database. 
 * TODO - provide a link to leave a review for the movie.
 * @param param0 
 * @returns 
 */

export const MovieCard = ({ movie }: MovieCardProps) => {
  const { getToken } = useAuth(); // Get clerk auth token, used for authenticated API requests 
  const { user } = useUser(); // get authenticated user info from clerk

  const {
    id,
    tmdb_id,
    original_title,
    title,
    name,
    overview,
    poster_path,
    popularity,
    vote_average,
    vote_count,
    release_date } = movie as any; // destructure movie props

  // to ensure we don't have an empty title field, as TMDB can return different fields for movies vs tv shows
  const displayTitle = original_title || title || name; 
  const tmdbId = tmdb_id || id; // Handle both TMDB API and local DB objects

  const image = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : "/placeholder.png";
  
  // state level variables to track if the movie is favourited, if it's stored locally in our DB, and the local DB ID for reference  
  const [isFavourite, setIsFavourite] = useState(false);
  const [isStoredLocally, setIsStoredLocally] = useState(false);
  const [, setDbId] = useState<number | null>(null);

  // Check if the movie is already saved in the database and its favourite status
  useEffect(() => {
    const checkStatus = async () => {
      if (!tmdbId) return;
      try {
        const token = await getToken();
        console.log(`Bearer token: ${token}`);
        const res = await fetch(`http://localhost:3000/api/v1/favourites/status/${tmdbId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();

        setIsFavourite(data.isFavourite);
        setIsStoredLocally(data.isStoredLocally);
        if (data.favouriteId) setDbId(data.favouriteId);
      } catch (err) {
        console.error("Error checking favourite status:", err);
      }
    };

    checkStatus();
  }, [tmdbId, user, getToken]);

  // Toggle favourite
  const handleBtnClick = async () => {
  if (!user) {
    alert("Please login");
    return;
  }

  try {
    const token = await getToken();
    const res = await fetch("http://localhost:3000/api/v1/favourites", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tmdb_id: tmdbId,
        title: displayTitle,
        overview,
        poster_path,
        popularity,
        vote_average,
        vote_count,
        release_date,
      }),
    });

    const data = await res.json();
    setIsFavourite(data.isFavourite);
    if (data.isFavourite) setIsStoredLocally(true);
    if (data.favouriteId) setDbId(data.favouriteId);
  } catch (err) {
    console.error("Error toggling favourite:", err);
  }
};

  return (
    <div className={`w-lg mx-auto mt-10 p-6 rounded-lg shadow-lg ${isStoredLocally ? 'bg-amber-50' : 'bg-gray-100'}`}>
      <h1 className="text-base font-semibold text-slate-900">{displayTitle} {isStoredLocally && <span className="text-xs font-normal text-amber-600">(Stored Locally)</span>}</h1>

      <img
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        src={image}
        alt={`${original_title} poster`}
        className="h-48 w-full"
        loading="lazy"
      />

      <p>{overview}</p>

      <div className="mt-4 flex justify-between items-center">
        <NavLink
          to="/reviews/new"
          className="text-blue-600 hover:underline"
          state={{
            movie: {
              tmdb_id: tmdbId,
              title: displayTitle,
              overview,
              poster_path,
              popularity,
              vote_average,
              vote_count,
              release_date
            },
            image
          }}
        >
          Leave A Review...
        </NavLink>

        <button
          type="button"
          onClick={handleBtnClick}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          {isFavourite ? "Remove from Favourites ➖" : "Add to Favourites ➕"}
        </button>
      </div>
    </div>
  );
};
