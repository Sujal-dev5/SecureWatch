const mongoose = require("mongoose");

const Monitoring = require("../../models/Monitoring");
const Website = require("../../models/website");
const Scan = require("../../models/scan");

const {
  createScanCompletedEvent,
  createScanFailedEvent,
  createNewVulnerabilityEvent,
  createHealthScoreDropEvent,
} = require("./monitoringEventService");

const { generateIntelligence } = require("../intelligence/intelligenceService");

const { runScan } = require("../scan/scanService");

const getIntervalMs = (frequency) => {
  switch (frequency) {
    case "daily":
      return 24 * 60 * 60 * 1000;

    case "weekly":
      return 7 * 24 * 60 * 60 * 1000;

    case "demo":
      return 2 * 60 * 1000;

    default:
      throw new Error("Invalid monitoring frequency");
  }
};

const calculateNextRunAt = (frequency) => {
  return new Date(Date.now() + getIntervalMs(frequency));
};

const createMonitoring = async ({ userId, websiteId, frequency }) => {
  if (!mongoose.Types.ObjectId.isValid(websiteId)) {
    const error = new Error("Invalid website ID");
    error.statusCode = 400;
    throw error;
  }

  const website = await Website.findOne({
    _id: websiteId,
    userId,
  });

  if (!website) {
    const error = new Error("Website not found");
    error.statusCode = 404;
    throw error;
  }

  const existingMonitoring = await Monitoring.findOne({
    websiteId,
    userId,
  });

  if (existingMonitoring) {
    const error = new Error("Monitoring already exists for this website");
    error.statusCode = 409;
    throw error;
  }

  const monitoring = await Monitoring.create({
    userId,
    websiteId,
    frequency,
    enabled: false,
    nextRunAt: null,
  });

  return monitoring;
};

const getUserMonitorings = async (userId) => {
  return Monitoring.find({ userId })
    .populate("websiteId", "name url")
    .populate("lastScanId")
    .sort({ createdAt: -1 });
};

const getMonitoringById = async ({ monitoringId, userId }) => {
  if (!mongoose.Types.ObjectId.isValid(monitoringId)) {
    const error = new Error("Invalid monitoring ID");
    error.statusCode = 400;
    throw error;
  }

  const monitoring = await Monitoring.findOne({
    _id: monitoringId,
    userId,
  })
    .populate("websiteId", "name url")
    .populate("lastScanId");

  if (!monitoring) {
    const error = new Error("Monitoring not found");
    error.statusCode = 404;
    throw error;
  }

  return monitoring;
};

const updateMonitoring = async ({ monitoringId, userId, frequency }) => {
  if (!mongoose.Types.ObjectId.isValid(monitoringId)) {
    const error = new Error("Invalid monitoring ID");
    error.statusCode = 400;
    throw error;
  }

  const monitoring = await Monitoring.findOne({
    _id: monitoringId,
    userId,
  });

  if (!monitoring) {
    const error = new Error("Monitoring not found");
    error.statusCode = 404;
    throw error;
  }

  if (!["daily", "weekly", "demo"].includes(frequency)) {
    const error = new Error("Invalid monitoring frequency");
    error.statusCode = 400;
    throw error;
  }

  monitoring.frequency = frequency;

  if (monitoring.enabled) {
    monitoring.nextRunAt = calculateNextRunAt(frequency);
  }

  await monitoring.save();

  return monitoring;
};

const toggleMonitoring = async ({ monitoringId, userId, enabled }) => {
  if (!mongoose.Types.ObjectId.isValid(monitoringId)) {
    const error = new Error("Invalid monitoring ID");
    error.statusCode = 400;
    throw error;
  }

  const monitoring = await Monitoring.findOne({
    _id: monitoringId,
    userId,
  });

  if (!monitoring) {
    const error = new Error("Monitoring not found");
    error.statusCode = 404;
    throw error;
  }

  monitoring.enabled = enabled;

  if (enabled) {
    monitoring.nextRunAt = calculateNextRunAt(monitoring.frequency);
  } else {
    monitoring.nextRunAt = null;
  }

  await monitoring.save();

  return monitoring;
};

