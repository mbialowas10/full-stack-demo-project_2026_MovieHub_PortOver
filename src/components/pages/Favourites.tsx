import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { MovieCard } from "../MovieCard";

const Favourites = () => {
  const { user } = useUser();
  const [favourites, setFavourites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchFavourites = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:3000/api/v1/favourites/user/${user.id}`
        );
        const data = await res.json();
        setFavourites(data.favourites || []);
      } catch (err) {
        console.error("Error fetching favourites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [user]);

  if (!user) {
    return (
      <h1 className="text-center mt-10 text-lg">
        Please sign in to view your favourites.
      </h1>
    );
  }

  if (loading) {
    return (
      <h1 className="text-center mt-10 text-lg">
        Loading favourites...
      </h1>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* User ID Section */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Your Favourites</h1>
        <p className="text-sm text-gray-500 mt-2">
          User ID: {user.id}
          <br/>User Email: {user.emailAddresses[0]?.emailAddress}
          <br/>Name: {user.firstName} {user.lastName}
        </p>
      </div>

      {favourites.length === 0 ? (
        <p className="text-center text-gray-500">
          You haven't favourited any movies yet.
        </p>
      ) : (
        <div
          className="
            grid 
            grid-cols-2 
            sm:grid-cols-3 
            md:grid-cols-4 
            lg:grid-cols-5 
            gap-6
          "
        >
          {favourites.map((fav) => (
            <div className="scale-90 hover:scale-100 transition-transform duration-200">
              <MovieCard key={fav.movie.id} movie={fav.movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favourites;