import { Link } from "react-router-dom";

const SiteFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-tag">KINO</span>
          <p className="site-footer-note">
            Streaming-inspired movie browsing with cleaner discovery, saved lists, and
            focused detail pages.
          </p>
        </div>

        <nav className="site-footer-nav" aria-label="Footer">
          <Link to="/" className="site-footer-link">
            Browse
          </Link>
          <Link to="/my-list" className="site-footer-link">
            My List
          </Link>
          <a href="#page-top" className="site-footer-link">
            Back to top
          </a>
        </nav>

        <div className="site-footer-meta">
          <p className="site-footer-copy">© {currentYear} KINO</p>
          <p className="site-footer-caption">Built for fast browsing.</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
