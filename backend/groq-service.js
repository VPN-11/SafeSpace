/**
 * Groq Service Module
 *
 * Provides optional, non-blocking Groq AI enhancements for emotional intelligence.
 * This service is completely isolated and has zero impact on existing functionality.
 *
 * If Groq fails for any reason:
 * - The app continues functioning normally
 * - Current outputs remain unchanged
 * - No crashes, freezes, or UI failures occur
 *
 * Design principles:
 * - Try/catch wraps all Groq operations
 * - Graceful fallback on any error
 * - Silent failures (debug logging only)
 * - Additive enhancement, never replacement
 */

const { generateText } = require("ai");
const { groq } = require("@ai-sdk/groq");

// Configuration
const MODEL_INFO = {
  id: "groq-emotional-intelligence",
  version: "1.0.0",
  model: "llama3-70b-8192",
  provider: "groq",
};

const GROQ_API_KEY = process.env.GROQ_API_KEY || null;
const IS_GROQ_ENABLED = GROQ_API_KEY !== null && GROQ_API_KEY.trim().length > 0;

/**
 * Validate API key presence without revealing its value
 */
function validateGroqSetup() {
  if (!IS_GROQ_ENABLED) {
    console.debug("[Groq] Service disabled: GROQ_API_KEY is not configured.");
    return false;
  }
  return true;
}

/**
 * Generate emotional intelligence insights using Groq
 *
 * Accepts the full text analysis result and generates:
 * - Enhanced contextual understanding
 * - Emotional reasoning
 * - Personalized AI-generated insights
 *
 * @param {string} userText - User's check-in text
 * @param {object} analysisResult - Full result from analyzeText()
 * @param {object} options - Additional context
 * @returns {Promise<object>} Enhancement object or null if disabled/failed
 */
async function generateEmotionalInsight(userText = "", analysisResult = {}, options = {}) {
  try {
    // Early exit if Groq is not configured
    if (!validateGroqSetup()) {
      return null;
    }

    // Validate inputs
    if (!userText || typeof userText !== "string" || userText.trim().length === 0) {
      console.debug("[Groq] Skipping: No meaningful text provided");
      return null;
    }

    if (typeof analysisResult !== "object" || !analysisResult.emotion) {
      console.debug("[Groq] Skipping: Invalid analysis result");
      return null;
    }

    // Extract context from analysis
    const { emotion, sentiment, stress, risk, support } = analysisResult;
    const requestTimeout = options.timeout || 5000;

    // Build Groq prompt with the detected emotional context
    const systemPrompt = `You are an empathetic emotional intelligence assistant helping someone process their feelings. 
Your role is to:
1. Validate their emotional experience
2. Provide contextual understanding of their state
3. Offer one specific, actionable insight that builds on their current emotion

Be concise (1-2 sentences max), warm, and direct. Focus on what's helpful NOW.`;

    const userPrompt = `The person said: "${userText.substring(0, 500)}"

Their emotional state:
- Detected emotion: ${emotion}
- Sentiment level: ${sentiment}/100
- Stress level: ${stress}/100
- Overall risk: ${risk}
- Support focus: ${support}

Generate a brief, personalized emotional insight that acknowledges their state and provides one actionable next step.`;

    // Call Groq with a timeout
    const result = await Promise.race([
      generateText({
        model: groq("llama3-70b-8192"),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7,
        maxTokens: 150,
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Groq request timeout")),
          requestTimeout
        )
      ),
    ]);

    // Extract and validate the response
    if (!result || !result.text || typeof result.text !== "string") {
      console.debug("[Groq] Invalid response format");
      return null;
    }

    const insight = result.text.trim();

    if (insight.length === 0) {
      console.debug("[Groq] Empty response text");
      return null;
    }

    // Return enhancement object (never replaces existing data)
    return {
      insight,
      generatedAt: new Date().toISOString(),
      model: MODEL_INFO,
      sourceEmotion: emotion,
      sourceSentiment: sentiment,
    };
  } catch (error) {
    // Graceful fallback: log error but don't throw
    const errorMsg = error?.message || String(error);
    console.debug(`[Groq] Enhancement failed (non-blocking): ${errorMsg}`);

    // Silently return null so frontend behavior is unaffected
    return null;
  }
}

