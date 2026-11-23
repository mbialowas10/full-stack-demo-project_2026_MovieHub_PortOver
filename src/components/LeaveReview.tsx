import { useState, type SubmitEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";


export const LeaveReview = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const { movie, image } = location.state || {}; // fetch movie and image props from location.state
  const movieName = movie?.title || "";
  const movieImage = image || "";

  // state level variables to track a review. 
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("1. Submit handler triggered.");

    if (!user) {
      console.log("No authenticated user");
      alert("Please login to leave a review");
      return;
    }

    const reviewData = {
      movie: movie,
      rating: parseInt(rating),
      comment: comment,
    };

    console.log("2. Review data:", reviewData);

    // const controller = new AbortController();

    // const timeoutId = setTimeout(() => {
    //   controller.abort();
    // }, 30000);

    try {
      console.log("3. Getting Clerk token");

      const token = await getToken();

      console.log("Token exists:", Boolean(token));
      console.log("Token length:", token?.length);

      if (!token) {
        throw new Error("Unable to get authentication token");
      }

      console.log("5. Sending POST request");
          console.log(
            "POST BODY:",
            JSON.stringify(reviewData, null, 2)
    );
      const resp = await fetch(
        "http://127.0.0.1:3000/api/v1/reviews", 
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
        //signal: controller.signal,
      });

      console.log("6. Response status:", resp.status);

      if (!resp.ok) {
        const errorBody = await resp.text();

        console.error("POST review failed:", {
          status: resp.status,
          statusText: resp.statusText,
          body: errorBody,
        });

        throw new Error(
          `Failed to post review: ${resp.status} - ${errorBody}`
        );
      }

      const savedReview = await resp.json();

      console.log("7. Review saved:", savedReview);

      setRating("");
      setComment("");

      navigate("/reviews");
       //navigate("http://localhost:5174/reviews/new")

    } catch (error) {
  console.error("FULL ERROR:", error);

  if (error instanceof Error) {
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
  }

  // if (controller.signal.aborted) {
  //   console.error("Request was aborted by timeout");
  // }
}
    
    // finally {
    //   clearTimeout(timeoutId);
    // }
  };

  const styles = {
    form: `max-w-lg mx-auto mt-8 rounded-xl bg-white p-6 shadow-md flex flex-col gap-4`,
    input: `rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`,
    textarea: `rounded-md border border-gray-300 px-4 py-2 min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500`,
    button: `self-end rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 transition`,
    label: `text-sm font-medium text-gray-700`,
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {movieName && <h2 className="text-xl font-semibold">{movieName}</h2>}
      {movieImage && (
        <img src={movieImage} alt={movieName} className="w-full h-auto rounded mb-4" />
      )}

      <label className={styles.label}>
        Rating
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className={styles.input}
          required
        >
          <option value="">Select rating</option>
          <option value="1">⭐ 1</option>
          <option value="2">⭐⭐ 2</option>
          <option value="3">⭐⭐⭐ 3</option>
          <option value="4">⭐⭐⭐⭐ 4</option>
          <option value="5">⭐⭐⭐⭐⭐ 5</option>
        </select>
      </label>

      <label className={styles.label}>
        Review
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={styles.textarea}
          placeholder="What did you think about the movie?"
          required
        />
      </label>

      <button type="submit" className={styles.button}>
        Submit Review
      </button>
    </form>
  );
};