const deleteMonitoring = async ({ monitoringId, userId }) => {
  if (!mongoose.Types.ObjectId.isValid(monitoringId)) {
    const error = new Error("Invalid monitoring ID");
    error.statusCode = 400;
    throw error;
  }

  const monitoring = await Monitoring.findOneAndDelete({
    _id: monitoringId,
    userId,
  });

  if (!monitoring) {
    const error = new Error("Monitoring not found");
    error.statusCode = 404;
    throw error;
  }

  return monitoring;
};

const runMonitoringScan = async (monitoring) => {
  const website = await Website.findOne({
    _id: monitoring.websiteId,
    userId: monitoring.userId,
  });

  if (!website) {
    throw new Error("Website not found for monitoring");
  }

  // Prevent scheduled scan from conflicting
  // with an already running manual/scheduled scan.
  const activeScan = await Scan.findOne({
    userId: monitoring.userId,
    websiteId: monitoring.websiteId,
    status: {
      $in: ["pending", "running"],
    },
  });

  if (activeScan) {
    console.log(`Skipping monitoring ${monitoring._id}: scan already active`);

    return null;
  }

  const scan = await Scan.create({
    userId: monitoring.userId,
    websiteId: monitoring.websiteId,
    status: "pending",
    progress: 0,
  });

  console.log(`Scheduled scan created: ${scan._id} for ${website.url}`);

  // Move monitoring to the next scheduled run.
  monitoring.lastRunAt = new Date();
  monitoring.lastScanId = scan._id;
  monitoring.nextRunAt = calculateNextRunAt(monitoring.frequency);

  await monitoring.save();

  // IMPORTANT:
  // Wait for the actual scan to finish.
  await runScan(scan._id, website.url);

  // Get the final scan state after runScan finishes.
  const completedScan = await Scan.findById(scan._id);

  if (!completedScan) {
    throw new Error("Scheduled scan record not found");
  }

  // Handle failed scan.
  if (completedScan.status === "failed") {
    await createScanFailedEvent({
      userId: monitoring.userId,
      websiteId: monitoring.websiteId,
      scanId: completedScan._id,
      errorMessage: completedScan.errorMessage,
    });

    return completedScan;
  }

  // Handle cancelled scan.
  if (completedScan.status === "cancelled") {
    return completedScan;
  }

  // Only completed scans should generate intelligence/events.
  if (completedScan.status !== "completed") {
    return completedScan;
  }

  // Generate deterministic VIE intelligence.
  const intelligence = await generateIntelligence({
    scanId: completedScan._id,
    userId: monitoring.userId,
  });

  // Always record successful scheduled scan completion.
  await createScanCompletedEvent({
    userId: monitoring.userId,
    websiteId: monitoring.websiteId,
    scanId: completedScan._id,
    findingsCount: completedScan.vulnerabilities || 0,
  });

  // Find the previous completed scan.
  const previousScan = await Scan.findOne({
    websiteId: monitoring.websiteId,
    userId: monitoring.userId,
    status: "completed",
    _id: {
      $ne: completedScan._id,
    },
  }).sort({
    completedAt: -1,
  });

  // No previous scan = baseline scan.
  if (!previousScan) {
    return completedScan;
  }

  // New vulnerability event.
  if (intelligence.changes.new > 0) {
    await createNewVulnerabilityEvent({
      userId: monitoring.userId,
      websiteId: monitoring.websiteId,
      scanId: completedScan._id,
      count: intelligence.changes.new,
    });
  }

  // Calculate previous scan's VIE health score.
  const previousIntelligence = await generateIntelligence({
    scanId: previousScan._id,
    userId: monitoring.userId,
  });

  // Health score drop event.
  if (intelligence.healthScore < previousIntelligence.healthScore) {
    await createHealthScoreDropEvent({
      userId: monitoring.userId,
      websiteId: monitoring.websiteId,
      scanId: completedScan._id,
      previousScore: previousIntelligence.healthScore,
      currentScore: intelligence.healthScore,
    });
  }

  return completedScan;
};

module.exports = {
  createMonitoring,
  getUserMonitorings,
  getMonitoringById,
  updateMonitoring,
  toggleMonitoring,
  deleteMonitoring,
  calculateNextRunAt,
  runMonitoringScan,
};
