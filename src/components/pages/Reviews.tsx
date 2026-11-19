
import { useState, useEffect } from "react";
import ReviewCard from "../ReviewCard";
import { useLocation } from "react-router-dom";

interface Review {
  id: string | number;
  movie: {
    title: string;
  };
  user?: {
    email?: string;
  };
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}


const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  useEffect(() => {
    console.log("Reviews component mounted!");
    let ignore = false;

    const fetchReviews = async () => {
      try {
        console.log("Fetching reviews from backend...");

        const response = await fetch(
          "http://127.0.0.1:3000/api/v1/reviews",
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Expected an array of reviews");
        }

        console.log("Reviews received:", data);

        if (!ignore) {
          setReviews(data as Review[]);
        }

      } catch (err) {
        if (!ignore) {
          console.error("Error loading reviews:", err);
          setError("Unable to load reviews.");
        }
      } finally {
        if (!ignore) {
          console.log("Reviews component unmounted!");
          setLoading(false);
        }
      }
    };

    void fetchReviews();

    return () => {
      ignore = true;
    };
  }, [location.key]);

  if (loading) {
    return <p className="text-center mt-8">Loading reviews...</p>;
  }

  if (error) {
    return <p className="text-center mt-8 text-red-600">{error}</p>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-center text-2xl font-semibold mb-4">
        User Reviews
      </h1>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-500">
          No reviews yet.
        </p>
      ) : (
        reviews.map((review) => (
          <ReviewCard
            key={review.id}
            movie={review.movie.title}
            name={review.user?.email || review.userId}
            rating={review.rating}
            review={review.comment}
            createdAt={new Date(
              review.createdAt
            ).toLocaleDateString()}
          />
        ))
      )}
    </div>
  );
};

export default Reviews;
