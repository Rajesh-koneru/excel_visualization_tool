const { queryDatasetAI } = require('../services/aiService');
const Dataset = require('../models/Dataset');
const { isDbConnected } = require('../config/db');

exports.queryAI = async (req, res, next) => {
  try {
    const { question, datasetContext, datasetId, fileName, chatHistory = [], sampleRows = [] } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide a valid question.' });
    }

    if (question.length > 500) {
      return res.status(400).json({ message: 'Question is too long (maximum 500 characters).' });
    }

    let resolvedContext = datasetContext || {};
    let resolvedRows = sampleRows || [];

    // Attempt to enrich context from DB or in-memory if datasetId or fileName given
    const lookupKey = datasetId || fileName;
    if (lookupKey && isDbConnected()) {
      try {
        const found = lookupKey.match(/^[0-9a-fA-F]{24}$/)
          ? await Dataset.findById(lookupKey)
          : await Dataset.findOne({ fileName: lookupKey }).sort({ createdAt: -1 });

        if (found) {
          resolvedContext = {
            fileName: found.fileName,
            rowCount: found.rowCount,
            columnCount: found.columnCount,
            columns: found.columns,
            quality: found.quality,
            insights: found.insights,
            ...resolvedContext,
          };
          if (found.data && found.data.length > 0) {
            resolvedRows = found.data;
          }
        }
      } catch (dbErr) {
        console.warn('⚠️ Could not fetch dataset from DB for AI query:', dbErr.message);
      }
    }

    if (!resolvedContext.columns && resolvedRows.length === 0) {
      return res.status(400).json({
        message: 'Please upload an Excel file before asking questions.',
      });
    }

    // Call isolated AI service
    const result = await queryDatasetAI({
      question: question.trim(),
      datasetContext: resolvedContext,
      chatHistory,
      rows: resolvedRows,
    });

    return res.status(200).json({
      success: true,
      answer: result.answer,
      source: result.source,
      intent: result.intent,
    });
  } catch (error) {
    next(error);
  }
};
