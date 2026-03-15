import { getMovieMedia } from "../data/movieMedia";

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

const MovieCard = ({
  movie,
  sectionKey,
  onOpenMovie,
  showImdbBadge = false,
  rankNumber = null,
}) => {
  const media = getMovieMedia(movie);

  const shouldShowRank = !showImdbBadge && rankNumber !== null;

  return (
    <article
      className="movie-card"
      data-movie-id={movie.id}
      style={{ "--card-accent": media.accent }}
    >
      <button
        type="button"
        className="movie-card-link"
        onClick={() => onOpenMovie(movie.id, sectionKey)}
      >
        <div className="movie-card-image">
          <img src={media.poster} alt={`${movie.title} poster`} />

          {shouldShowRank && (
            <span className="movie-rank">{String(rankNumber).padStart(2, "0")}</span>
          )}

          {showImdbBadge && <span className="movie-card-badge">IMDB {movie.imdb}</span>}
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

        <div className="movie-card-hover-preview" aria-hidden="true">
          <div
            className="preview-backdrop"
            style={{ "--preview-image": `url("${media.backdrop}")` }}
          >
            <div className="preview-topline">
              <span className="preview-score">IMDb {movie.imdb}</span>
            </div>

            <div className="preview-overlay">
              <span className="preview-play-button">
                <span className="preview-play-glyph" />
              </span>
              <span className="preview-cta">View details</span>
            </div>
          </div>

          <div className="preview-info">
            <div className="preview-heading">
              <h4 className="preview-title">{movie.title}</h4>
              <span className="preview-year">{getYear(movie.relaese)}</span>
            </div>

            <div className="preview-meta">
              <span className="preview-imdb">IMDb {movie.imdb}</span>
              <span>{formatDuration(movie.duration)}</span>
              <span>{movie.studio?.title || "Unknown Studio"}</span>
            </div>

            <p className="preview-description">{trimText(movie.description, 92)}</p>

            {movie.genres && movie.genres.length > 0 && (
              <div className="preview-genres">
                {movie.genres.slice(0, 3).map((genre) => (
                  <span key={genre.id}>{genre.title}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </button>
    </article>
  );
};

export default MovieCard;
