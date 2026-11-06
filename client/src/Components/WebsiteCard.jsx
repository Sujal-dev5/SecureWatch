function WebsiteCard({ website, onDelete, onScan }) {
  return (
    <div className="website-item">
      <div className="website-info">
        <strong>{website.name}</strong>

        <a
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {website.url}
        </a>
      </div>

      <div className="website-actions">
        <button
          type="button"
          className="primary-button"
          onClick={() => onScan(website._id)}
        >
          Scan Now
        </button>

        <button
          type="button"
          className="danger-button"
          onClick={() => onDelete(website._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default WebsiteCard;