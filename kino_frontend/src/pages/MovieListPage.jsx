import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getAllMovies, getMovies } from "../services/movieService";
import { getMovieMedia } from "../data/movieMedia";

const PAGE_SIZE = 10;
const TRENDING_LIMIT = 6;

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

const getTimestamp = (movie) => {
  const value = movie.updated || movie.created || movie.relaese;
  return value ? new Date(value).getTime() : 0;
};

const getTrendingMovies = (movies) =>
  [...movies]
    .sort((firstMovie, secondMovie) => {
      const secondTimestamp = getTimestamp(secondMovie);
      const firstTimestamp = getTimestamp(firstMovie);

      if (secondTimestamp !== firstTimestamp) {
        return secondTimestamp - firstTimestamp;
      }

      return (secondMovie.imdb || 0) - (firstMovie.imdb || 0);
    })
    .slice(0, TRENDING_LIMIT);

const getImdbMovies = (movies) =>
  [...movies]
    .filter((movie) => Number(movie.imdb) >= 7.5 && Number(movie.imdb) <= 10)
    .sort((firstMovie, secondMovie) => {
      if (secondMovie.imdb !== firstMovie.imdb) {
        return secondMovie.imdb - firstMovie.imdb;
      }

      return getTimestamp(secondMovie) - getTimestamp(firstMovie);
    });

const getPageFromSearchParams = (searchParams) => {
  const pageValue = Number(searchParams.get("page") || "1");

  if (!Number.isFinite(pageValue) || pageValue < 1) {
    return 1;
  }

  return Math.floor(pageValue);
};