/**
 * Generate contextual recommendations using Groq for specific emotions
 *
 * Provides AI-generated recommendations tailored to the detected emotion
 *
 * @param {string} emotion - Detected emotion key (e.g., "anxiety", "sadness")
 * @param {string} risk - Risk level ("Low", "Moderate", "High")
 * @param {object} options - Additional context
 * @returns {Promise<object>} Recommendation object or null if disabled/failed
 */
async function generateContextualRecommendations(
  emotion = "neutral",
  risk = "Low",
  options = {}
) {
  try {
    if (!validateGroqSetup()) {
      return null;
    }

    if (!emotion || typeof emotion !== "string") {
      console.debug("[Groq] Invalid emotion key");
      return null;
    }

    const requestTimeout = options.timeout || 5000;

    const systemPrompt = `You are a supportive wellness assistant providing brief, actionable recommendations.
Keep suggestions practical, immediate, and appropriate for the emotional state.
Format: 2-3 concrete actions the person can do in the next 5-15 minutes.`;

    const userPrompt = `Generate brief wellness recommendations for someone experiencing ${emotion} (risk level: ${risk}).
Focus on:
1. One immediate physical action
2. One cognitive/mindset shift
3. One way to build support or connection

Be concise and warm.`;

    const result = await Promise.race([
      generateText({
        model: groq("llama3-70b-8192"),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.6,
        maxTokens: 120,
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Groq request timeout")),
          requestTimeout
        )
      ),
    ]);

    if (!result || !result.text) {
      return null;
    }

    return {
      recommendations: result.text.trim(),
      generatedAt: new Date().toISOString(),
      emotion,
      risk,
      model: MODEL_INFO,
    };
  } catch (error) {
    const errorMsg = error?.message || String(error);
    console.debug(`[Groq] Recommendation generation failed: ${errorMsg}`);
    return null;
  }
}

/**
 * Fuse facial expression and text analysis for enhanced contextual reasoning
 *
 * Combines both signals (webcam emotion + text analysis) via Groq
 * to provide richer emotional understanding
 *
 * @param {object} expressionResult - Result from analyzeExpression()
 * @param {object} textResult - Result from analyzeText()
 * @param {object} options - Additional context
 * @returns {Promise<object>} Fusion result or null if disabled/failed
 */
async function fuseFacialAndTextAnalysis(
  expressionResult = {},
  textResult = {},
  options = {}
) {
  try {
    if (!validateGroqSetup()) {
      return null;
    }

    const expressionEmotion = expressionResult?.dominantExpression?.label || "unknown";
    const expressionConfidence = expressionResult?.confidence?.reliability || 0;
    const textEmotion = textResult?.emotion || "unknown";
    const textSentiment = textResult?.sentiment || 50;

    const requestTimeout = options.timeout || 5000;

    const systemPrompt = `You are an emotional intelligence expert analyzing multi-modal emotional signals.
Synthesize facial expression and text data to provide a cohesive emotional assessment.
Be concise and focus on any mismatches or important nuances.`;

    const userPrompt = `Facial expression detected: ${expressionEmotion} (confidence: ${expressionConfidence}%)
Text analysis detected: ${textEmotion} (sentiment: ${textSentiment}/100)

Provide a brief synthesis: Do these signals align? What's the most accurate emotional picture? Any important nuances?`;

    const result = await Promise.race([
      generateText({
        model: groq("llama3-70b-8192"),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.5,
        maxTokens: 100,
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Groq request timeout")),
          requestTimeout
        )
      ),
    ]);

    if (!result || !result.text) {
      return null;
    }

    return {
      synthesis: result.text.trim(),
      facialSignal: expressionEmotion,
      facialConfidence: expressionConfidence,
      textSignal: textEmotion,
      textSentiment,
      generatedAt: new Date().toISOString(),
      model: MODEL_INFO,
    };
  } catch (error) {
    const errorMsg = error?.message || String(error);
    console.debug(`[Groq] Multi-modal fusion failed: ${errorMsg}`);
    return null;
  }
}

/**
 * Health check endpoint to verify Groq service status
 *
 * @returns {object} Service status information
 */
function getGroqHealthStatus() {
  return {
    enabled: IS_GROQ_ENABLED,
    configured: GROQ_API_KEY !== null,
    model: MODEL_INFO.model,
    provider: MODEL_INFO.provider,
    version: MODEL_INFO.version,
  };
}

module.exports = {
  MODEL_INFO,
  generateEmotionalInsight,
  generateContextualRecommendations,
  fuseFacialAndTextAnalysis,
  getGroqHealthStatus,
  validateGroqSetup,
};
