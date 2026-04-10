const emotionInput = document.getElementById("emotionInput");
const analyzeButton = document.getElementById("analyzeButton");
const demoFillButton = document.getElementById("demoFillButton");
const startCameraButton = document.getElementById("startCameraButton");
const stopCameraButton = document.getElementById("stopCameraButton");
const captureButton = document.getElementById("captureButton");
const toggleCameraButton = document.getElementById("toggleCameraButton");
const webcamVideo = document.getElementById("webcamVideo");
const cameraStatus = document.getElementById("cameraStatus");
const cameraMessage = document.getElementById("cameraMessage");
const breathingExerciseButton = document.getElementById("breathingExerciseButton");
const breathingPanel = document.getElementById("breathingPanel");
const closeBreathingButton = document.getElementById("closeBreathingButton");
const breathingText = document.getElementById("breathingText");


const dominantEmotion = document.getElementById("dominantEmotion");
const sentimentScore = document.getElementById("sentimentScore");
const stressIndex = document.getElementById("stressIndex");
const supportMode = document.getElementById("supportMode");
const recommendationGrid = document.getElementById("recommendationGrid");
const supportResponse = document.getElementById("supportResponse");
const moodBars = document.getElementById("moodBars");
const moodTrendMeta = document.getElementById("moodTrendMeta");
const expressionOutput = document.getElementById("expressionOutput");
const expressionHint = document.getElementById("expressionHint");
const expressionConfidenceList = document.getElementById("expressionConfidenceList");
const confidenceSignalStatus = document.getElementById("confidenceSignalStatus");
const expressionReliabilityScore = document.getElementById("expressionReliabilityScore");
const expressionReliabilityNote = document.getElementById("expressionReliabilityNote");
const emotionSpectrumList = document.getElementById("emotionSpectrumList");
const emotionModelStatus = document.getElementById("emotionModelStatus");
const emotionSpectrumNote = document.getElementById("emotionSpectrumNote");

const heroMoodLabel = document.getElementById("heroMoodLabel");
const heroStressScore = document.getElementById("heroStressScore");
const heroSummary = document.getElementById("heroSummary");
const metricSentiment = document.getElementById("metricSentiment");
const metricRisk = document.getElementById("metricRisk");

const chips = [...document.querySelectorAll(".chip")];

let cameraStream = null;
let faceApiReady = false;
let latestExpressionScores = null;
const sentimentHistoryStorageKey = "calmdown-ai-sentiment-history-v2";
const sentimentHistory = loadSentimentHistory();

const recommendationLibrary = {
  high: [
    {
      tag: "Breathing",
      title: "4-6 calming breath cycle",
      text: "Inhale for 4 seconds, exhale for 6 seconds, and repeat for 3 minutes to lower physical tension.",
    },
    {
      tag: "Music",
      title: "Lo-fi or soft piano focus mix",
      text: "Choose slow instrumental music with low intensity to reduce overstimulation during anxious moments.",
    },
    {
      tag: "Reading",
      title: "Gentle reflective book",
      text: "Try a comforting, low-pressure read such as short essays or reflective fiction that does not demand heavy focus.",
    },
    {
      tag: "Reset",
      title: "Screen-off recovery routine",
      text: "Step away for 10 minutes, hydrate, stretch your shoulders, and look away from your devices before returning to work.",
    },
  ],
  medium: [
    {
      tag: "Routine",
      title: "Structured micro-break plan",
      text: "Use a 25-minute focus block followed by a 5-minute reset with breathing or a short walk.",
    },
    {
      tag: "Audio",
      title: "Nature or ambient playlist",
      text: "Rain sounds, ocean ambience, or acoustic playlists can make concentration feel less strained.",
    },
    {
      tag: "Movies",
      title: "Lighthearted comfort watch",
      text: "Pick a familiar feel-good movie or series episode that feels emotionally safe and relaxing.",
    },
    {
      tag: "Mindset",
      title: "Thought download journal",
      text: "Write down worries in short bullet points, then circle only the ones that need action today.",
    },
  ],
  low: [
    {
      tag: "Balance",
      title: "Mood maintenance walk",
      text: "A short outdoor walk with no notifications can help preserve calm and prevent stress build-up.",
    },
    {
      tag: "Focus",
      title: "Positive playlist rotation",
      text: "Keep a small personal playlist of grounding songs ready for transitions between work and rest.",
    },
    {
      tag: "Reading",
      title: "Inspirational short read",
      text: "Choose uplifting articles or a few pages of a meaningful book to maintain emotional steadiness.",
    },
    {
      tag: "Care",
      title: "Daily gratitude prompt",
      text: "Write one thing that felt difficult and one thing that still went well today to keep perspective balanced.",
    },
  ],
};

