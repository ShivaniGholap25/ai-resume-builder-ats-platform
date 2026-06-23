// ============================================================
// services/aiService.js — OpenAI API wrapper with retry + fallback
// ============================================================

const OpenAI = require('openai');

// Lazy-init so the server starts even without a key configured
let _client = null;

const getClient = () => {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      throw new Error('OPENAI_API_KEY is not configured. Add it to backend/.env');
    }
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
};

const MODEL = () => process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * Core chat completion call.
 * Returns parsed JSON from the model response.
 *
 * @param {string} system  - System prompt
 * @param {string} user    - User prompt
 * @param {number} maxTokens
 * @returns {Promise<object>} Parsed JSON response
 */
const callAI = async (system, user, maxTokens = 1200) => {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: MODEL(),
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user },
    ],
    max_tokens: maxTokens,
    temperature: 0.4,          // Low temp = consistent, professional output
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0]?.message?.content || '{}';

  try {
    return JSON.parse(raw);
  } catch {
    // If JSON parse fails, return a structured error
    return { error: 'AI returned malformed JSON', raw };
  }
};

/**
 * callAI with one automatic retry on transient errors.
 */
const callAIWithRetry = async (system, user, maxTokens = 1200) => {
  try {
    return await callAI(system, user, maxTokens);
  } catch (err) {
    // Retry once on rate limit or server error
    if (err.status === 429 || err.status >= 500) {
      await new Promise(r => setTimeout(r, 1500));
      return await callAI(system, user, maxTokens);
    }
    throw err;
  }
};

module.exports = { callAIWithRetry };
