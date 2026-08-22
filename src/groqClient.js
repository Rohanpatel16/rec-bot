import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'qwen/qwen3.6-27b';
const FALLBACK_MODELS = [
  DEFAULT_MODEL,
  'qwen/qwen3.6-27b',
  'groq/compound',
  'groq/compound-mini',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'allam-2-7b',
];

// Deduplicate fallback list while maintaining priority order
const MODEL_PRIORITY = [...new Set(FALLBACK_MODELS)];

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY environment variable. Please set GROQ_API_KEY in your .env file.');
  }
  return new Groq({ apiKey });
}

/**
 * Call Groq AI with automatic model failover and JSON response parsing.
 * @param {string} prompt - User prompt / content
 * @param {string} systemInstruction - System prompt instructions
 * @returns {Promise<object>} Parsed JSON response from Groq AI
 */
export async function generateGroqJson(prompt, systemInstruction = '') {
  const groq = getGroqClient();
  let lastError = null;

  for (const model of MODEL_PRIORITY) {
    try {
      console.log(`🤖 Calling Groq AI [Model: ${model}]...`);
      const response = await groq.chat.completions.create({
        model,
        messages: [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const rawContent = response.choices?.[0]?.message?.content;
      if (!rawContent) {
        throw new Error('Empty response received from Groq AI.');
      }

      const parsedJson = JSON.parse(rawContent);
      return parsedJson;
    } catch (err) {
      console.warn(`⚠️ Model "${model}" failed: ${err.message}. Trying next fallback model...`);
      lastError = err;
    }
  }

  throw new Error(`All Groq models failed. Last error: ${lastError?.message}`);
}

/**
 * Test Groq connection utility
 */
export async function testGroqConnection() {
  try {
    const res = await generateGroqJson(
      'Return a JSON object: {"status": "ok", "message": "Groq AI is ready"}',
      'You are a helpful test assistant.'
    );
    console.log('✅ Groq AI Test Success:', res);
    return res;
  } catch (err) {
    console.error('❌ Groq AI Test Failed:', err.message);
    throw err;
  }
}