const distressLexicon = {
  high: [
    "anxious",
    "panic",
    "worthless",
    "hopeless",
    "alone",
    "depressed",
    "overwhelmed",
    "exhausted",
    "burnout",
    "crying",
    "can't cope",
    "cannot cope",
    "stressed",
    "helpless",
  ],
  medium: [
    "tired",
    "worried",
    "pressure",
    "upset",
    "restless",
    "nervous",
    "drained",
    "confused",
    "frustrated",
    "sad",
  ],
  positive: [
    "hopeful",
    "calm",
    "grateful",
    "better",
    "relieved",
    "focused",
    "supported",
    "okay",
  ],
};

const emotionModelCatalog = [
  {
    key: "calm",
    label: "Calm",
    valence: "Positive",
    energy: "Low",
    keywords: ["calm", "settled", "peaceful", "grounded", "steady", "relaxed"],
  },
  {
    key: "joy",
    label: "Joy",
    valence: "Positive",
    energy: "Medium",
    keywords: ["happy", "joy", "excited", "good", "great", "content", "glad"],
  },
  {
    key: "hopeful",
    label: "Hopeful",
    valence: "Positive",
    energy: "Medium",
    keywords: ["hopeful", "optimistic", "better", "improving", "motivated", "confident"],
  },
  {
    key: "focused",
    label: "Focused",
    valence: "Positive",
    energy: "Medium",
    keywords: ["focused", "productive", "clear", "organized", "present", "engaged"],
  },
  {
    key: "neutral",
    label: "Neutral",
    valence: "Neutral",
    energy: "Medium",
    keywords: ["okay", "fine", "normal", "neutral", "manageable"],
  },
  {
    key: "fatigue",
    label: "Fatigue",
    valence: "Challenging",
    energy: "Low",
    keywords: ["tired", "drained", "exhausted", "sleepy", "fatigue", "low energy"],
  },
  {
    key: "sadness",
    label: "Sadness",
    valence: "Challenging",
    energy: "Low",
    keywords: ["sad", "down", "low", "empty", "lonely", "hurt", "crying"],
  },
  {
    key: "anxiety",
    label: "Anxiety",
    valence: "Challenging",
    energy: "High",
    keywords: ["anxious", "worried", "nervous", "restless", "uneasy", "panic"],
  },
  {
    key: "stress",
    label: "Stress",
    valence: "Challenging",
    energy: "High",
    keywords: ["stressed", "pressure", "deadline", "tense", "strained", "burnout"],
  },
  {
    key: "anger",
    label: "Anger",
    valence: "Challenging",
    energy: "High",
    keywords: ["angry", "frustrated", "irritated", "annoyed", "furious", "upset"],
  },
  {
    key: "fear",
    label: "Fear",
    valence: "Challenging",
    energy: "High",
    keywords: ["fear", "afraid", "scared", "unsafe", "helpless", "terrified"],
  },
  {
    key: "overwhelm",
    label: "Overwhelm",
    valence: "Challenging",
    energy: "High",
    keywords: ["overwhelmed", "can't cope", "cannot cope", "too much", "stuck", "flooded"],
  },
];

