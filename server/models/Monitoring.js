const mongoose = require("mongoose");

const monitoringSchema = new mongoose.Schema(
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

    enabled: {
      type: Boolean,
      default: false,
    },

    frequency: {
      type: String,
      enum: ["daily", "weekly", "demo"],
      default: "daily",
    },

    nextRunAt: {
      type: Date,
      default: null,
    },

    lastRunAt: {
      type: Date,
      default: null,
    },

    lastScanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scan",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Monitoring =
  mongoose.models.Monitoring ||
  mongoose.model("Monitoring", monitoringSchema);

module.exports = Monitoring;