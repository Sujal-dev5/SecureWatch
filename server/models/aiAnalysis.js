const mongoose = require("mongoose");

const aiAnalysisSchema = new mongoose.Schema(
  {
    scanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scan",
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    healthScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    healthStatus: {
      type: String,
      required: true,
    },

    analysis: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    model: {
      type: String,
      default: null,
    },

    /*
     * AI analysis version.
     *
     * Increment this whenever the AI prompt,
     * schema, context structure, or analysis
     * requirements change enough that existing
     * cached results should be regenerated.
     */
    aiVersion: {
      type: Number,
      required: true,
      default: 2,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

aiAnalysisSchema.index({
  userId: 1,
  scanId: 1,
});

const AIAnalysis =
  mongoose.models.AIAnalysis ||
  mongoose.model(
    "AIAnalysis",
    aiAnalysisSchema
  );

module.exports = AIAnalysis;