import { useEffect, useState } from "react";

import api from "../Services/api";

function Profile() {
  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError("");

        const response =
          await api.get(
            "/users/profile"
          );

        setProfile(
          response.data.user
        );

      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load profile"
        );

      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="page">

        <div className="page-header">
          <h1>Profile</h1>

          <p className="page-subtitle">
            Manage your SecureWatch AI account.
          </p>
        </div>

        <div className="card">
          <p className="empty-state">
            Loading profile...
          </p>
        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="page">

        <div className="page-header">
          <h1>Profile</h1>

          <p className="page-subtitle">
            Manage your SecureWatch AI account.
          </p>
        </div>

        <div className="alert error-alert">
          {error}
        </div>

      </div>
    );
  }

  return (
    <div className="page">

      {/* =========================================
          Page Header
      ========================================= */}

      <div className="page-header">

        <h1>
          Profile
        </h1>

        <p className="page-subtitle">
          Manage your SecureWatch AI account.
        </p>

      </div>


      {/* =========================================
          Profile Overview
      ========================================= */}

      <section className="card profile-overview">

        <div className="profile-header">

          <div className="profile-avatar">

            {(profile?.name || "U")
              .charAt(0)
              .toUpperCase()}

          </div>


          <div className="profile-identity">

            <h2>
              {profile?.name || "User"}
            </h2>

            <p>
              {profile?.email || "No email available"}
            </p>

          </div>

        </div>

      </section>


      {/* =========================================
          Account Information
      ========================================= */}

      <section className="card">

        <div className="card-header">

          <h2>
            Account Information
          </h2>

          <p>
            Basic information associated with your account.
          </p>

        </div>


        <div className="profile-info-grid">

          {/* Name */}

          <div className="profile-info-item">

            <span>
              Full Name
            </span>

            <strong>
              {profile?.name || "N/A"}
            </strong>

          </div>


          {/* Email */}

          <div className="profile-info-item">

            <span>
              Email Address
            </span>

            <strong>
              {profile?.email || "N/A"}
            </strong>

          </div>


          {/* Account Created */}

          <div className="profile-info-item">

            <span>
              Account Created
            </span>

            <strong>
              {profile?.createdAt
                ? new Date(
                    profile.createdAt
                  ).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                : "N/A"}
            </strong>

          </div>


          {/* Account Status */}

          <div className="profile-info-item">

            <span>
              Account Status
            </span>

            <strong className="profile-status">
              Active
            </strong>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Profile;