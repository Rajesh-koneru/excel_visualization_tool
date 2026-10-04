const mongoose = require('mongoose');

const DatasetSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    rowCount: {
      type: Number,
      default: 0,
    },
    columnCount: {
      type: Number,
      default: 0,
    },
    sheetNames: [{ type: String }],
    activeSheet: { type: String },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    columns: [
      {
        name: { type: String },
        type: { type: String, enum: ['numeric', 'categorical', 'date', 'boolean', 'mixed'] },
        missingCount: { type: Number, default: 0 },
        uniqueCount: { type: Number, default: 0 },
        min: { type: mongoose.Schema.Types.Mixed },
        max: { type: mongoose.Schema.Types.Mixed },
        mean: { type: Number },
        median: { type: Number },
        stdDev: { type: Number },
        sum: { type: Number },
        topValues: [{ value: String, count: Number }],
      },
    ],
    quality: {
      totalCells: { type: Number, default: 0 },
      nullCells: { type: Number, default: 0 },
      duplicateRows: { type: Number, default: 0 },
      emptyColumns: [{ type: String }],
      healthScore: { type: Number, default: 100 },
    },
    insights: [
      {
        id: { type: String },
        category: { type: String }, // 'highlight', 'warning', 'trend', 'distribution', 'correlation'
        title: { type: String },
        description: { type: String },
        metric: { type: String },
        severity: { type: String, enum: ['info', 'warning', 'success', 'important'] },
      },
    ],
    chartRecommendations: [
      {
        chartType: { type: String },
        title: { type: String },
        description: { type: String },
        xAxis: { type: String },
        yAxis: { type: String },
        aggregation: { type: String },
      },
    ],
    data: [{ type: mongoose.Schema.Types.Mixed }], // parsed row records
  },
  {
    timestamps: true,
  }
);

// Index for fast query by fileName and uploadDate
DatasetSchema.index({ fileName: 1, createdAt: -1 });

module.exports = mongoose.model('Dataset', DatasetSchema);
