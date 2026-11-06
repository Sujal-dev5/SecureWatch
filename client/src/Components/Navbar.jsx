import {
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import NotificationBell from "./NotificationBell";

import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    logout,
  } = useAuth();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const token =
    sessionStorage.getItem("token");

  const isHomePage =
    location.pathname === "/";

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/login");
  };

  const handleProfile = () => {
    setProfileOpen(false);
    navigate("/profile");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* ==========================================
            BRAND
        ========================================== */}

        <Link
          to="/"
          className="navbar-brand"
        >
          <span className="navbar-brand-icon">
            ⚡
          </span>

          <span>
            SecureWatch AI
          </span>
        </Link>


        {/* ==========================================
            NAVIGATION
        ========================================== */}

        <nav className="navbar-links">

          {token ? (

            /* ======================================
               AUTHENTICATED NAVBAR
            ====================================== */

            <>
              <Link to="/dashboard">
                Dashboard
              </Link>

              <Link to="/websites">
                Websites
              </Link>

              <Link to="/scans">
                Scans
              </Link>

              <Link to="/reports">
                Reports
              </Link>

              <Link to="/monitoring">
                Monitoring
              </Link>


              {/* ====================================
                  NOTIFICATIONS
              ==================================== */}

              <NotificationBell />


              {/* ====================================
                  PROFILE
              ==================================== */}

              <div className="navbar-profile">

                <button
                  type="button"
                  className="navbar-profile-button"
                  onClick={() =>
                    setProfileOpen(
                      !profileOpen
                    )
                  }
                  aria-expanded={
                    profileOpen
                  }
                >

                  <span className="navbar-profile-avatar">
                    {(user?.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                  <span className="navbar-profile-name">
                    {user?.name || "User"}
                  </span>

                  <span className="navbar-profile-arrow">
                    {profileOpen
                      ? "▲"
                      : "▼"}
                  </span>

                </button>


                {profileOpen && (

                  <div className="navbar-profile-menu">

                    {/* User information */}

                    <div className="navbar-profile-header">

                      <div className="navbar-profile-avatar large">
                        {(user?.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="navbar-profile-user-info">

                        <strong>
                          {user?.name || "User"}
                        </strong>

                        <span>
                          {user?.email || ""}
                        </span>

                      </div>

                    </div>


                    {/* Menu */}

                    <div className="navbar-profile-divider" />


                    <button
                      type="button"
                      className="navbar-profile-menu-item"
                      onClick={
                        handleProfile
                      }
                    >
                      <span>
                        👤
                      </span>

                      <span>
                        Profile
                      </span>
                    </button>


                    <button
                      type="button"
                      className="navbar-profile-menu-item logout-menu-item"
                      onClick={
                        handleLogout
                      }
                    >
                      <span>
                        ↪
                      </span>

                      <span>
                        Logout
                      </span>
                    </button>

                  </div>

                )}

              </div>

            </>

          ) : (

            /* ======================================
               PUBLIC NAVBAR
            ====================================== */

            <>
              {isHomePage ? (
                <>
                  <a href="#features">
                    Features
                  </a>

                  <a href="#how-it-works">
                    How It Works
                  </a>

                  <a href="#security">
                    Security
                  </a>
                </>
              ) : (
                <>
                  <Link to="/">
                    Home
                  </Link>

                  <Link to="/#features">
                    Features
                  </Link>

                  <Link to="/#security">
                    Security
                  </Link>
                </>
              )}

              <Link
                to="/login"
                className="navbar-login-link"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="navbar-register-link"
              >
                Get Started
              </Link>
            </>
          )}

        </nav>

      </div>
    </header>
  );
}

export default Navbar;