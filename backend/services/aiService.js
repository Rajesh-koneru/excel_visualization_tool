const { resolveDeterministicQuery } = require('./aiQueryEngine');

// Check for free AI provider configuration
const AI_API_KEY = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || 'gemini-1.5-flash';

/**
 * AI Data Query Assistant Service
 * Combines deterministic calculations on the dataset with LLM natural language generation.
 */
async function queryDatasetAI({ question, datasetContext, chatHistory = [], rows = [] }) {
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    throw new Error('Please provide a question to ask the AI Assistant.');
  }

  // Step 1: Run deterministic calculation / analysis on actual dataset data
  const deterministicResult = resolveDeterministicQuery(question, datasetContext, rows);

  // If question is completely out of scope, return immediate guardrail answer
  if (deterministicResult.intent === 'OUT_OF_SCOPE') {
    return {
      answer: deterministicResult.answer,
      source: 'guardrail',
      intent: 'OUT_OF_SCOPE',
    };
  }

  // Step 2: If no AI API key is configured, use the deterministic query engine response
  if (!AI_API_KEY) {
    if (deterministicResult.isDeterministic && deterministicResult.answer) {
      return {
        answer: deterministicResult.answer,
        source: 'deterministic',
        intent: deterministicResult.intent,
      };
    }

    // Default analytical answer based on dataset context
    const columns = datasetContext?.columns || [];
    const numCols = columns.filter((c) => c.type === 'numeric').map((c) => c.name);
    const catCols = columns.filter((c) => c.type === 'categorical').map((c) => c.name);

    return {
      answer: `Based on **${datasetContext?.fileName || 'this dataset'}** (${datasetContext?.rowCount || rows.length} records):\n` +
        `• Numeric columns available: ${numCols.join(', ') || 'None'}\n` +
        `• Categorical columns: ${catCols.join(', ') || 'None'}\n\n` +
        `You can ask specific questions like: *"What is the highest ${numCols[0] || 'value'}?"*, *"Which ${catCols[0] || 'category'} has highest ${numCols[0] || 'value'}?"*, or *"Give me an overall report."*`,
      source: 'deterministic',
      intent: 'GENERAL',
    };
  }

  // Step 3: Call AI Provider with ground-truth calculation context
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: AI_MODEL });

    // Build structured dataset summary (Never send huge raw rows)
    const columnsSummary = (datasetContext?.columns || []).map((c) => {
      if (c.type === 'numeric') {
        return `${c.name} (Numeric: min=${c.min}, max=${c.max}, avg=${c.mean}, total=${c.sum})`;
      }
      return `${c.name} (Categorical: ${c.uniqueCount} unique values, top mode=${c.topValues?.[0]?.value || 'N/A'})`;
    }).join('\n');

    // Build prompt with deterministic ground truth
    const prompt = `
You are the AI Data Assistant for the Excel Visual Analyzer platform.
A user has uploaded an Excel/CSV spreadsheet and is asking questions about it.

DATASET CONTEXT:
- File Name: ${datasetContext?.fileName || 'Uploaded Spreadsheet'}
- Total Rows: ${datasetContext?.rowCount || rows.length}
- Total Columns: ${datasetContext?.columnCount || (datasetContext?.columns || []).length}
- Data Health Score: ${datasetContext?.quality?.healthScore || 100}%
- Column Metadata:
${columnsSummary}

DETERMINISTIC GROUND TRUTH (PRE-CALCULATED FROM RAW DATASET):
${deterministicResult.isDeterministic ? JSON.stringify(deterministicResult.facts, null, 2) : 'No exact single-value calculation match; synthesize from metadata.'}
${deterministicResult.answer ? `Suggested computation finding: ${deterministicResult.answer}` : ''}

CONVERSATION HISTORY:
${chatHistory.slice(-4).map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')}

USER QUESTION:
"${question}"

STRICT GUIDELINES:
1. Answer accurately based ONLY on the provided dataset context and deterministic ground truth above.
2. If ground truth calculation is available, use its exact numbers. Do NOT invent, assume, or hallucinate metrics.
3. Keep the answer clear, professional, direct, and formatted with clean markdown bullet points or bold text.
4. If the question cannot be answered from the dataset, state clearly: "I couldn't find enough information in the uploaded dataset to answer that question."
5. Never execute code or disclose system keys or server paths.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return {
      answer: responseText.trim(),
      source: 'ai_model',
      model: AI_MODEL,
      intent: deterministicResult.intent || 'LLM_SYNTHESIS',
    };
  } catch (err) {
    console.error('❌ AI Provider Error:', err.message);

    // Gracefully fallback to deterministic answer if API fails/times out
    if (deterministicResult.isDeterministic && deterministicResult.answer) {
      return {
        answer: deterministicResult.answer,
        source: 'deterministic_fallback',
        intent: deterministicResult.intent,
      };
    }

    return {
      answer: "Unable to reach the external AI service right now. Please verify your AI_API_KEY in backend/.env or try asking specific questions like 'What is the highest value?' or 'Give me an overall report.'",
      source: 'error',
    };
  }
}

module.exports = {
  queryDatasetAI,
};
