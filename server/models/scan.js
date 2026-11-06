const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    websiteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Website",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "running",
        "completed",
        "failed",
        "cancelled",
      ],
      default: "pending",
    },

    vulnerabilities: {
      type: Number,
      default: 0,
    },

    // ----------------------------------------------
    // Precomputed severity summary
    // ----------------------------------------------
    // Used by the dashboard so it does not have
    // to process all historical findings repeatedly.
    severityCounts: {
      critical: {
        type: Number,
        default: 0,
      },

      high: {
        type: Number,
        default: 0,
      },

      medium: {
        type: Number,
        default: 0,
      },

      low: {
        type: Number,
        default: 0,
      },

      informational: {
        type: Number,
        default: 0,
      },
    },

    // ----------------------------------------------
    // Precomputed Security Health Score
    // ----------------------------------------------
    // Calculated by the Vulnerability Intelligence
    // Engine when the scan is completed.
    healthScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    // ----------------------------------------------
    // Precomputed Security Health Status
    // ----------------------------------------------
    healthStatus: {
      type: String,
      enum: [
        "Healthy",
        "Moderate",
        "At Risk",
        "Critical",
      ],
      default: null,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    zapSpiderId: {
      type: String,
      default: null,
    },

    zapActiveScanId: {
      type: String,
      default: null,
    },

    // --------------------------------------------------
    // NOTE:
    // ZAP findings are no longer stored directly inside
    // the Scan document.
    //
    // They will be stored as separate ScanFinding
    // documents linked using scanId.
    // --------------------------------------------------

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// --------------------------------------------------
// Dashboard overview index
// --------------------------------------------------

scanSchema.index({
  userId: 1,
  status: 1,
  createdAt: -1,
});


// --------------------------------------------------
// Security trend index
// --------------------------------------------------

scanSchema.index({
  userId: 1,
  websiteId: 1,
  status: 1,
  completedAt: 1,
});


// --------------------------------------------------
// Scans list index
// --------------------------------------------------

scanSchema.index({
  userId: 1,
  createdAt: -1,
});


const Scan =
  mongoose.models.Scan ||
  mongoose.model("Scan", scanSchema);

module.exports = Scan;