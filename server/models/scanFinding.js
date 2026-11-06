const mongoose = require("mongoose");

const scanFindingSchema = new mongoose.Schema(
  {
    scanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scan",
      required: true,
    },

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

    title: {
      type: String,
      default: "Unknown Vulnerability",
    },

    severity: {
      type: String,
      default: "Informational",
    },

    confidence: {
      type: String,
      default: "Unknown",
    },

    url: {
      type: String,
      default: "",
    },

    method: {
      type: String,
      default: "",
    },

    parameter: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    evidence: {
      type: String,
      default: "",
    },

    solution: {
      type: String,
      default: "",
    },

    reference: {
      type: String,
      default: "",
    },

    pluginId: {
      type: String,
      default: "",
    },

    occurrences: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Indexes
scanFindingSchema.index({ scanId: 1 });
scanFindingSchema.index({ scanId: 1, severity: 1 });
scanFindingSchema.index({ scanId: 1, url: 1 });

const ScanFinding =
  mongoose.models.ScanFinding ||
  mongoose.model("ScanFinding", scanFindingSchema);

module.exports = ScanFinding;