const MovieShelf = ({ sectionMovies, options }) => {
  const {
    sectionKey,
    useGlobalRank = false,
    showImdbBadge = false,
    currentPage = 1,
    onOpenMovie,
  } = options;
  const shelfRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(sectionMovies.length > 0);
  const shelfStorageKey = `movie-shelf-scroll:${sectionKey}:${currentPage}`;

  useEffect(() => {
    const shelfElement = shelfRef.current;

    if (!shelfElement) {
      return undefined;
    }

    const updateScrollState = () => {
      const { scrollLeft, clientWidth, scrollWidth } = shelfElement;
      const isOverflowing = scrollWidth > clientWidth + 4;
      setHasOverflow(isOverflowing);
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(isOverflowing && scrollLeft + clientWidth < scrollWidth - 4);
    };

    const savedScrollLeft = Number(sessionStorage.getItem(shelfStorageKey) || "0");
    if (Number.isFinite(savedScrollLeft) && savedScrollLeft > 0) {
      shelfElement.scrollLeft = savedScrollLeft;
    }

    updateScrollState();
    const handleShelfScroll = () => {
      sessionStorage.setItem(shelfStorageKey, String(shelfElement.scrollLeft));
      updateScrollState();
    };

    shelfElement.addEventListener("scroll", handleShelfScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });
    resizeObserver.observe(shelfElement);

    return () => {
      sessionStorage.setItem(shelfStorageKey, String(shelfElement.scrollLeft));
      shelfElement.removeEventListener("scroll", handleShelfScroll);
      window.removeEventListener("resize", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [sectionMovies, shelfStorageKey]);

  const handleShelfScroll = (direction) => {
    const shelfElement = shelfRef.current;

    if (!shelfElement) {
      return;
    }

    const scrollDistance = Math.max(shelfElement.clientWidth * 0.82, 320);
    shelfElement.scrollBy({
      left: direction === "right" ? scrollDistance : -scrollDistance,
      behavior: "smooth",
    });
  };

  if (!sectionMovies.length) {
    return <div className="status-card shelf-status">Bu bolmede hele film yoxdur.</div>;
  }

  return (
    <div className="movie-shelf-shell">
      {hasOverflow && (
        <div className="movie-shelf-toolbar">
          <div className="movie-shelf-controls">
            <button
              type="button"
              className="shelf-control-button shelf-control-prev"
              onClick={() => handleShelfScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              <span className="sr-only">Scroll left</span>
            </button>

            <button
              type="button"
              className="shelf-control-button shelf-control-next"
              onClick={() => handleShelfScroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              <span className="sr-only">Scroll right</span>
            </button>
          </div>
        </div>
      )}

      <div className="movie-shelf" data-section={sectionKey} ref={shelfRef}>
        {sectionMovies.map((movie, index) => {
          const media = getMovieMedia(movie);
          const rankNumber = useGlobalRank
            ? (currentPage - 1) * PAGE_SIZE + index + 1
            : index + 1;

          return (
            <article
              key={`${sectionKey}-${movie.id}`}
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

                  {!showImdbBadge && (
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
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
};

const MovieListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [moviesData, setMoviesData] = useState(null);
  const [allMovies, setAllMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShelfLoading, setIsShelfLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const currentPage = getPageFromSearchParams(searchParams);
  const isFirstPageRenderRef = useRef(true);
  const shouldRestoreScrollRef = useRef(true);
  const listScrollStorageKey = `movie-list-scroll:${location.pathname}${location.search}`;
  const returnPath = useMemo(
    () => ({
      from: `${location.pathname}${location.search}`,
    }),
    [location.pathname, location.search],
  );

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
  }, [currentPage]);

  useEffect(() => {
    if (isFirstPageRenderRef.current) {
      isFirstPageRenderRef.current = false;
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    const fetchAllMovies = async () => {
      setIsShelfLoading(true);

      try {
        const data = await getAllMovies();
        setAllMovies(data);
      } catch (error) {
        console.error("Umumi film siyahisi alinarken xeta bas verdi:", error);
      } finally {
        setIsShelfLoading(false);
      }
    };

    fetchAllMovies();
  }, []);

  useEffect(() => {
    const saveWindowScroll = () => {
      sessionStorage.setItem(listScrollStorageKey, String(window.scrollY));
    };

    window.addEventListener("scroll", saveWindowScroll, { passive: true });

    return () => {
      saveWindowScroll();
      window.removeEventListener("scroll", saveWindowScroll);
    };
  }, [listScrollStorageKey]);

  useEffect(() => {
    if (isLoading || isShelfLoading || !moviesData || !shouldRestoreScrollRef.current) {
      return;
    }

    const restoreScrollTop = Number(
      location.state?.restoreScrollTop ?? sessionStorage.getItem(listScrollStorageKey) ?? "0",
    );
    const restoreMovieId = location.state?.restoreMovieId;
    const restoreSectionKey = location.state?.restoreSectionKey;

    if (Number.isFinite(restoreScrollTop) && restoreScrollTop > 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: restoreScrollTop, behavior: "auto" });
        });
      });
    }

    if (restoreMovieId) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const movieCard =
            document.querySelector(
              `[data-section="${restoreSectionKey}"] [data-movie-id="${restoreMovieId}"]`,
            ) ??
            document.querySelector(`[data-movie-id="${restoreMovieId}"]`);

          movieCard?.scrollIntoView({
            block: "nearest",
            inline: "nearest",
            behavior: "auto",
          });
        });
      });
    }

    shouldRestoreScrollRef.current = false;
  }, [isLoading, isShelfLoading, moviesData, listScrollStorageKey, location.state]);

  const movies = moviesData?.results ?? [];
  const trendingMovies = getTrendingMovies(allMovies);
  const imdbMovies = getImdbMovies(allMovies);
  const featuredMovie = trendingMovies[0] ?? movies[0] ?? null;
  const featuredMedia = featuredMovie ? getMovieMedia(featuredMovie) : null;
  const totalPages = moviesData ? Math.ceil(moviesData.count / PAGE_SIZE) : 0;

  const handlePreviousPage = () => {
    if (currentPage === 1 || isLoading) {
      return;
    }

    const previousPage = currentPage - 1;
    const nextSearchParams = new URLSearchParams(searchParams);

    if (previousPage === 1) {
      nextSearchParams.delete("page");
    } else {
      nextSearchParams.set("page", String(previousPage));
    }

    setSearchParams(nextSearchParams);
  };

  const handleNextPage = () => {
    if (!moviesData?.next || isLoading) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("page", String(currentPage + 1));
    setSearchParams(nextSearchParams);
  };

  const handleBrowseTitles = () => {
    document.getElementById("continue-watching")?.scrollIntoView({ behavior: "smooth" });
  };

  const openMovieDetail = (movieId, sectionKey = "featured") => {
    sessionStorage.setItem(listScrollStorageKey, String(window.scrollY));

    navigate(`/movies/${movieId}`, {
      state: {
        ...returnPath,
        restoreScrollTop: window.scrollY,
        restoreMovieId: movieId,
        restoreSectionKey: sectionKey,
      },
    });
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
                <button
                  type="button"
                  className="hero-button hero-button-primary"
                  onClick={() => openMovieDetail(featuredMovie.id, "featured")}
                >
                  Watch Details
                </button>

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
        <section className="content-section">
          <div className="section-header">
            <div>
              <span className="section-tag">Trending Now</span>
              <h2>Trending Now</h2>
            </div>

            <p className="section-caption">Son elave olunan ve en cox diqqet ceken filmler</p>
          </div>

          {isShelfLoading && !trendingMovies.length ? (
            <div className="status-card shelf-status">Trending siyahisi yuklenir...</div>
          ) : (
            <MovieShelf
              sectionMovies={trendingMovies}
              options={{ sectionKey: "trending", currentPage, onOpenMovie: openMovieDetail }}
            />
          )}
        </section>

        <section className="content-section" id="continue-watching">
          <div className="section-header">
            <div>
              <span className="section-tag">Continue Watching</span>
              <h2>Continue Watching</h2>
            </div>

            <p className="section-caption">
              Page {currentPage}
              {totalPages ? ` / ${totalPages}` : ""}
            </p>
          </div>

          {isLoading && !movies.length && <div className="status-card shelf-status">Loading movies...</div>}
          {errorMessage && <div className="status-card status-card-error shelf-status">{errorMessage}</div>}

          {!errorMessage && (!isLoading || movies.length > 0) && (
            <MovieShelf
              sectionMovies={movies}
              options={{ sectionKey: "continue", useGlobalRank: true, currentPage, onOpenMovie: openMovieDetail }}
            />
          )}

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

        <section className="content-section">
          <div className="section-header">
            <div>
              <span className="section-tag">IMDB</span>
              <h2>IMDB 7.5 - 10</h2>
            </div>

            <p className="section-caption">Butun filmler arasindan yuksek reytingliler</p>
          </div>

          {isShelfLoading && !imdbMovies.length ? (
            <div className="status-card shelf-status">IMDB siyahisi yuklenir...</div>
          ) : (
            <MovieShelf
              sectionMovies={imdbMovies}
              options={{ sectionKey: "imdb", showImdbBadge: true, currentPage, onOpenMovie: openMovieDetail }}
            />
          )}
        </section>
      </section>
    </main>
  );
};

export default MovieListPage;
