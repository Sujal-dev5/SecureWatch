const {
  createMonitoring,
  getUserMonitorings,
  getMonitoringById,
  updateMonitoring,
  toggleMonitoring,
  deleteMonitoring,
} = require("../services/monitoring/monitoringService");

const MonitoringEvent = require("../models/MonitoringEvent");

const getMonitoringEvents = async (req, res) => {
  try {
    const events = await MonitoringEvent.find({
      userId: req.userId,
    })
      .populate("websiteId", "name url")
      .populate("scanId", "status progress completedAt")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      events,
    });
  } catch (error) {
    console.error("Get monitoring events error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message || "Failed to fetch monitoring events",
    });
  }
};

const markMonitoringEventRead = async (req, res) => {
  try {
    const event = await MonitoringEvent.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!event) {
      return res.status(404).json({
        message: "Monitoring event not found",
      });
    }

    event.read = true;

    await event.save();

    return res.status(200).json({
      message: "Monitoring event marked as read",
      event,
    });
  } catch (error) {
    console.error(
      "Mark monitoring event read error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      message:
        error.message ||
        "Failed to mark monitoring event as read",
    });
  }
};

const createMonitoringController = async (req, res) => {
  try {
    const { websiteId, frequency } = req.body;

    if (!websiteId) {
      return res.status(400).json({
        message: "websiteId is required",
      });
    }

    const monitoring = await createMonitoring({
      userId: req.userId,
      websiteId,
      frequency,
    });

    return res.status(201).json({
      message: "Monitoring created successfully",
      monitoring,
    });
  } catch (error) {
    console.error("Create monitoring error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message || "Failed to create monitoring",
    });
  }
};

const getMonitorings = async (req, res) => {
  try {
    const monitorings = await getUserMonitorings(
      req.userId
    );

    return res.status(200).json({
      monitorings,
    });
  } catch (error) {
    console.error("Get monitorings error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message || "Failed to fetch monitorings",
    });
  }
};

const getMonitoring = async (req, res) => {
  try {
    const monitoring = await getMonitoringById({
      monitoringId: req.params.id,
      userId: req.userId,
    });

    return res.status(200).json({
      monitoring,
    });
  } catch (error) {
    console.error("Get monitoring error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message || "Failed to fetch monitoring",
    });
  }
};

const updateMonitoringController = async (req, res) => {
  try {
    const { frequency } = req.body;

    if (!frequency) {
      return res.status(400).json({
        message: "frequency is required",
      });
    }

    const monitoring = await updateMonitoring({
      monitoringId: req.params.id,
      userId: req.userId,
      frequency,
    });

    return res.status(200).json({
      message: "Monitoring updated successfully",
      monitoring,
    });
  } catch (error) {
    console.error("Update monitoring error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message || "Failed to update monitoring",
    });
  }
};

const toggleMonitoringController = async (req, res) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        message: "enabled must be a boolean",
      });
    }

    const monitoring = await toggleMonitoring({
      monitoringId: req.params.id,
      userId: req.userId,
      enabled,
    });

    return res.status(200).json({
      message: enabled
        ? "Monitoring started successfully"
        : "Monitoring stopped successfully",
      monitoring,
    });
  } catch (error) {
    console.error("Toggle monitoring error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message || "Failed to toggle monitoring",
    });
  }
};

const deleteMonitoringController = async (req, res) => {
  try {
    await deleteMonitoring({
      monitoringId: req.params.id,
      userId: req.userId,
    });

    return res.status(200).json({
      message: "Monitoring deleted successfully",
    });
  } catch (error) {
    console.error("Delete monitoring error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.message || "Failed to delete monitoring",
    });
  }
};

module.exports = {
  createMonitoringController,
  getMonitorings,
  getMonitoring,
  updateMonitoringController,
  toggleMonitoringController,
  deleteMonitoringController,
  getMonitoringEvents,
  markMonitoringEventRead,
};