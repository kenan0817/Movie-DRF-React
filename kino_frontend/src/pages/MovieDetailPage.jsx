import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMovieDetail } from "../services/movieService";
import { getMovieMedia, resolveMovieImage } from "../data/movieMedia";

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

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchMovieDetail = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getMovieDetail(id);
        setMovie(data);
      } catch (error) {
        console.error("Movie detail alinarken xeta bas verdi:", error);
        setErrorMessage("Movie detail yuklenmedi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetail();
  }, [id]);

  const media = movie ? getMovieMedia(movie) : null;
  const galleryItems = movie
    ? movie.movie_images?.length > 0
      ? movie.movie_images.map((imageItem) => resolveMovieImage(imageItem.image))
      : [media?.backdrop, media?.poster].filter(Boolean)
    : [];

  return (
    <main className="detail-page">
      <header className="topbar topbar-detail">
        <Link to="/" className="brand">
          KINO
        </Link>

        <Link to="/" className="back-link">
          Back to Home
        </Link>
      </header>

      {isLoading && <div className="status-card detail-status">Loading movie detail...</div>}
      {errorMessage && <div className="status-card status-card-error detail-status">{errorMessage}</div>}

      {movie && media && (
        <>
          <section
            className="detail-hero"
            style={{
              "--detail-image": `url("${media.backdrop}")`,
              "--detail-accent": media.accent,
            }}
          >
            <div className="detail-hero-overlay">
              <div className="detail-poster">
                <img src={media.poster} alt={`${movie.title} poster`} />
              </div>

              <div className="detail-main">
                <span className="section-tag">{media.label}</span>
                <h1>{movie.title}</h1>

                <div className="featured-pills">
                  <span>{getYear(movie.relaese)}</span>
                  <span>{formatDuration(movie.duration)}</span>
                  <span>IMDB {movie.imdb}</span>
                  <span>{movie.studio?.title || "Unknown Studio"}</span>
                </div>

                <p className="detail-description">{movie.description}</p>

                <div className="detail-actions">
                  <Link to="/" className="hero-button hero-button-primary">
                    Browse More
                  </Link>
                  <span className="detail-note">Streaming style layout with local poster and backdrop mapping.</span>
                </div>
              </div>
            </div>
          </section>

          <section className="detail-content">
            <div className="detail-panel">
              <div className="section-header">
                <div>
                  <span className="section-tag">Overview</span>
                  <h2>Movie Information</h2>
                </div>
              </div>

              <div className="detail-stats">
                <article>
                  <span>Studio</span>
                  <strong>{movie.studio?.title || "Unknown"}</strong>
                </article>
                <article>
                  <span>Release</span>
                  <strong>{movie.relaese || "Unknown"}</strong>
                </article>
                <article>
                  <span>Duration</span>
                  <strong>{formatDuration(movie.duration)}</strong>
                </article>
                <article>
                  <span>Rating</span>
                  <strong>{movie.imdb}</strong>
                </article>
              </div>

              <div className="detail-columns">
                <div className="detail-copy-block">
                  <h3>Storyline</h3>
                  <p>{movie.description}</p>
                </div>

                <div className="detail-copy-block">
                  <h3>Genres</h3>
                  {movie.genres?.length > 0 ? (
                    <div className="genre-row">
                      {movie.genres.map((genre) => (
                        <span key={genre.id} className="genre-pill">
                          {genre.title}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>No genres added yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="detail-panel">
              <div className="section-header">
                <div>
                  <span className="section-tag">Visuals</span>
                  <h2>Poster and Backdrops</h2>
                </div>
              </div>

              <div className="gallery-grid">
                {galleryItems.map((imageSource, index) => (
                  <div key={`${imageSource}-${index}`} className="gallery-card">
                    <img src={imageSource} alt={`${movie.title} visual ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default MovieDetailPage;
