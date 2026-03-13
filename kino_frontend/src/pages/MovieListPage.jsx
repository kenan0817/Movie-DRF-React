import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMovies } from "../services/movieService";
import { getMovieMedia } from "../data/movieMedia";

const PAGE_SIZE = 10;

const formatDuration = (minutes) => {
  if (!minutes) {
    return "Runtime N/A";
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (!hours) {
    return `${mins}m`;
  }

  return `${hours}h ${mins}m`;
};

const getYear = (date) => {
  if (!date) {
    return "Unknown";
  }

  return new Date(date).getFullYear();
};

const trimText = (text, maxLength = 180) => {
  if (!text) {
    return "A new title is ready to stream in your personal movie library.";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
};

const MovieListPage = () => {
  const [moviesData, setMoviesData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getMovies(currentPage, PAGE_SIZE);
        setMoviesData(data);
      } catch (error) {
        console.error("Film datasi alinarken xeta bas verdi:", error);
        setErrorMessage("Filmleri yuklemek mumkun olmadi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();

    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const movies = moviesData?.results ?? [];
  const featuredMovie = movies[0] ?? null;
  const featuredMedia = featuredMovie ? getMovieMedia(featuredMovie) : null;
  const totalPages = moviesData ? Math.ceil(moviesData.count / PAGE_SIZE) : 0;

  const handlePreviousPage = () => {
    if (currentPage === 1 || isLoading) {
      return;
    }

    setCurrentPage((prevPage) => prevPage - 1);
  };

  const handleNextPage = () => {
    if (!moviesData?.next || isLoading) {
      return;
    }

    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handleBrowseTitles = () => {
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="netflix-page">
      <header className="topbar">
        <Link to="/" className="brand">
          KINO
        </Link>

        <div className="topbar-meta">
          <span>Movies</span>
          <span>Page {currentPage}</span>
          <span>{moviesData?.count ?? 0} Titles</span>
        </div>
      </header>

      {featuredMovie && featuredMedia && (
        <section
          className="featured-hero"
          style={{
            "--hero-image": `url("${featuredMedia.backdrop}")`,
            "--hero-accent": featuredMedia.accent,
          }}
        >
          <div className="featured-overlay">
            <div className="featured-copy">
              <span className="section-tag">{featuredMedia.label}</span>
              <h1>{featuredMovie.title}</h1>

              <div className="featured-pills">
                <span>{getYear(featuredMovie.relaese)}</span>
                <span>{formatDuration(featuredMovie.duration)}</span>
                <span>IMDB {featuredMovie.imdb}</span>
                <span>{featuredMovie.studio?.title || "Unknown Studio"}</span>
              </div>

              <p>{trimText(featuredMovie.description, 220)}</p>

              <div className="hero-actions">
                <Link to={`/movies/${featuredMovie.id}`} className="hero-button hero-button-primary">
                  Watch Details
                </Link>

                <button
                  type="button"
                  className="hero-button hero-button-secondary"
                  onClick={handleBrowseTitles}
                >
                  Browse Titles
                </button>
              </div>
            </div>

            <div className="featured-poster">
              <img src={featuredMedia.poster} alt={`${featuredMovie.title} poster`} />
            </div>
          </div>
        </section>
      )}

      <section className="catalog-section" id="catalog">
        <div className="section-header">
          <div>
            <span className="section-tag">Trending Now</span>
            <h2>Continue Watching</h2>
          </div>

          <p className="section-caption">
            Page {currentPage}
            {totalPages ? ` / ${totalPages}` : ""}
          </p>
        </div>

        {isLoading && !movies.length && <div className="status-card">Loading movies...</div>}
        {errorMessage && <div className="status-card status-card-error">{errorMessage}</div>}

        <div className="movie-grid">
          {movies.map((movie, index) => {
            const media = getMovieMedia(movie);

            return (
              <article
                key={movie.id}
                className="movie-card"
                style={{ "--card-accent": media.accent }}
              >
                <Link to={`/movies/${movie.id}`} className="movie-card-link">
                  <div className="movie-card-image">
                    <img src={media.poster} alt={`${movie.title} poster`} />
                    <span className="movie-rank">{String(index + 1).padStart(2, "0")}</span>
                  </div>

                  <div className="movie-card-content">
                    <h3>{movie.title}</h3>

                    <div className="movie-card-meta">
                      <span>IMDB {movie.imdb}</span>
                      <span>{getYear(movie.relaese)}</span>
                    </div>

                    <p>{trimText(movie.description, 92)}</p>

                    <div className="movie-card-footer">
                      <span>{movie.studio?.title || "Unknown Studio"}</span>
                      <span>{formatDuration(movie.duration)}</span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        {moviesData && (
          <nav className="pagination-bar" aria-label="Movie pagination">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </button>

            <div className="pagination-info">
              <strong>{moviesData.count}</strong>
              <span>titles in catalog</span>
            </div>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={!moviesData.next || isLoading}
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </main>
  );
};

export default MovieListPage;
