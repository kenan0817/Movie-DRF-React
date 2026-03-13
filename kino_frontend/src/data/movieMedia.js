const asset = (path) => encodeURI(path);

const BACKEND_BASE_URL = "http://127.0.0.1:8000";

const fallbackMedia = {
  poster: asset("/movie-media/posters/Aladdin.jpg"),
  backdrop: asset("/movie-media/backgrounds/aladdin_background.jpg"),
  accent: "#e50914",
  label: "Featured",
};

const mediaByMovie = {
  dune: {
    poster: asset("/movie-media/posters/dune.jpeg"),
    backdrop: asset("/movie-media/backgrounds/dune_background.jpg"),
    accent: "#d8a45f",
    label: "Sci-Fi Epic",
  },
  aladdin: {
    poster: asset("/movie-media/posters/Aladdin.jpg"),
    backdrop: asset("/movie-media/backgrounds/aladdin_background.jpg"),
    accent: "#1db6e9",
    label: "Fantasy Adventure",
  },
  gameofthrones: {
    poster: asset("/movie-media/posters/gameofthrones.jpg"),
    backdrop: asset("/movie-media/backgrounds/gameofthrones_background.webp"),
    accent: "#8b6f50",
    label: "Fantasy Saga",
  },
  vikings: {
    poster: asset("/movie-media/posters/vikings.jpg"),
    backdrop: asset("/movie-media/backgrounds/VikingsBackground.jpg"),
    accent: "#b8612f",
    label: "War Drama",
  },
  thelastkingdom: {
    poster: asset("/movie-media/posters/TheLastKingdom.jpg"),
    backdrop: asset("/movie-media/backgrounds/TheLastKingdomBackground.jpg"),
    accent: "#9f3c2b",
    label: "Historical Action",
  },
  spongebob: {
    poster: asset("/movie-media/posters/spangebob.jpg"),
    backdrop: asset("/movie-media/backgrounds/spangebob background.jpg"),
    accent: "#f6bf26",
    label: "Family Adventure",
  },
  fastfurious: {
    poster: asset("/movie-media/posters/fast&furious.jpg"),
    backdrop: asset("/movie-media/backgrounds/the-fast-and-the-furious-movie-poster.jpg"),
    accent: "#3b82f6",
    label: "Action Rush",
  },
  kungfupanda: {
    poster: asset("/movie-media/posters/Kung-Fu-Panda-2-Poster.jpg"),
    backdrop: asset("/movie-media/backgrounds/kung_fu_pandajpg.jpg"),
    accent: "#ff7849",
    label: "Animated Action",
  },
  matrix: {
    poster: asset("/movie-media/posters/matrix_poster.jpg"),
    backdrop: asset("/movie-media/backgrounds/Matrix.jpg"),
    accent: "#24d05a",
    label: "Cyberpunk Classic",
  },
  lordoftherings: {
    poster: asset("/movie-media/posters/106935 (1).jpg"),
    backdrop: asset("/movie-media/backgrounds/Lord of the rings.jpg"),
    accent: "#b39b60",
    label: "Mythic Quest",
  },
  harrypotter: {
    poster: asset("/movie-media/posters/harry-potter.jpg"),
    backdrop: asset("/movie-media/backgrounds/Harry Potter Background.jpg"),
    accent: "#d59e4d",
    label: "Wizarding World",
  },
};

export const normalizeMovieTitle = (title = "") =>
  title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]/g, "");

export const resolveMovieImage = (imagePath) => {
  if (!imagePath) {
    return fallbackMedia.backdrop;
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  if (imagePath.startsWith("/movie-media/")) {
    return asset(imagePath);
  }

  if (imagePath.startsWith("/")) {
    return `${BACKEND_BASE_URL}${imagePath}`;
  }

  return `${BACKEND_BASE_URL}/${imagePath}`;
};

export const getMovieMedia = (movieOrTitle) => {
  const title = typeof movieOrTitle === "string" ? movieOrTitle : movieOrTitle?.title;
  const fallback = mediaByMovie[normalizeMovieTitle(title)] ?? fallbackMedia;

  if (!movieOrTitle || typeof movieOrTitle === "string") {
    return fallback;
  }

  return {
    ...fallback,
    poster: movieOrTitle.poster_image
      ? resolveMovieImage(movieOrTitle.poster_image)
      : fallback.poster,
    backdrop: movieOrTitle.background_image
      ? resolveMovieImage(movieOrTitle.background_image)
      : fallback.backdrop,
  };
};
