import { useEffect, useState } from "react";
import api from "../Services/api";
import WebsiteCard from "../Components/WebsiteCard";
import { useNavigate } from "react-router-dom";

function Websites() {
  const [websites, setWebsites] = useState([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchWebsites = async () => {
    try {
      setError("");

      const response = await api.get("/websites");

      setWebsites(response.data.websites);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load websites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setAdding(true);

    try {
      const response = await api.post("/websites", {
        name,
        url,
      });

      setWebsites((currentWebsites) => [
        response.data.website,
        ...currentWebsites,
      ]);

      setName("");
      setUrl("");

      setMessage("Website added successfully");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add website");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    setMessage("");

    try {
      await api.delete(`/websites/${id}`);

      setWebsites((currentWebsites) =>
        currentWebsites.filter((website) => website._id !== id),
      );

      setMessage("Website deleted successfully");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete website");
    }
  };

  const handleScan = async (id) => {
  setError("");
  setMessage("");

  try {
    const response = await api.post("/scans", {
      websiteId: id,
    });

    setMessage(
      response.data.message ||
        "Scan started successfully"
    );

    const scanId = response.data.scanId;

    navigate(`/scans/${scanId}`);
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Failed to start scan"
    );
  }
};

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Websites</h1>
          <p className="page-subtitle">
            Manage the websites you want to monitor.
          </p>
        </div>
      </div>

      <section className="card">
        <div className="card-header">
          <h2>Add Website</h2>
          <p>Add a website to your SecureWatch AI workspace.</p>
        </div>

        <form className="website-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="website-name">Website Name</label>

            <input
              id="website-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Website"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="website-url">Website URL</label>

              <input
                id="website-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com"
                required
              />

              <small>
                Enter a domain such as example.com
             </small>
         </div>

          <button type="submit" className="primary-button" disabled={adding}>
            {adding ? "Adding..." : "Add Website"}
          </button>
        </form>
      </section>

      {message && <div className="alert success-alert">{message}</div>}

      {error && <div className="alert error-alert">{error}</div>}

      <section className="card">
        <div className="card-header">
          <h2>Your Websites</h2>
          <p>Websites connected to your account.</p>
        </div>

        {loading ? (
          <p className="empty-state">Loading websites...</p>
        ) : websites.length === 0 ? (
          <p className="empty-state">No websites added yet.</p>
        ) : (
          <div className="website-list">
            {websites.map((website) => (
              <WebsiteCard
                key={website._id}
                website={website}
                onDelete={handleDelete}
                onScan={handleScan}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Websites;
