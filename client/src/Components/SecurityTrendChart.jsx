function SecurityTrendChart({ trends = [] }) {
  if (!trends.length) {
    return (
      <div className="security-trend-empty">
        <p>No completed scans available for this website yet.</p>
      </div>
    );
  }

  const width = 760;
  const height = 280;

  const padding = {
    top: 25,
    right: 30,
    bottom: 50,
    left: 50,
  };

  const chartWidth =
    width - padding.left - padding.right;

  const chartHeight =
    height - padding.top - padding.bottom;

  const getX = (index) => {
    if (trends.length === 1) {
      return padding.left + chartWidth / 2;
    }

    return (
      padding.left +
      (index / (trends.length - 1)) * chartWidth
    );
  };

  const getY = (score) => {
    return (
      padding.top +
      chartHeight -
      (score / 100) * chartHeight
    );
  };

  const points = trends.map((trend, index) => ({
    x: getX(index),
    y: getY(trend.healthScore),
    ...trend,
  }));

  const linePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const yLevels = [100, 75, 50, 25, 0];

  return (
    <div className="security-trend-chart">
      <div className="security-trend-chart-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="security-trend-svg"
          role="img"
          aria-label="Security health score trend"
        >
          {/* Horizontal Grid Lines */}

          {yLevels.map((level) => {
            const y = getY(level);

            return (
              <g key={level}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  className="trend-grid-line"
                />

                <text
                  x={padding.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="trend-axis-label"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* X Axis */}

          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={width - padding.right}
            y2={padding.top + chartHeight}
            className="trend-axis-line"
          />

          {/* Trend Line */}

          {points.length > 1 && (
            <polyline
              points={linePoints}
              fill="none"
              className="trend-line"
            />
          )}

          {/* Points */}

          {points.map((point, index) => (
            <g key={point.scanId || index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                className="trend-point"
              />

              <text
                x={point.x}
                y={point.y - 12}
                textAnchor="middle"
                className="trend-point-label"
              >
                {point.healthScore}
              </text>

              <text
                x={point.x}
                y={height - 18}
                textAnchor="middle"
                className="trend-date-label"
              >
                {new Date(point.date).toLocaleDateString()}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Current Health */}

      <div className="security-trend-current">
        <div>
          <span>Current Health Score</span>

          <strong>
            {trends[trends.length - 1].healthScore}/100
          </strong>
        </div>

        <div>
          <span>Status</span>

          <strong>
            {trends[trends.length - 1].healthStatus}
          </strong>
        </div>

        <div>
          <span>Completed Scans</span>

          <strong>{trends.length}</strong>
        </div>
      </div>
    </div>
  );
}

export default SecurityTrendChart;