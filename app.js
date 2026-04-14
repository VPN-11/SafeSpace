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

const emotionRecommendationLibrary = {
  anxiety: [
    { tag: "Anxiety", title: "5-4-3-2-1 grounding", text: "Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste to interrupt anxious spirals." },
    { tag: "Anxiety", title: "Worry container note", text: "Write each worry once, then choose one action now and postpone the rest for later review." },
  ],
  stress: [
    { tag: "Stress", title: "Single-task sprint", text: "Pick one smallest next step and do only that for 12 minutes with all notifications silenced." },
    { tag: "Stress", title: "Body tension reset", text: "Unclench jaw, drop shoulders, and do 30 seconds of slow neck and wrist stretches." },
  ],
  overwhelm: [
    { tag: "Overwhelm", title: "Three-item triage", text: "List everything, then keep only 3 essentials for today and defer the rest guilt-free." },
    { tag: "Overwhelm", title: "Cognitive unload", text: "Speak your thoughts into a quick voice note to release mental load before planning." },
  ],
  sadness: [
    { tag: "Mood", title: "Compassion check-in", text: "Write one kind sentence to yourself exactly like you would support a close friend." },
    { tag: "Mood", title: "Low-energy activation", text: "Do one tiny action: shower, sunlight by window, or a 5-minute walk with no pressure." },
  ],
  fatigue: [
    { tag: "Energy", title: "20-minute recharge", text: "Take a short rest break, hydrate, and avoid screens for a focused nervous-system reset." },
    { tag: "Energy", title: "Energy budgeting", text: "Move one non-urgent task to tomorrow and protect your remaining energy for essentials." },
  ],
  anger: [
    { tag: "Anger", title: "Pause before response", text: "Delay sending messages for 10 minutes, then re-read with a calmer tone and clear ask." },
    { tag: "Anger", title: "Heat discharge walk", text: "Walk briskly for a few minutes to reduce physiological arousal before problem-solving." },
  ],
  fear: [
    { tag: "Fear", title: "Safety anchoring", text: "Name what is safe right now in your environment and what support is currently available." },
    { tag: "Fear", title: "Fact vs story list", text: "Split concerns into facts and assumptions, then act only on confirmed facts first." },
  ],
  joy: [
    { tag: "Joy", title: "Savoring pause", text: "Take 60 seconds to name what is going well so your brain stores this positive state longer." },
    { tag: "Joy", title: "Share the uplift", text: "Send one appreciation message to someone; prosocial moments help sustain positive mood." },
  ],
  hopeful: [
    { tag: "Hope", title: "Momentum plan", text: "Capture one realistic next step for today to keep progress aligned with your hopeful state." },
    { tag: "Hope", title: "Strength reflection", text: "Write one challenge you handled recently and what strength helped you through it." },
  ],
  calm: [
    { tag: "Calm", title: "Protect the baseline", text: "Keep this calm by maintaining one boundary today: breaks, notifications, or workload limits." },
    { tag: "Calm", title: "Quiet focus block", text: "Use a distraction-free 30-minute block to make progress while your mind is settled." },
  ],
  focused: [
    { tag: "Focus", title: "Deep-work block", text: "Run one 45-minute focused session on your highest-impact task, then recover for 10 minutes." },
    { tag: "Focus", title: "Completion cue", text: "Define a clear done-state before you begin so effort turns into visible completion." },
  ],
  neutral: [
    { tag: "Neutral", title: "State check", text: "Pause for one minute and ask whether your body feels tense, tired, or steady right now." },
    { tag: "Neutral", title: "Preventive reset", text: "Take a brief movement and hydration break to prevent gradual stress build-up later." },
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
    "depression",
    "overwhelmed",
    "exhausted",
    "burnout",
    "crying",
    "can't cope",
    "cannot cope",
    "stressed",
    "helpless",
    "suicidal",
    "self harm",
    "empty",
    "numb",
    "broken",
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
    "down",
    "low mood",
    "gloomy",
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
    "happy",
    "joyful",
    "excited",
    "amazing",
    "fantastic",
    "delighted",
    "thrilled",
    "joyous",
    "elated",
    "euphoric",
    "peaceful",
    "confident",
    "content",
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
    keywords: [
      "happy",
      "joy",
      "joyous",
      "excited",
      "good",
      "great",
      "content",
      "glad",
      "delighted",
      "ecstatic",
      "thrilled",
      "elated",
      "euphoric",
      "amazing",
      "fantastic",
    ],
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
    keywords: ["sad", "down", "low", "empty", "lonely", "hurt", "crying", "depressed", "hopeless", "numb", "worthless"],
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

const severeRiskPhrases = [
  "hopeless",
  "worthless",
  "can't cope",
  "cannot cope",
  "unsafe",
  "give up",
  "suicidal",
  "self harm",
  "want to die",
  "don't want to live",
  "end it all",
  "end my life",
];

const emotionKeywordBoosters = {
  calm: ["at peace", "steady", "safe", "composed", "settled"],
  joy: ["joyful", "joyous", "cheerful", "delighted", "thrilled", "elated", "euphoric", "good mood"],
  hopeful: ["hope", "optimistic", "progress", "improving", "encouraged"],
  focused: ["focus", "clarity", "discipline", "productive", "on track"],
  neutral: ["okay", "fine", "alright", "manageable"],
  fatigue: ["sleep deprived", "worn out", "burned out", "no energy", "fatigued"],
  sadness: ["heartbroken", "down", "empty", "tearful", "low mood"],
  anxiety: ["anxiety", "overthinking", "uneasy", "on edge", "panic"],
  stress: ["deadlines", "pressure", "workload", "overloaded", "tense"],
  anger: ["mad", "resentful", "rage", "annoyed", "irritated"],
  fear: ["afraid", "scared", "frightened", "unsafe", "dread"],
  overwhelm: ["too much", "flooded", "out of control", "can't handle", "cannot handle"],
};

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

function normalizeForAnalysis(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countTermHits(normalizedText, terms) {
  if (!normalizedText) {
    return 0;
  }

  return terms.reduce((total, term) => {
    const escaped = escapeRegExp(term.toLowerCase()).replace(/\\ /g, "\\s+");
    const regex = new RegExp(`(^|\\s)${escaped}(?=\\s|$)`, "g");
    const matches = normalizedText.match(regex);
    return total + (matches ? matches.length : 0);
  }, 0);
}

function countIntensifiedTermHits(normalizedText, terms) {
  if (!normalizedText) {
    return 0;
  }

  const intensifiers = ["very", "extremely", "really", "so", "super", "totally", "deeply", "severely"];
  return terms.reduce((total, term) => {
    const escapedTerm = escapeRegExp(term.toLowerCase()).replace(/\\ /g, "\\s+");
    const escapedIntensifiers = intensifiers.map((word) => escapeRegExp(word)).join("|");
    const regex = new RegExp(`(^|\\s)(?:${escapedIntensifiers})\\s+${escapedTerm}(?=\\s|$)`, "g");
    const matches = normalizedText.match(regex);
    return total + (matches ? matches.length : 0);
  }, 0);
}

function countNegatedTermHits(normalizedText, terms) {
  if (!normalizedText) {
    return 0;
  }

  const negators = ["not", "never", "hardly", "barely", "cannot", "can't", "don't", "didn't", "isn't", "wasn't"];
  return terms.reduce((total, term) => {
    const escapedTerm = escapeRegExp(term.toLowerCase()).replace(/\\ /g, "\\s+");
    const escapedNegators = negators.map((word) => escapeRegExp(word)).join("|");
    const regex = new RegExp(`(^|\\s)(?:${escapedNegators})\\s+${escapedTerm}(?=\\s|$)`, "g");
    const matches = normalizedText.match(regex);
    return total + (matches ? matches.length : 0);
  }, 0);
}

function countKeywordHits(normalizedText, keywords) {
  return countTermHits(normalizedText, keywords);
}

function buildTextEmotionSignals(normalizedText) {
  const signals = {};

  emotionModelCatalog.forEach((emotion) => {
    const baseHits = countTermHits(normalizedText, emotion.keywords);
    const boosterHits = countTermHits(normalizedText, emotionKeywordBoosters[emotion.key] || []);
    const score = baseHits * 1.2 + boosterHits * 1.8;
    signals[emotion.key] = Number(score.toFixed(3));
  });

  const signalSum = Object.values(signals).reduce((sum, value) => sum + value, 0);
  if (signalSum < 0.8) {
    signals.neutral = (signals.neutral || 0) + 1.2;
  }

  return signals;
}

function getDominantEmotionKey(emotionSignals) {
  return Object.entries(emotionSignals).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";
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
  if (probability >= 22) {
    return "High";
  }
  if (probability >= 11) {
    return "Moderate";
  }
  return "Low";
}

function buildEmotionSpectrum(normalizedText, analysisResult, expressionScores = null) {
  const facialBlend = buildFacialEmotionBlend(expressionScores || {});
  const entries = emotionModelCatalog.map((emotion) => {
    const keywordHits = countKeywordHits(normalizedText, emotion.keywords);
    const textSignal = analysisResult.emotionSignals?.[emotion.key] || 0;
    let score = 0.12 + keywordHits * 0.85 + textSignal * 2.8;

    if (emotion.valence === "Positive") {
      score += (analysisResult.sentiment / 100) * 1.5;
      score += ((100 - analysisResult.stress) / 100) * 1.1;
    } else if (emotion.valence === "Challenging") {
      score += (analysisResult.stress / 100) * 1.7;
      score += ((100 - analysisResult.sentiment) / 100) * 1.4;
    }

    if (expressionScores) {
      score += (facialBlend[emotion.key] || 0) * 1.9;
    }

    if (emotion.key === analysisResult.primaryEmotionKey) {
      score += 1.25;
    }

    return { ...emotion, rawScore: Math.max(score, 0.05), keywordHits };
  });

  const poweredEntries = entries.map((entry) => ({
    ...entry,
    weightedScore: Math.pow(entry.rawScore, 1.35),
  }));
  const total = poweredEntries.reduce((sum, entry) => sum + entry.weightedScore, 0);

  return poweredEntries.map((entry) => {
    const probability = total > 0 ? (entry.weightedScore / total) * 100 : 0;
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

function buildPersonalizedRecommendations(primaryEmotionKey, risk) {
  const riskKey = risk === "High" ? "high" : risk === "Moderate" ? "medium" : "low";
  const emotionCards = emotionRecommendationLibrary[primaryEmotionKey] || emotionRecommendationLibrary.neutral;
  const riskCards = recommendationLibrary[riskKey] || recommendationLibrary.low;

  const merged = [...emotionCards, ...riskCards];
  const unique = [];
  const seenTitles = new Set();

  merged.forEach((card) => {
    if (!seenTitles.has(card.title) && unique.length < 4) {
      seenTitles.add(card.title);
      unique.push(card);
    }
  });

  return unique;
}

function analyzeText(text) {
  const normalized = normalizeForAnalysis(text);

  if (!normalized) {
    return {
      emotion: "Neutral",
      sentiment: 50,
      stress: 18,
      risk: "Low",
      support: "Gentle check-in",
      response: "A quick emotional check-in will help the assistant tailor calming suggestions.",
      recommendations: buildPersonalizedRecommendations("neutral", "Low"),
      emotionSignals: { neutral: 1.2 },
      primaryEmotionKey: "neutral",
    };
  }

  const emotionSignals = buildTextEmotionSignals(normalized);
  const primaryEmotionKey = getDominantEmotionKey(emotionSignals);
  const primaryEmotionLabel =
    emotionModelCatalog.find((entry) => entry.key === primaryEmotionKey)?.label || "Neutral";

  const negativeTerms = [...distressLexicon.high, ...distressLexicon.medium];
  const positiveTerms = distressLexicon.positive;
  const highHits = countTermHits(normalized, distressLexicon.high);
  const mediumHits = countTermHits(normalized, distressLexicon.medium);
  const positiveHits = countTermHits(normalized, positiveTerms);
  const positiveIntensityHits = countIntensifiedTermHits(normalized, positiveTerms);
  const negativeIntensityHits = countIntensifiedTermHits(normalized, negativeTerms);
  const negatedPositiveHits = countNegatedTermHits(normalized, positiveTerms);
  const negatedNegativeHits = countNegatedTermHits(normalized, negativeTerms);
  const severeHits = countTermHits(normalized, severeRiskPhrases);
  const tokenCount = normalized.split(" ").filter(Boolean).length;
  const positiveSignal =
    positiveHits * 1.7 + positiveIntensityHits * 1.9 + negatedNegativeHits * 1.5 + (emotionSignals.joy || 0) * 0.65;
  const negativeSignal =
    highHits * 2.7 +
    mediumHits * 1.5 +
    negativeIntensityHits * 2.1 +
    negatedPositiveHits * 1.8 +
    severeHits * 2.6 +
    (emotionSignals.sadness || 0) * 0.9 +
    (emotionSignals.anxiety || 0) * 0.8 +
    (emotionSignals.overwhelm || 0) * 0.9;
  const verbosityPressure = clamp(tokenCount / 42, 0, 1.6);

  const sentiment = clamp(
    52 + positiveSignal * 10.5 - negativeSignal * 10.8 + (emotionSignals.hopeful || 0) * 2.4,
    0,
    100
  );
  const stress = clamp(
    12 +
      negativeSignal * 12.8 +
      (emotionSignals.anxiety || 0) * 5.2 +
      (emotionSignals.overwhelm || 0) * 5.6 +
      verbosityPressure * 7.5 -
      positiveSignal * 6.8,
    0,
    100
  );

  let emotion = primaryEmotionLabel;
  let risk = "Low";
  let support = "Gentle check-in";
  let response =
    "You sound fairly steady overall. A small recovery activity can help preserve that sense of calm.";
  let recommendations = recommendationLibrary.low;
  const distressScore = stress * 0.62 + (100 - sentiment) * 0.48 + severeHits * 24;

  // Guardrail: when positive signal clearly dominates and distress is low, avoid neutral fallback.
  if (
    primaryEmotionKey === "neutral" &&
    positiveSignal >= 2.2 &&
    negativeSignal < 1.2 &&
    sentiment >= 65 &&
    stress <= 35
  ) {
    emotion = positiveSignal >= 3.4 ? "Joy" : "Calm";
  }

  if (severeHits >= 1 && (sentiment <= 45 || stress >= 45)) {
    risk = "High";
    support = "Immediate calming support";
    response =
      "Your check-in includes severe distress cues. The interface should prioritize grounding, reduce cognitive load, and clearly prompt immediate human support if you may be unsafe.";
    recommendations = recommendationLibrary.high;
  } else if (distressScore >= 82 || stress >= 78 || sentiment <= 17) {
    risk = "High";
    support = "Immediate calming support";
    response =
      "Your check-in suggests elevated stress and emotional overload. The interface should respond with grounding exercises, low-pressure support, and clear pathways to human help if things feel unsafe.";
    recommendations = recommendationLibrary.high;
  } else if (distressScore >= 48 || stress >= 45 || sentiment <= 45) {
    risk = "Moderate";
    support = "Structured support";
    response =
      "Your words suggest that tension is building. The assistant should acknowledge that clearly, offer practical coping options, and keep the next step simple rather than overwhelming.";
    recommendations = recommendationLibrary.medium;
  } else if (positiveHits > 0 && sentiment >= 64) {
    risk = "Low";
    support = "Mood maintenance";
    response =
      "You appear relatively balanced right now. The best support is to reinforce routines that keep your energy and focus steady.";
    recommendations = recommendationLibrary.low;
  }

  recommendations = buildPersonalizedRecommendations(primaryEmotionKey, risk);

  return {
    emotion,
    sentiment,
    stress,
    risk,
    support,
    response,
    recommendations,
    emotionSignals,
    primaryEmotionKey,
  };
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
  const normalizedText = normalizeForAnalysis(emotionInput.value);
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
