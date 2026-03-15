import { useEffect, useState } from "react";

const STORAGE_KEY = "myMovieList";
const CHANGE_EVENT = "my-list-updated";

const normalizeMovieIds = (movieIds) =>
  [...new Set(movieIds.map((movieId) => String(movieId)).filter(Boolean))];

export const readMyListMovieIds = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY) || "[]";
    const parsedValue = JSON.parse(rawValue);
    return normalizeMovieIds(Array.isArray(parsedValue) ? parsedValue : []);
  } catch {
    return [];
  }
};

const writeMyListMovieIds = (movieIds) => {
  const normalizedMovieIds = normalizeMovieIds(movieIds);

  if (typeof window === "undefined") {
    return normalizedMovieIds;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedMovieIds));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: normalizedMovieIds }));
  return normalizedMovieIds;
};

export const toggleMyListMovieId = (movieId) => {
  const normalizedMovieId = String(movieId);
  const currentMovieIds = readMyListMovieIds();
  const movieExists = currentMovieIds.includes(normalizedMovieId);
  const nextMovieIds = movieExists
    ? currentMovieIds.filter((savedMovieId) => savedMovieId !== normalizedMovieId)
    : [...currentMovieIds, normalizedMovieId];

  return {
    isInList: !movieExists,
    movieIds: writeMyListMovieIds(nextMovieIds),
  };
};

export const useMyList = () => {
  const [movieIds, setMovieIds] = useState(() => readMyListMovieIds());

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncMovieIds = () => {
      setMovieIds(readMyListMovieIds());
    };

    const handleStorage = (event) => {
      if (event.key && event.key !== STORAGE_KEY) {
        return;
      }

      syncMovieIds();
    };

    window.addEventListener(CHANGE_EVENT, syncMovieIds);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(CHANGE_EVENT, syncMovieIds);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleMovieId = (movieId) => {
    const result = toggleMyListMovieId(movieId);
    setMovieIds(result.movieIds);
    return result;
  };

  return {
    movieIds,
    toggleMovieId,
  };
};
