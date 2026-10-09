// hooks/useTMDB.ts
import { useEffect, useState } from "react";
import { fetchFromTMDB } from "../api/tmdb";

/**
 * Description: Custom hook to fetch data from TMDB API
 * @param endpoint
 * @param params
 * @param enabled
 * @returns Generic type T[]
 */
export const useTMDB = <T,>(
  endpoint: string,
  params = "",
  enabled = true
): T[] => {
  
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    if (!enabled){
      setData([]);
      return;
    } 

    fetchFromTMDB(endpoint, params)
      .then((res) => {
        setData(res.results ?? []);
      })
      .catch((error)=>{
        console.error(error);
        setData([]);
      });
  }, [endpoint, params, enabled]);

  return data;
};