function loadSentimentHistory() {
  try {
    const saved = localStorage.getItem(sentimentHistoryStorageKey);
    const parsed = saved ? JSON.parse(saved) : null;
    if (Array.isArray(parsed)) {
      return parsed
        .filter(
          (entry) =>
            typeof entry?.sentiment === "number" &&
            typeof entry?.emotion === "string" &&
            typeof entry?.createdAt === "string"
        )
        .slice(-5);
    }
  } catch (error) {
    console.error("Sentiment history could not be restored:", error);
  }
  return [];
}

function saveSentimentHistory() {
  try {
    localStorage.setItem(sentimentHistoryStorageKey, JSON.stringify(sentimentHistory));
  } catch (error) {
    console.error("Sentiment history could not be saved:", error);
  }
}

function formatEntryTime(isoString) {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) {
    return "Recent";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function sanitizeText(text) {
  return (text || "").replace(/[&<>"']/g, (char) => {
    const replacements = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return replacements[char] || char;
  });
}

function renderSentimentTrend() {
  if (!sentimentHistory.length) {
    moodBars.innerHTML = `
      <div class="trend-placeholder">
        No entries yet. Add a check-in to build your real sentiment trend.
      </div>
    `;
    moodTrendMeta.innerHTML = "";
    return;
  }

  const width = 760;
  const height = 230;
  const padding = { top: 18, right: 16, bottom: 36, left: 40 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxIndex = Math.max(sentimentHistory.length - 1, 1);

  const points = sentimentHistory.map((entry, index) => {
    const x = padding.left + (index / maxIndex) * plotWidth;
    const y = padding.top + ((100 - entry.sentiment) / 100) * plotHeight;
    return { x, y, entry, index };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${(
    height - padding.bottom
  ).toFixed(2)} L ${points[0].x.toFixed(2)} ${(height - padding.bottom).toFixed(2)} Z`;

  const yTicks = [0, 25, 50, 75, 100];
  moodBars.innerHTML = `
    <svg class="trend-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Sentiment trend for last 5 entries">
      ${yTicks
        .map((tick) => {
          const y = padding.top + ((100 - tick) / 100) * plotHeight;
          return `
            <line class="trend-grid" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"></line>
            <text class="trend-y-label" x="${padding.left - 8}" y="${y + 4}" text-anchor="end">${tick}</text>
          `;
        })
        .join("")}
      <path class="trend-area" d="${areaPath}"></path>
      <path class="trend-line" d="${linePath}"></path>
      ${points
        .map(
          (point) => `
            <circle class="trend-dot" cx="${point.x}" cy="${point.y}" r="4.5"></circle>
            <text class="trend-x-label" x="${point.x}" y="${height - 12}" text-anchor="middle">E${point.index + 1}</text>
          `
        )
        .join("")}
    </svg>
  `;

  moodTrendMeta.innerHTML = sentimentHistory
    .map(
      (entry, index) => `
        <article class="trend-meta-row">
          <span class="trend-entry-label">Entry ${index + 1} - ${sanitizeText(formatEntryTime(entry.createdAt))}</span>
          <strong class="trend-emotion">${sanitizeText(entry.emotion)}</strong>
          <span class="trend-score">${Math.round(entry.sentiment)} / 100</span>
          <span class="trend-preview">${sanitizeText(entry.preview)}</span>
        </article>
      `
    )
    .join("");
}

function trackSentimentEntry(analysisResult, rawText) {
  const trimmedText = rawText.trim();
  sentimentHistory.push({
    sentiment: Math.round(analysisResult.sentiment),
    emotion: analysisResult.emotion,
    createdAt: new Date().toISOString(),
    preview: trimmedText ? trimmedText.slice(0, 70) : "Quick check-in",
  });

  while (sentimentHistory.length > 5) {
    sentimentHistory.shift();
  }
  saveSentimentHistory();
}

function getConfidenceInsight(label, score) {
  if (score >= 75) {
    return `Strong confidence for ${label}. This is a stable facial signal for the current frame.`;
  }
  if (score >= 50) {
    return `Moderate confidence for ${label}. Capturing another frame can improve reliability.`;
  }
  return `Low confidence. Try better lighting, front-facing pose, and a steady camera for clearer expression detection.`;
}

function renderExpressionConfidence(expressions = null, source = "none") {
  const keys = ["neutral", "happy", "sad", "angry", "fearful", "disgusted", "surprised"];
  const normalized = keys.map((key) => ({ key, value: expressions?.[key] || 0 }));
  const sorted = [...normalized].sort((a, b) => b.value - a.value);
  const dominant = sorted[0];
  const second = sorted[1] || { value: 0 };
  const topPercent = Math.round(dominant.value * 100);
  const marginPercent = Math.round((dominant.value - second.value) * 100);
  const reliability = clamp(Math.round(topPercent * 0.72 + Math.max(marginPercent, 0) * 0.28), 0, 100);

  expressionConfidenceList.innerHTML = normalized
    .map(
      (item) => `
        <div class="confidence-row">
          <label>${titleCase(item.key)}</label>
          <div class="confidence-track">
            <div class="confidence-fill" style="width: ${Math.round(item.value * 100)}%;"></div>
          </div>
          <span class="confidence-value">${Math.round(item.value * 100)}%</span>
        </div>
      `
    )
    .join("");

  confidenceSignalStatus.textContent =
    source === "live" ? "Live model signal" : source === "demo" ? "Demo signal" : "Awaiting capture";
  expressionReliabilityScore.textContent = `${reliability} / 100`;
  expressionReliabilityNote.textContent =
    source === "none"
      ? "Start camera and capture expression to evaluate confidence across all facial emotions."
      : getConfidenceInsight(titleCase(dominant.key), reliability);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function titleCase(value) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function countKeywordHits(normalizedText, keywords) {
  return keywords.reduce((total, keyword) => (normalizedText.includes(keyword) ? total + 1 : total), 0);
}

function buildFacialEmotionBlend(expressionScores = {}) {
  const neutral = expressionScores.neutral || 0;
  const happy = expressionScores.happy || 0;
  const sad = expressionScores.sad || 0;
  const angry = expressionScores.angry || 0;
  const fearful = expressionScores.fearful || 0;
  const surprised = expressionScores.surprised || 0;
  const disgusted = expressionScores.disgusted || 0;

  return {
    calm: neutral * 0.55 + happy * 0.2,
    joy: happy * 0.9 + surprised * 0.2,
    hopeful: happy * 0.5 + neutral * 0.2 + surprised * 0.2,
    focused: neutral * 0.5 + happy * 0.2,
    neutral: neutral * 0.95,
    fatigue: sad * 0.45 + neutral * 0.2,
    sadness: sad * 0.95,
    anxiety: fearful * 0.75 + surprised * 0.35,
    stress: fearful * 0.45 + angry * 0.35 + neutral * 0.2,
    anger: angry * 0.95 + disgusted * 0.35,
    fear: fearful * 0.95,
    overwhelm: fearful * 0.4 + surprised * 0.3 + sad * 0.2 + angry * 0.2,
  };
}

function getIntensityLabel(probability) {
  if (probability >= 18) {
    return "High";
  }
  if (probability >= 10) {
    return "Moderate";
  }
  return "Low";
}

function buildEmotionSpectrum(normalizedText, analysisResult, expressionScores = null) {
  const facialBlend = buildFacialEmotionBlend(expressionScores || {});
  const entries = emotionModelCatalog.map((emotion) => {
    const keywordHits = countKeywordHits(normalizedText, emotion.keywords);
    let score = 2 + keywordHits * 8;

    if (emotion.key === "neutral") {
      score += 18;
    }

    if (emotion.valence === "Positive") {
      score += analysisResult.sentiment * 0.08;
      score += (100 - analysisResult.stress) * 0.04;
    } else if (emotion.valence === "Challenging") {
      score += analysisResult.stress * 0.06;
      score += (100 - analysisResult.sentiment) * 0.04;
    }

    if (expressionScores) {
      score += (facialBlend[emotion.key] || 0) * 35;
    }

    return { ...emotion, rawScore: Math.max(score, 0.6), keywordHits };
  });

  const total = entries.reduce((sum, entry) => sum + entry.rawScore, 0);

  return entries.map((entry) => {
    const probability = total > 0 ? (entry.rawScore / total) * 100 : 0;
    return {
      ...entry,
      probability: Number(probability.toFixed(1)),
      intensity: getIntensityLabel(probability),
      signal:
        entry.keywordHits > 0 && expressionScores
          ? "Text + face"
          : entry.keywordHits > 0
            ? "Text"
            : expressionScores
              ? "Face + baseline"
              : "Baseline",
    };
  });
}

function renderEmotionSpectrum(spectrum, hasFaceSignal) {
  emotionSpectrumList.innerHTML = spectrum
    .map(
      (emotion) => `
        <article class="emotion-row">
          <div class="emotion-row-head">
            <strong>${emotion.label}</strong>
            <span>${emotion.probability}%</span>
          </div>
          <div class="emotion-bar">
            <div class="emotion-bar-fill" style="width: ${emotion.probability}%;"></div>
          </div>
          <div class="emotion-row-meta">
            ${emotion.intensity} intensity | ${emotion.valence} valence | ${emotion.energy} energy | ${emotion.signal}
          </div>
        </article>
      `
    )
    .join("");

  emotionModelStatus.textContent = hasFaceSignal ? "Text + face signals" : "Text signal only";
  emotionSpectrumNote.textContent = hasFaceSignal
    ? "Probabilities blend linguistic cues with detected facial expressions."
    : "Probabilities currently use text and baseline priors. Start camera + capture for multimodal tracking.";
}

function analyzeText(text) {
  const normalized = text.trim().toLowerCase();

  if (!normalized) {
    return {
      emotion: "Neutral",
      sentiment: 50,
      stress: 18,
      risk: "Low",
      support: "Gentle check-in",
      response: "A quick emotional check-in will help the assistant tailor calming suggestions.",
      recommendations: recommendationLibrary.low,
    };
  }

  let sentiment = 50;
  let stress = 25;
  let highHits = 0;
  let mediumHits = 0;
  let positiveHits = 0;

  distressLexicon.high.forEach((term) => {
    if (normalized.includes(term)) {
      highHits += 1;
    }
  });

  distressLexicon.medium.forEach((term) => {
    if (normalized.includes(term)) {
      mediumHits += 1;
    }
  });

  distressLexicon.positive.forEach((term) => {
    if (normalized.includes(term)) {
      positiveHits += 1;
    }
  });

  sentiment = clamp(50 - highHits * 16 - mediumHits * 8 + positiveHits * 10, 0, 100);
  stress = clamp(25 + highHits * 18 + mediumHits * 9 - positiveHits * 6 + normalized.length / 18, 0, 100);

  let emotion = "Reflective";
  let risk = "Low";
  let support = "Gentle check-in";
  let response =
    "You sound fairly steady overall. A small recovery activity can help preserve that sense of calm.";
  let recommendations = recommendationLibrary.low;

  if (stress >= 70 || sentiment <= 20) {
    emotion = "High Distress";
    risk = "High";
    support = "Immediate calming support";
    response =
      "Your check-in suggests elevated stress and emotional overload. The interface should respond with grounding exercises, low-pressure support, and clear pathways to human help if things feel unsafe.";
    recommendations = recommendationLibrary.high;
  } else if (stress >= 45 || sentiment <= 45) {
    emotion = "Strained";
    risk = "Moderate";
    support = "Structured support";
    response =
      "Your words suggest that tension is building. The assistant should acknowledge that clearly, offer practical coping options, and keep the next step simple rather than overwhelming.";
    recommendations = recommendationLibrary.medium;
  } else if (positiveHits > 0) {
    emotion = "Stable";
    risk = "Low";
    support = "Mood maintenance";
    response =
      "You appear relatively balanced right now. The best support is to reinforce routines that keep your energy and focus steady.";
    recommendations = recommendationLibrary.low;
  }

  return { emotion, sentiment, stress, risk, support, response, recommendations };
}

function renderRecommendations(cards) {
  recommendationGrid.innerHTML = cards
    .map(
      (item) => `
        <article class="recommendation-card">
          <span class="tag">${item.tag}</span>
          <strong>${item.title}</strong>
          <p>${item.text}</p>
        </article>
      `
    )
    .join("");
}

function updateHero(result, expressionLabel) {
  heroMoodLabel.textContent = result.emotion;
  heroStressScore.textContent = `${Math.round(result.stress)}%`;
  heroSummary.textContent = `${result.response} Facial cue: ${expressionLabel}.`;
  metricSentiment.textContent =
    result.sentiment >= 60 ? "Positive" : result.sentiment >= 35 ? "Mixed" : "Negative";
  metricRisk.textContent = result.risk;
}

function applyAnalysis(expressionLabel = "Not captured yet", shouldTrack = false) {
  const normalizedText = emotionInput.value.trim().toLowerCase();
  const result = analyzeText(emotionInput.value);
  const emotionSpectrum = buildEmotionSpectrum(normalizedText, result, latestExpressionScores);

  dominantEmotion.textContent = result.emotion;
  sentimentScore.textContent = `${Math.round(result.sentiment)} / 100`;
  stressIndex.textContent = `${Math.round(result.stress)} / 100`;
  supportMode.textContent = result.support;
  supportResponse.textContent = result.response;

  if (shouldTrack) {
    trackSentimentEntry(result, emotionInput.value);
  }

  renderSentimentTrend();
  renderRecommendations(result.recommendations);
  renderEmotionSpectrum(emotionSpectrum, Boolean(latestExpressionScores));
  updateHero(result, expressionLabel);
}

async function loadFaceApiModels() {
  if (!window.faceapi) {
    expressionHint.textContent =
      "Face expression library not loaded. The UI still supports webcam capture and backend integration.";
    return false;
  }

  try {
    const modelBase = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
    await Promise.all([
      window.faceapi.nets.tinyFaceDetector.loadFromUri(modelBase),
      window.faceapi.nets.faceExpressionNet.loadFromUri(modelBase),
    ]);
    faceApiReady = true;
    expressionHint.textContent =
      "Expression model loaded. Capture a frame to estimate calm, happy, neutral, sad, or fearful cues.";
    return true;
  } catch (error) {
    console.error("Face model failed to load:", error);
    expressionHint.textContent =
      "Webcam works, but the face emotion model could not load. Hook this UI to your preferred browser model or API.";
    return false;
  }
}

async function startCamera() {
  if (cameraStream) {
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    webcamVideo.srcObject = cameraStream;
    cameraStatus.textContent = "Camera on";
    cameraMessage.textContent = "Camera is live. Capture a frame to estimate facial emotion cues.";
    await loadFaceApiModels();
  } catch (error) {
    console.error("Camera access failed:", error);
    cameraStatus.textContent = "Camera blocked";
    cameraMessage.textContent =
      "Camera permission was denied or is unavailable. The rest of the emotional support flow still works without it.";
  }
}

function stopCamera() {
  if (!cameraStream) {
    return;
  }

  cameraStream.getTracks().forEach((track) => track.stop());
  webcamVideo.srcObject = null;
  cameraStream = null;
  cameraStatus.textContent = "Camera off";
  cameraMessage.textContent = "Turn on the camera so the frontend can estimate facial emotion cues.";
  renderExpressionConfidence(null, "none");
}

async function detectExpression() {
  if (!cameraStream) {
    expressionOutput.textContent = "Start camera first";
    return;
  }

  if (faceApiReady && window.faceapi) {
    try {
      const detection = await window.faceapi
        .detectSingleFace(webcamVideo, new window.faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detection?.expressions) {
        latestExpressionScores = detection.expressions;
        renderExpressionConfidence(detection.expressions, "live");
        const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
        const [label, confidence] = sorted[0];
        const prettyLabel = `${titleCase(label)} (${Math.round(confidence * 100)}%)`;
        expressionOutput.textContent = prettyLabel;
        applyAnalysis(prettyLabel, true);
        return;
      }
    } catch (error) {
      console.error("Expression detection failed:", error);
    }
  }

  const fallbackExpressions = ["Neutral", "Slightly tense", "Calm", "Low energy", "Focused"];
  const picked = fallbackExpressions[Math.floor(Math.random() * fallbackExpressions.length)];
  const fallbackExpressionMap = {
    Neutral: { neutral: 0.72, happy: 0.1, sad: 0.06, fearful: 0.04, angry: 0.04, surprised: 0.02, disgusted: 0.02 },
    "Slightly tense": {
      neutral: 0.3,
      happy: 0.04,
      sad: 0.14,
      fearful: 0.26,
      angry: 0.14,
      surprised: 0.08,
      disgusted: 0.04,
    },
    Calm: { neutral: 0.52, happy: 0.34, sad: 0.04, fearful: 0.03, angry: 0.03, surprised: 0.02, disgusted: 0.02 },
    "Low energy": {
      neutral: 0.34,
      happy: 0.05,
      sad: 0.42,
      fearful: 0.08,
      angry: 0.05,
      surprised: 0.03,
      disgusted: 0.03,
    },
    Focused: { neutral: 0.66, happy: 0.16, sad: 0.05, fearful: 0.03, angry: 0.04, surprised: 0.04, disgusted: 0.02 },
  };
  latestExpressionScores = fallbackExpressionMap[picked] || null;
  renderExpressionConfidence(latestExpressionScores, "demo");
  expressionOutput.textContent = `${picked} (demo estimate)`;
  expressionHint.textContent =
    "Showing a demo estimate because no live face expression result was returned. Replace this with your production facial model.";
  applyAnalysis(`${picked} (demo estimate)`, true);
}

demoFillButton.addEventListener("click", () => {
  emotionInput.value =
    "I have been feeling overwhelmed with classes and deadlines. I am tired, anxious, and finding it hard to switch off my thoughts at night.";
  applyAnalysis(expressionOutput.textContent, true);
});

analyzeButton.addEventListener("click", () => {
  applyAnalysis(expressionOutput.textContent, true);
});

startCameraButton.addEventListener("click", startCamera);
toggleCameraButton.addEventListener("click", startCamera);
stopCameraButton.addEventListener("click", stopCamera);
captureButton.addEventListener("click", detectExpression);
breathingExerciseButton.addEventListener("click", startBreathingExercise);
closeBreathingButton.addEventListener("click", closeBreathingExercise);

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    emotionInput.value = chip.dataset.text || "";
    applyAnalysis(expressionOutput.textContent, true);
  });
});
let breathingInterval = null;

function startBreathingExercise() {
  breathingPanel.classList.remove("hidden");
  let inhale = true;
  breathingText.textContent = "Breathe In";

  breathingInterval = setInterval(() => {
    inhale = !inhale;
    breathingText.textContent = inhale ? "Breathe In" : "Breathe Out";
  }, 4000);
}

function closeBreathingExercise() {
  breathingPanel.classList.add("hidden");
  clearInterval(breathingInterval);
}

renderSentimentTrend();
renderRecommendations(recommendationLibrary.low);
renderExpressionConfidence(null, "none");
applyAnalysis();

