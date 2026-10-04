const Dataset = require('../models/Dataset');
const { parseExcelBuffer } = require('../services/excelParser');
const { profileDataset } = require('../services/dataProfiler');
const { generateInsightsAndRecommendations } = require('../services/insightEngine');
const { isDbConnected } = require('../config/db');

// In-memory fallback cache when MongoDB is offline
const memoryDatasets = [];

// 1. Upload & Analyze Excel File
exports.uploadExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No Excel or CSV file provided for upload' });
    }

    const { buffer, originalname, size } = req.file;

    // Step A: Parse Excel buffer
    const parsed = parseExcelBuffer(buffer, originalname);

    // Step B: Data Profiling Engine
    const profile = profileDataset(parsed.data);

    // Step C: Insights & Chart Recommendations Engine
    const { insights, recommendations } = generateInsightsAndRecommendations(
      profile,
      parsed.rowCount
    );

    let datasetId = 'mem_' + Date.now();

    // Step D: Save Dataset in MongoDB if connected, otherwise keep in-memory
    if (isDbConnected()) {
      try {
        const datasetDoc = new Dataset({
          fileName: originalname,
          fileSize: size || 0,
          rowCount: parsed.rowCount,
          columnCount: parsed.columnCount,
          sheetNames: parsed.sheetNames,
          activeSheet: parsed.activeSheet,
          user: req.user ? req.user.id : null,
          columns: profile.columns,
          quality: profile.quality,
          insights,
          chartRecommendations: recommendations,
          data: parsed.data,
        });

        await datasetDoc.save();
        datasetId = datasetDoc._id;
      } catch (dbErr) {
        console.warn('⚠️ Could not persist to MongoDB, saving in-memory:', dbErr.message);
      }
    }

    const datasetPayload = {
      id: datasetId,
      fileName: originalname,
      fileSize: size || 0,
      rowCount: parsed.rowCount,
      columnCount: parsed.columnCount,
      columns: profile.columns,
      quality: profile.quality,
      insights,
      chartRecommendations: recommendations,
      data: parsed.data,
      createdAt: new Date(),
    };

    // Store in memory cache
    memoryDatasets.unshift(datasetPayload);

    // Return complete rich response
    return res.status(200).json({
      success: true,
      filename: originalname,
      message: 'Data processed and analyzed successfully' + (!isDbConnected() ? ' (In-Memory mode: MongoDB offline)' : ''),
      data: parsed.data,
      dataset: {
        id: datasetId,
        fileName: originalname,
        fileSize: size || 0,
        rowCount: parsed.rowCount,
        columnCount: parsed.columnCount,
        columns: profile.columns,
        quality: profile.quality,
        insights,
        chartRecommendations: recommendations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get All Saved Files / Datasets
exports.getFilesData = async (req, res, next) => {
  try {
    let datasets = [];

    if (isDbConnected()) {
      try {
        const filter = req.user ? { $or: [{ user: req.user.id }, { user: null }] } : {};
        const dbDatasets = await Dataset.find(filter)
          .select('fileName fileSize rowCount columnCount quality createdAt')
          .sort({ createdAt: -1 });

        datasets = dbDatasets.map((d) => ({
          id: d._id,
          fileName: d.fileName,
          fileSize: d.fileSize,
          rowCount: d.rowCount,
          columnCount: d.columnCount,
          healthScore: d.quality ? d.quality.healthScore : 100,
          createdAt: d.createdAt,
        }));
      } catch (dbErr) {
        console.warn('⚠️ Could not query MongoDB:', dbErr.message);
      }
    }

    // Merge in-memory datasets if not already present
    memoryDatasets.forEach((m) => {
      if (!datasets.some((d) => d.fileName === m.fileName)) {
        datasets.unshift({
          id: m.id,
          fileName: m.fileName,
          fileSize: m.fileSize,
          rowCount: m.rowCount,
          columnCount: m.columnCount,
          healthScore: m.quality ? m.quality.healthScore : 100,
          createdAt: m.createdAt,
        });
      }
    });

    const fileNames = datasets.map((d) => d.fileName);

    return res.status(200).json({
      data: fileNames,
      datasets,
      isDbConnected: isDbConnected(),
      message: 'Files found',
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get Data Preview by file name or dataset ID
exports.getDataPreview = async (req, res, next) => {
  try {
    const file = req.body.file || req.query.file;
    if (!file) {
      return res.status(400).json({ message: 'File name or dataset ID is required' });
    }

    // Check in-memory first
    const memoryMatch = memoryDatasets.find((d) => d.fileName === file || String(d.id) === file);
    if (memoryMatch) {
      return res.status(200).json({
        Data: memoryMatch.data,
        data: memoryMatch.data,
        dataset: {
          id: memoryMatch.id,
          fileName: memoryMatch.fileName,
          rowCount: memoryMatch.rowCount,
          columnCount: memoryMatch.columnCount,
          columns: memoryMatch.columns,
          quality: memoryMatch.quality,
          insights: memoryMatch.insights,
          chartRecommendations: memoryMatch.chartRecommendations,
        },
      });
    }

    // Check MongoDB if connected
    if (isDbConnected()) {
      let datasetDoc = null;
      if (file.match(/^[0-9a-fA-F]{24}$/)) {
        datasetDoc = await Dataset.findById(file);
      }
      if (!datasetDoc) {
        datasetDoc = await Dataset.findOne({ fileName: file }).sort({ createdAt: -1 });
      }

      if (datasetDoc) {
        return res.status(200).json({
          Data: datasetDoc.data,
          data: datasetDoc.data,
          dataset: {
            id: datasetDoc._id,
            fileName: datasetDoc.fileName,
            rowCount: datasetDoc.rowCount,
            columnCount: datasetDoc.columnCount,
            columns: datasetDoc.columns,
            quality: datasetDoc.quality,
            insights: datasetDoc.insights,
            chartRecommendations: datasetDoc.chartRecommendations,
          },
        });
      }
    }

    return res.status(404).json({ message: 'File data not found.' });
  } catch (error) {
    next(error);
  }
};

// 4. Get Full Dataset Analysis by ID
exports.getDatasetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const memoryMatch = memoryDatasets.find((d) => String(d.id) === id);
    if (memoryMatch) {
      return res.status(200).json({ success: true, dataset: memoryMatch });
    }

    if (isDbConnected()) {
      const datasetDoc = await Dataset.findById(id);
      if (datasetDoc) {
        return res.status(200).json({ success: true, dataset: datasetDoc });
      }
    }

    return res.status(404).json({ message: 'Dataset not found' });
  } catch (error) {
    next(error);
  }
};

// 5. Delete Dataset by filename or ID
exports.deleteFile = async (req, res, next) => {
  try {
    const { filename } = req.params;

    // Delete from memory
    const memIdx = memoryDatasets.findIndex((d) => d.fileName === filename || String(d.id) === filename);
    if (memIdx !== -1) {
      memoryDatasets.splice(memIdx, 1);
    }

    // Delete from MongoDB if connected
    if (isDbConnected()) {
      if (filename.match(/^[0-9a-fA-F]{24}$/)) {
        await Dataset.findByIdAndDelete(filename);
      } else {
        await Dataset.findOneAndDelete({ fileName: filename });
      }
    }

    return res.status(200).json({
      message: 'File deleted successfully',
      file: filename,
    });
  } catch (error) {
    next(error);
  }
};

// 6. Clean Dataset Action (One-click data cleaning)
exports.cleanDataset = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const { fillMissing = true, removeDuplicates = true } = req.body;

    let targetData = null;
    let targetDataset = null;

    const memoryMatch = memoryDatasets.find((d) => d.fileName === filename || String(d.id) === filename);
    if (memoryMatch) {
      targetData = memoryMatch.data;
      targetDataset = memoryMatch;
    } else if (isDbConnected()) {
      targetDataset = await Dataset.findOne({ fileName: filename }).sort({ createdAt: -1 });
      if (targetDataset) targetData = targetDataset.data;
    }

    if (!targetData) {
      return res.status(404).json({ message: 'Dataset not found for cleaning' });
    }

    let cleanedRows = [...targetData];

    // Remove duplicates if requested
    if (removeDuplicates) {
      const seen = new Set();
      cleanedRows = cleanedRows.filter((row) => {
        const key = JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    // Fill missing values if requested
    if (fillMissing && targetDataset.columns) {
      const colMeans = {};
      targetDataset.columns.forEach((col) => {
        if (col.type === 'numeric' && col.mean !== undefined) {
          colMeans[col.name] = col.mean;
        }
      });

      cleanedRows = cleanedRows.map((row) => {
        const newRow = { ...row };
        Object.keys(newRow).forEach((key) => {
          if (newRow[key] === null || newRow[key] === undefined || newRow[key] === '') {
            if (colMeans[key] !== undefined) {
              newRow[key] = colMeans[key];
            } else {
              newRow[key] = 'N/A';
            }
          }
        });
        return newRow;
      });
    }

    // Re-profile cleaned data
    const newProfile = profileDataset(cleanedRows);
    const { insights, recommendations } = generateInsightsAndRecommendations(
      newProfile,
      cleanedRows.length
    );

    // Update in-memory
    if (memoryMatch) {
      memoryMatch.data = cleanedRows;
      memoryMatch.rowCount = cleanedRows.length;
      memoryMatch.columns = newProfile.columns;
      memoryMatch.quality = newProfile.quality;
      memoryMatch.insights = insights;
      memoryMatch.chartRecommendations = recommendations;
    }

    // Update MongoDB if connected
    if (isDbConnected() && targetDataset.save) {
      targetDataset.data = cleanedRows;
      targetDataset.rowCount = cleanedRows.length;
      targetDataset.columns = newProfile.columns;
      targetDataset.quality = newProfile.quality;
      targetDataset.insights = insights;
      targetDataset.chartRecommendations = recommendations;
      await targetDataset.save();
    }

    return res.status(200).json({
      message: 'Dataset cleaned successfully',
      data: cleanedRows,
      dataset: {
        id: targetDataset.id || targetDataset._id,
        fileName: targetDataset.fileName,
        rowCount: cleanedRows.length,
        columnCount: targetDataset.columnCount,
        columns: newProfile.columns,
        quality: newProfile.quality,
        insights,
        chartRecommendations: recommendations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 7. Seed Sample Demo Dataset
exports.getDemoDataset = async (req, res, next) => {
  try {
    const demoRows = [
      { Region: 'North', Product: 'Laptops', Sales: 45000, Units: 45, Satisfaction: 4.5, Quarter: 'Q1' },
      { Region: 'North', Product: 'Smartphones', Sales: 62000, Units: 120, Satisfaction: 4.8, Quarter: 'Q1' },
      { Region: 'South', Product: 'Laptops', Sales: 38000, Units: 38, Satisfaction: 4.2, Quarter: 'Q1' },
      { Region: 'South', Product: 'Tablets', Sales: 29000, Units: 95, Satisfaction: 4.1, Quarter: 'Q1' },
      { Region: 'East', Product: 'Smartphones', Sales: 78000, Units: 150, Satisfaction: 4.9, Quarter: 'Q1' },
      { Region: 'East', Product: 'Accessories', Sales: 18000, Units: 240, Satisfaction: 4.6, Quarter: 'Q1' },
      { Region: 'West', Product: 'Laptops', Sales: 52000, Units: 50, Satisfaction: 4.7, Quarter: 'Q1' },
      { Region: 'West', Product: 'Tablets', Sales: 34000, Units: 110, Satisfaction: 4.3, Quarter: 'Q1' },
      { Region: 'North', Product: 'Accessories', Sales: 22000, Units: 290, Satisfaction: 4.4, Quarter: 'Q2' },
      { Region: 'South', Product: 'Smartphones', Sales: 71000, Units: 140, Satisfaction: 4.8, Quarter: 'Q2' },
      { Region: 'East', Product: 'Laptops', Sales: 49000, Units: 48, Satisfaction: 4.6, Quarter: 'Q2' },
      { Region: 'West', Product: 'Accessories', Sales: 25000, Units: 310, Satisfaction: 4.5, Quarter: 'Q2' },
    ];

    const profile = profileDataset(demoRows);
    const { insights, recommendations } = generateInsightsAndRecommendations(profile, demoRows.length);

    const demoDatasetObj = {
      id: 'demo-dataset-sales',
      fileName: 'Sample_Sales_Data.xlsx',
      fileSize: 15420,
      rowCount: demoRows.length,
      columnCount: Object.keys(demoRows[0]).length,
      columns: profile.columns,
      quality: profile.quality,
      insights,
      chartRecommendations: recommendations,
      data: demoRows,
      createdAt: new Date(),
    };

    if (!memoryDatasets.some((d) => d.fileName === demoDatasetObj.fileName)) {
      memoryDatasets.push(demoDatasetObj);
    }

    return res.status(200).json({
      filename: 'Sample_Sales_Data.xlsx',
      data: demoRows,
      dataset: {
        id: demoDatasetObj.id,
        fileName: demoDatasetObj.fileName,
        fileSize: demoDatasetObj.fileSize,
        rowCount: demoDatasetObj.rowCount,
        columnCount: demoDatasetObj.columnCount,
        columns: profile.columns,
        quality: profile.quality,
        insights,
        chartRecommendations: recommendations,
      },
    });
  } catch (error) {
    next(error);
  }
};
