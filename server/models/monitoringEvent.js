const mongoose = require("mongoose");

const monitoringEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    websiteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Website",
      required: true,
      index: true,
    },

    scanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scan",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "NEW_VULNERABILITY",
        "HEALTH_SCORE_DROP",
        "SCAN_COMPLETED",
        "SCAN_FAILED",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      enum: [
        "Critical",
        "High",
        "Medium",
        "Low",
        "Informational",
      ],
      default: "Informational",
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const MonitoringEvent =
  mongoose.models.MonitoringEvent ||
  mongoose.model(
    "MonitoringEvent",
    monitoringEventSchema
  );

module.exports = MonitoringEvent;