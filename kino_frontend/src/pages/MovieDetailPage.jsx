import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons";
import { faBookmark as faBookmarkSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";
import { getMovieDetail } from "../services/movieService";
import { getMovieMedia, resolveMovieImage } from "../data/movieMedia";
import { useMyList } from "../hooks/useMyList";

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

const getYouTubeEmbedUrl = (trailerUrl) => {
  if (!trailerUrl) {
    return "";
  }

  try {
    const parsedUrl = new URL(trailerUrl);
    const normalizedHost = parsedUrl.hostname.replace(/^www\./, "");
    let videoId = "";

    if (normalizedHost === "youtu.be") {
      videoId = parsedUrl.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (normalizedHost.endsWith("youtube.com")) {
      if (parsedUrl.pathname === "/watch") {
        videoId = parsedUrl.searchParams.get("v") || "";
      } else if (parsedUrl.pathname.startsWith("/embed/")) {
        videoId = parsedUrl.pathname.split("/")[2] || "";
      } else if (parsedUrl.pathname.startsWith("/shorts/")) {
        videoId = parsedUrl.pathname.split("/")[2] || "";
      }
    }

    if (!videoId) {
      return "";
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  } catch {
    return "";
  }
};

const MovieDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const { movieIds, toggleMovieId } = useMyList();

  useEffect(() => {
    const handleNavScroll = () => setIsNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleNavScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleNavScroll);
  }, []);
  const backTarget = useMemo(
    () => (typeof location.state?.from === "string" ? location.state.from : "/"),
    [location.state],
  );

  const handleBack = () => {
    navigate(backTarget, {
      replace: true,
      state: {
        restoreScrollTop: location.state?.restoreScrollTop ?? 0,
        restoreMovieId: location.state?.restoreMovieId ?? null,
        restoreSectionKey: location.state?.restoreSectionKey ?? null,
      },
    });
  };


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

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

  const toggleMyList = () => {
    if (!id) {
      return;
    }

    toggleMovieId(id);
  };

  const isInList = movieIds.includes(String(id));
  const media = movie ? getMovieMedia(movie) : null;
  const trailerEmbedUrl = useMemo(() => getYouTubeEmbedUrl(movie?.trailer_url), [movie?.trailer_url]);
  const galleryItems = movie
    ? movie.movie_images?.length > 0
      ? movie.movie_images.map((imageItem) => resolveMovieImage(imageItem.image))
      : [media?.backdrop, media?.poster].filter(Boolean)
    : [];

  useEffect(() => {
    setIsTrailerOpen(false);
  }, [id, trailerEmbedUrl]);

  useEffect(() => {
    if (!isTrailerOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsTrailerOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isTrailerOpen]);

  return (
    <main className="detail-page" id="page-top">
      <header className={`topbar topbar-detail${isNavScrolled ? " topbar--scrolled" : ""}`}>
        <Link to="/" className="brand">
          KINO
        </Link>

        <div className="topbar-meta">
          <Link to="/my-list" className="back-link topbar-link">
            My List {movieIds.length}
          </Link>
          <button type="button" className="back-link" onClick={handleBack}>
            Back
          </button>
        </div>
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
                  <button 
                    type="button" 
                    className={`hero-button hero-button-primary hero-button-save${isInList ? " hero-button-primary-active" : ""}`}
                    onClick={toggleMyList}
                  >
                    <FontAwesomeIcon
                      icon={isInList ? faBookmarkSolid : faBookmarkRegular}
                      className="hero-button-icon"
                      fixedWidth
                      aria-hidden="true"
                    />
                    <span>{isInList ? "Saved in My List" : "Save to My List"}</span>
                  </button>
                  <button
                    type="button"
                    className="hero-button hero-button-secondary"
                    onClick={() => setIsTrailerOpen(true)}
                    disabled={!trailerEmbedUrl}
                  >
                    ▶ Trailer
                  </button>
                  <span className="detail-note">
                    {trailerEmbedUrl
                      ? "Trailer link can be managed directly from Django admin."
                      : "Trailer button activates after you add a YouTube link in Django admin."}
                  </span>
                </div>
              </div>

              <div className="detail-poster">
                <img src={media.poster} alt={`${movie.title} poster`} />
              </div>
            </div>
          </section>

          {isTrailerOpen && trailerEmbedUrl && (
            <div className="trailer-modal" role="dialog" aria-modal="true" aria-label={`${movie.title} trailer`}>
              <button
                type="button"
                className="trailer-modal-backdrop"
                onClick={() => setIsTrailerOpen(false)}
                aria-label="Close trailer"
              />

              <div className="trailer-modal-panel">
                <div className="trailer-modal-header">
                  <div>
                    <span className="section-tag">Trailer</span>
                    <h2>{movie.title}</h2>
                  </div>

                  <button type="button" className="back-link" onClick={() => setIsTrailerOpen(false)}>
                    Close
                  </button>
                </div>

                <div className="trailer-frame-shell">
                  <iframe
                    src={trailerEmbedUrl}
                    title={`${movie.title} trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

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

      <SiteFooter />
    </main>
  );
};

export default MovieDetailPage;
