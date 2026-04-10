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

const dominantEmotion = document.getElementById("dominantEmotion");
const sentimentScore = document.getElementById("sentimentScore");
const stressIndex = document.getElementById("stressIndex");
const supportMode = document.getElementById("supportMode");
const recommendationGrid = document.getElementById("recommendationGrid");
const supportResponse = document.getElementById("supportResponse");
const sentimentChart = document.getElementById("sentimentChart");
const sentimentList = document.getElementById("sentimentList");
const expressionOutput = document.getElementById("expressionOutput");
const expressionHint = document.getElementById("expressionHint");

const heroMoodLabel = document.getElementById("heroMoodLabel");
const heroStressScore = document.getElementById("heroStressScore");
const heroSummary = document.getElementById("heroSummary");
const metricSentiment = document.getElementById("metricSentiment");
const metricRisk = document.getElementById("metricRisk");
const draftWordCount = document.getElementById("draftWordCount");
const draftIntensityFill = document.getElementById("draftIntensityFill");
const draftIntensityText = document.getElementById("draftIntensityText");
const draftIntensityMeter = document.getElementById("draftIntensityMeter");
const draftThemes = document.getElementById("draftThemes");
const draftPrompt = document.getElementById("draftPrompt");

const chips = [...document.querySelectorAll(".chip")];

let cameraStream = null;
let faceApiReady = false;
const sentimentHistoryStorageKey = "calmdown-ai-sentiment-history-v1";
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

function loadSentimentHistory() {
  try {
    const saved = localStorage.getItem(sentimentHistoryStorageKey);
    const parsed = saved ? JSON.parse(saved) : null;

    if (Array.isArray(parsed) && parsed.length) {
      return parsed
        .filter(
          (entry) =>
            entry &&
            typeof entry.sentiment === "number" &&
            typeof entry.stress === "number" &&
            typeof entry.timestamp === "number"
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

function formatEntryLabel(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function renderSentimentTrend() {
  if (!sentimentChart || !sentimentList) {
    return;
  }

  if (!sentimentHistory.length) {
    sentimentChart.innerHTML =
      '<div class="sentiment-empty">No entries yet. Analyze a check-in to build your personal sentiment trend.</div>';
    sentimentList.innerHTML = "";
    return;
  }

  const chartWidth = 560;
  const chartHeight = 210;
  const leftPad = 36;
  const rightPad = 16;
  const topPad = 16;
  const bottomPad = 24;
  const innerWidth = chartWidth - leftPad - rightPad;
  const innerHeight = chartHeight - topPad - bottomPad;
  const maxIndex = Math.max(sentimentHistory.length - 1, 1);

  const points = sentimentHistory
    .map((entry, index) => {
      const x = leftPad + (innerWidth * index) / maxIndex;
      const y = topPad + ((100 - entry.sentiment) / 100) * innerHeight;
      return { x, y, entry };
    })
    .filter(Boolean);

  const pointPath = points.map((point) => `${point.x},${point.y}`).join(" ");
  const horizontalGuides = [0, 25, 50, 75, 100]
    .map((score) => {
      const y = topPad + ((100 - score) / 100) * innerHeight;
      return `<line x1="${leftPad}" y1="${y}" x2="${chartWidth - rightPad}" y2="${y}" stroke="rgba(61,44,24,0.14)" stroke-width="1" />`;
    })
    .join("");

  const dots = points
    .map(
      (point) =>
        `<circle cx="${point.x}" cy="${point.y}" r="4" fill="#ca6d3f"><title>Sentiment ${Math.round(
          point.entry.sentiment
        )}/100</title></circle>`
    )
    .join("");

  sentimentChart.innerHTML = `
    <svg viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="Sentiment trend for last five entries">
      ${horizontalGuides}
      <polyline fill="none" stroke="rgba(50,124,116,0.9)" stroke-width="3" points="${pointPath}" />
      ${dots}
    </svg>
  `;

  sentimentList.innerHTML = sentimentHistory
    .map(
      (entry) => `
        <article class="sentiment-item">
          <strong>${Math.round(entry.sentiment)} / 100</strong>
          <span>${formatEntryLabel(entry.timestamp)}</span>
        </article>
      `
    )
    .join("");
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

function updateDraftAssistant(text) {
  if (!draftWordCount) {
    return;
  }

  const normalized = text.trim().toLowerCase();
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentenceCount = text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length;

  const highMatches = distressLexicon.high.filter((term) => normalized.includes(term));
  const mediumMatches = distressLexicon.medium.filter((term) => normalized.includes(term));
  const positiveMatches = distressLexicon.positive.filter((term) => normalized.includes(term));

  const uniqueThemes = [...new Set([...highMatches, ...mediumMatches, ...positiveMatches])];
  const intensity = clamp(
    highMatches.length * 18 + mediumMatches.length * 10 - positiveMatches.length * 6 + wordCount * 0.6,
    0,
    100
  );

  draftWordCount.textContent = `${wordCount} words`;
  draftIntensityFill.style.width = `${intensity}%`;
  draftIntensityMeter.setAttribute("aria-valuenow", String(Math.round(intensity)));

  draftIntensityText.textContent =
    intensity >= 70 ? "High emotional load" : intensity >= 40 ? "Moderate emotional load" : "Low signal";

  if (!normalized) {
    draftThemes.innerHTML = '<span class="theme-pill">Waiting for input</span>';
    draftPrompt.textContent =
      "Tip: mention what triggered the emotion and how long you've felt this way for better AI support guidance.";
    return;
  }

  draftThemes.innerHTML = uniqueThemes.length
    ? uniqueThemes
        .slice(0, 5)
        .map((theme) => `<span class="theme-pill">${titleCase(theme)}</span>`)
        .join("")
    : '<span class="theme-pill">No clear keywords yet</span>';

  if (sentenceCount < 2) {
    draftPrompt.textContent =
      "Suggestion: add 1 more sentence about what triggered this feeling so the support plan can be more accurate.";
  } else if (!normalized.includes("today") && !normalized.includes("week") && !normalized.includes("days")) {
    draftPrompt.textContent =
      "Suggestion: mention timeframe (today, this week, past few days) to improve trend tracking.";
  } else if (highMatches.length > 0) {
    draftPrompt.textContent =
      "Suggestion: include one grounding action you can try now (breathing, short walk, hydration) for immediate relief.";
  } else {
    draftPrompt.textContent =
      "Great detail level. You can now run analysis for sentiment, stress index, and personalized support recommendations.";
  }
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
  updateDraftAssistant(emotionInput.value);
  const result = analyzeText(emotionInput.value);

  dominantEmotion.textContent = result.emotion;
  sentimentScore.textContent = `${Math.round(result.sentiment)} / 100`;
  stressIndex.textContent = `${Math.round(result.stress)} / 100`;
  supportMode.textContent = result.support;
  supportResponse.textContent = result.response;

  if (shouldTrack && emotionInput.value.trim()) {
    sentimentHistory.push({
      timestamp: Date.now(),
      sentiment: Math.round(result.sentiment),
      stress: Math.round(result.stress),
    });
    while (sentimentHistory.length > 5) {
      sentimentHistory.shift();
    }
    saveSentimentHistory();
  }

  renderSentimentTrend();
  renderRecommendations(result.recommendations);
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
emotionInput.addEventListener("input", () => {
  updateDraftAssistant(emotionInput.value);
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    emotionInput.value = chip.dataset.text || "";
    applyAnalysis(expressionOutput.textContent, true);
  });
});

renderSentimentTrend();
renderRecommendations(recommendationLibrary.low);
updateDraftAssistant(emotionInput.value);
applyAnalysis();
