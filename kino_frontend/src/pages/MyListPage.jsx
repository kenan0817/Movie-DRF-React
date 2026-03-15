import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import SiteFooter from "../components/SiteFooter";
import { useMyList } from "../hooks/useMyList";
import { getAllMovies } from "../services/movieService";

const MyListPage = () => {
  const navigate = useNavigate();
  const { movieIds } = useMyList();
  const [allMovies, setAllMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedCatalog, setHasFetchedCatalog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNavScrolled, setIsNavScrolled] = useState(false);

  useEffect(() => {
    const handleNavScroll = () => setIsNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleNavScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleNavScroll);
  }, []);

  useEffect(() => {
    if (!movieIds.length || allMovies.length) {
      return;
    }

    const fetchAllSavedMovies = async () => {
      setIsLoading(true);
      setHasFetchedCatalog(false);
      setErrorMessage("");

      try {
        const data = await getAllMovies();
        setAllMovies(data);
      } catch (error) {
        console.error("Error fetching My List movies:", error);
        setErrorMessage("Failed to load My List.");
      } finally {
        setIsLoading(false);
        setHasFetchedCatalog(true);
      }
    };

    fetchAllSavedMovies();
  }, [allMovies.length, movieIds.length]);

  const savedMovies = useMemo(() => {
    const movieMap = new Map(allMovies.map((movie) => [String(movie.id), movie]));
    return movieIds.map((movieId) => movieMap.get(movieId)).filter(Boolean);
  }, [allMovies, movieIds]);

  const handleOpenMovie = (movieId) => {
    navigate(`/movies/${movieId}`, {
      state: {
        from: "/my-list",
      },
    });
  };

  return (
    <main className="netflix-page" id="page-top">
      <header className={`topbar${isNavScrolled ? " topbar--scrolled" : ""}`}>
        <Link to="/" className="brand">
          KINO
        </Link>

        <div className="topbar-meta">
          <Link to="/" className="back-link topbar-link">
            Browse
          </Link>
          <span>My List</span>
          <span>{movieIds.length} Saved</span>
        </div>
      </header>

      <section className="my-list-shell">
        <div className="my-list-hero">
          <div className="my-list-copy">
            <span className="section-tag">Wishlist</span>
            <h1>My List</h1>
            <p>
              Save the titles you want to revisit later. Anything you save from the
              detail page appears here automatically.
            </p>
          </div>

          <div className="featured-pills">
            <span>{movieIds.length} saved titles</span>
            <span>{savedMovies.length} ready to open</span>
          </div>
        </div>

        {isLoading && <div className="status-card">Loading My List...</div>}
        {errorMessage && <div className="status-card status-card-error">{errorMessage}</div>}

        {!isLoading && !errorMessage && movieIds.length === 0 && (
          <div className="status-card my-list-empty">
            <div className="my-list-empty-copy">
              <h2>Your list is empty</h2>
              <p>Open a movie detail page and save titles there to build your list.</p>
            </div>

            <Link to="/" className="hero-button hero-button-primary my-list-empty-link">
              Browse Movies
            </Link>
          </div>
        )}

        {!isLoading && !errorMessage && movieIds.length > 0 && hasFetchedCatalog && savedMovies.length === 0 && (
          <div className="status-card my-list-empty">
            <div className="my-list-empty-copy">
              <h2>Saved titles are unavailable</h2>
              <p>Your list still exists, but those movies could not be loaded right now.</p>
            </div>

            <Link to="/" className="hero-button hero-button-primary my-list-empty-link">
              Back to Catalog
            </Link>
          </div>
        )}

        {!isLoading && !errorMessage && movieIds.length > 0 && savedMovies.length > 0 && (
          <div className="my-list-grid">
            {savedMovies.map((movie) => (
              <MovieCard
                key={`my-list-${movie.id}`}
                movie={movie}
                sectionKey="my-list"
                onOpenMovie={handleOpenMovie}
              />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
};

export default MyListPage;
