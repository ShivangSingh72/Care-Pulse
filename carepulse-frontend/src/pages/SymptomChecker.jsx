import { useState } from "react";
import "../styles/symptomChecker.css";
import "../styles/symptomDashboard.css";
import Badge from "../components/Badge";
import StatusBanner from "../components/StatusBanner";
import { predictDisease } from "../api/diseaseApi";
import { ApiError } from "../api/client";
import {
  getInitials,
  hasPatientProfile,
} from "../utils/patientprofile";
import {
  getCarePlan,
  calculateCarePlanAdherence,
} from "../utils/carePlanStorage";
import { getWellbeingScore } from "../utils/wellbeingStorage";

const SYMPTOM_GROUPS = {
  Respiratory: [
    "cough",
    "shortness of breath",
    "wheezing",
    "chest pain",
    "sore throat",
    "congestion",
  ],
  Systemic: [
    "fever",
    "fatigue",
    "chills",
    "sweating",
    "weight loss",
    "loss of appetite",
  ],
  "Pain & ache": [
    "headache",
    "muscle pain",
    "joint pain",
    "back pain",
    "abdominal pain",
  ],
  Neurological: [
    "dizziness",
    "blurred vision",
    "confusion",
    "tingling",
    "numbness",
  ],
};

const CATEGORY_NAMES = ["All", ...Object.keys(SYMPTOM_GROUPS)];

const COMMON_SYMPTOMS = [
  "cough",
  "shortness of breath",
  "wheezing",
  "chest pain",
  "sore throat",
  "congestion",
  "fever",
];

function extractKnownSymptoms(text) {
  const normalized = text.toLowerCase();

  return Object.values(SYMPTOM_GROUPS)
    .flat()
    .filter((symptom) => normalized.includes(symptom));
}

function sentenceCase(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* =========================================================
   Small UI icons (presentation only)
   ========================================================= */

function SearchIcon() {
  return (
    <svg
      className="symptom-search-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg
      className="symptom-chip-icon"
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      className="symptom-chip-icon"
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8.2 12.3 2.5 2.5 5-5.2" />
    </svg>
  );
}

/* =========================================================
   Metric helpers
   ========================================================= */

/* Returns a positive number, or null when nothing usable was entered. */
function parseMetric(value) {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const numeric = Number(value);

  return Number.isFinite(numeric) && numeric > 0
    ? numeric
    : null;
}

function clampPercent(value) {
  return Math.min(100, Math.max(0, value));
}

/* General reference range: 95% and above is normal. */
function getSpo2Status(spo2) {
  if (spo2 === null) {
    return { tone: "neutral", text: "Not entered" };
  }

  if (spo2 >= 95) {
    return { tone: "success", text: "Within normal range" };
  }

  if (spo2 >= 90) {
    return { tone: "attention", text: "Below normal range" };
  }

  return { tone: "critical", text: "Low — seek medical help" };
}

/* Adult resting range (60-100 bpm). Not applied to minors. */
function getHeartRateStatus(heartRate, age) {
  if (heartRate === null) {
    return { tone: "neutral", text: "Not entered" };
  }

  const ageValue = parseMetric(age);

  if (ageValue !== null && ageValue < 18) {
    return { tone: "accent", text: "Recorded value" };
  }

  if (heartRate < 60) {
    return { tone: "attention", text: "Below resting range" };
  }

  if (heartRate > 100) {
    return { tone: "attention", text: "Above resting range" };
  }

  return { tone: "success", text: "Within resting range" };
}

/* =========================================================
   Patient information (read-only)
   Editing happens through the account icon in the header.
   ========================================================= */

function PatientInformation({ profile }) {
  const hasProfile = hasPatientProfile(profile);
  const name = profile?.name?.trim();
  const initials = getInitials(profile?.name);
  const condition = profile?.disease?.trim();

  const demographics = [
    profile?.age ? `${profile.age} yrs` : "",
    profile?.gender || "",
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <section
      className="patient-card"
      aria-label="Patient information"
    >

      <div className="patient-card-avatar">
        {initials || "—"}
      </div>

      <div className="patient-card-body">

        <p className="section-eyebrow">
          PATIENT INFORMATION
        </p>

        <div className="patient-card-name-row">

          <h2>
            {name ||
              (hasProfile
                ? "Unnamed patient"
                : "No patient profile yet")}
          </h2>

          {profile?.patientId && (
            <span className="patient-chip">
              #{profile.patientId}
            </span>
          )}

          {demographics && (
            <span className="patient-chip accent">
              {demographics}
            </span>
          )}

        </div>

        {hasProfile ? (
          <p className="patient-condition">
            <span className="patient-condition-dot" />
            Existing condition:{" "}
            <strong>
              {condition || "Not provided"}
            </strong>
          </p>
        ) : (
          <p className="patient-card-hint">
            Use the account icon in the top right to add
            your details.
          </p>
        )}

      </div>

    </section>
  );
}

/* =========================================================
   Vitals + Wellbeing score + Care Plan score
   ========================================================= */

function MetricCard({
  label,
  value,
  unit,
  tone,
  statusText,
  progress,
  title,
}) {
  const empty = value === "--";

  return (
    <article className="metric-card" title={title}>

      <div className="metric-card-top">
        <span className="metric-label">{label}</span>

        <span
          className={`metric-dot ${tone}`}
          aria-hidden="true"
        />
      </div>

      <div className="metric-value-row">
        <strong
          className={
            empty ? "metric-value empty" : "metric-value"
          }
        >
          {value}
        </strong>

        {unit && (
          <span className="metric-unit">{unit}</span>
        )}
      </div>

      <p className={`metric-status ${tone}`}>
        {statusText}
      </p>

      <div className="metric-bar">
        <div
          className={`metric-bar-fill ${tone}`}
          style={{ width: `${progress}%` }}
        />
      </div>

    </article>
  );
}

function VitalsDashboard({
  profile,
  wellbeingScore,
  carePlan,
}) {
  const spo2 = parseMetric(profile?.spo2);
  const heartRate = parseMetric(profile?.heartRate);
  const peakFlow = parseMetric(profile?.peakFlow);

  const spo2Status = getSpo2Status(spo2);
  const heartRateStatus = getHeartRateStatus(
    heartRate,
    profile?.age
  );

  const adherence = calculateCarePlanAdherence(carePlan);
  const hasCarePlan = Boolean(adherence && adherence.total > 0);
  const hasWellbeing = wellbeingScore !== null;

  return (
    <section
      className="dashboard-section"
      aria-label="Vitals and scores"
    >

      <div className="metric-grid">

        {/* SpO2 — bar shows the saturation percentage */}
        <MetricCard
          label="SpO₂ level"
          value={spo2 === null ? "--" : String(spo2)}
          unit="%"
          tone={spo2Status.tone}
          statusText={spo2Status.text}
          progress={spo2 === null ? 0 : clampPercent(spo2)}
        />

        {/* Heart rate — bar is a visual scale of 0-200 bpm */}
        <MetricCard
          label="Heart rate"
          value={
            heartRate === null ? "--" : String(heartRate)
          }
          unit="bpm"
          tone={heartRateStatus.tone}
          statusText={heartRateStatus.text}
          progress={
            heartRate === null
              ? 0
              : clampPercent((heartRate / 200) * 100)
          }
        />

        {/* Peak flow — not interpreted (depends on age, sex,
            height and personal best). Bar is a visual scale
            of 0-800 L/min. */}
        <MetricCard
          label="Peak flow"
          value={peakFlow === null ? "--" : String(peakFlow)}
          unit="L/min"
          tone={peakFlow === null ? "neutral" : "accent"}
          statusText={
            peakFlow === null
              ? "Not entered"
              : "Recorded value"
          }
          progress={
            peakFlow === null
              ? 0
              : clampPercent((peakFlow / 800) * 100)
          }
        />

        {/* Digital Wellbeing score from the Wellbeing module */}
        <MetricCard
          label="Digital wellbeing"
          value={hasWellbeing ? String(wellbeingScore) : "--"}
          unit="/100"
          tone={hasWellbeing ? "accent" : "neutral"}
          statusText={
            hasWellbeing
              ? "From Digital Wellbeing intake"
              : "Not calculated yet"
          }
          progress={
            hasWellbeing ? clampPercent(wellbeingScore) : 0
          }
        />

        {/* Care Plan adherence from the Care Plan module */}
        <MetricCard
          label="Care plan"
          value={
            hasCarePlan ? String(adherence.percentage) : "--"
          }
          unit="%"
          tone={hasCarePlan ? "accent" : "neutral"}
          statusText={
            hasCarePlan
              ? `${adherence.completed} of ${adherence.total} completed`
              : "No active care plan"
          }
          progress={
            hasCarePlan
              ? clampPercent(adherence.percentage)
              : 0
          }
          title={
            hasCarePlan && carePlan?.disease
              ? `Care plan for ${carePlan.disease}`
              : undefined
          }
        />

      </div>

      <p className="dashboard-footnote">
        SpO₂ and heart-rate status use general adult
        reference ranges and are informational only, not a
        diagnosis. Peak flow is not interpreted because
        normal values depend on age, sex, height and
        personal best.
      </p>

    </section>
  );
}

/* =========================================================
   Page
   ========================================================= */

export default function SymptomChecker({
  patientProfile,
  onDiseaseAnalyzed,
}) {
  const [problemDescription, setProblemDescription] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [severity, setSeverity] = useState("Moderate");
  const [activeCategory, setActiveCategory] = useState("All");
  const [moreSymptomsOpen, setMoreSymptomsOpen] = useState(false);

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorSource, setErrorSource] = useState("analyze");
  const [result, setResult] = useState(null);

  function toggleSymptom(symptom) {
    setSymptoms((current) => {
      if (current.includes(symptom)) {
        return current.filter((item) => item !== symptom);
      }

      return [...current, symptom];
    });

    setResult(null);
    setErrorMessage("");

    if (status === "error") {
      setStatus("idle");
    }
  }

  async function analyzeSymptoms(symptomsToAnalyze = symptoms) {
    const descriptionSymptoms =
      extractKnownSymptoms(problemDescription);

    const combinedSymptoms = [
      ...new Set([
        ...symptomsToAnalyze,
        ...descriptionSymptoms,
      ]),
    ];

    if (combinedSymptoms.length === 0) {
      setErrorMessage(
        "Select at least one symptom or describe what you are experiencing."
      );
      setErrorSource("analyze");
      setStatus("error");
      return;
    }

    setStatus("analyzing");
    setErrorMessage("");
    setResult(null);

    try {
      const data = await predictDisease(combinedSymptoms);

      setSymptoms(combinedSymptoms);
      setResult(data);
      setStatus("complete");

      const disease = data?.prediction?.predicted_disease;

      if (disease && onDiseaseAnalyzed) {
        onDiseaseAnalyzed(disease);
      }

    } catch (err) {
      setErrorSource("analyze");
      setStatus("error");

      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : "Something went wrong while analyzing your symptoms."
      );
    }
  }

  function handleCategoryChange(category) {
    setActiveCategory(category);

    if (category !== "All") {
      setMoreSymptomsOpen(false);
    }
  }

  const allSymptoms = Object.values(SYMPTOM_GROUPS).flat();

  const remainingSymptoms = allSymptoms.filter(
    (symptom) => !COMMON_SYMPTOMS.includes(symptom)
  );

  const visibleSymptoms =
    activeCategory === "All"
      ? COMMON_SYMPTOMS
      : SYMPTOM_GROUPS[activeCategory];

  const differentials = result
    ? result.top3_predictions.filter(
        (prediction) =>
          prediction.disease !==
          result.prediction.predicted_disease
      )
    : [];

  /*
   * Generated symptoms: exactly what analyzeSymptoms() will send —
   * the library selection plus anything recognized in the text.
   */
  const recognizedFromText =
    extractKnownSymptoms(problemDescription);

  const generatedSymptoms = [
    ...new Set([...symptoms, ...recognizedFromText]),
  ].map((symptom) => ({
    name: symptom,
    source: recognizedFromText.includes(symptom)
      ? "From description"
      : "From library",
  }));

  /*
   * Shared scores. Both live in module stores (not duplicated
   * here), so this page shows the same values as the Care Plan
   * and Digital Wellbeing modules.
   */
  const carePlan = getCarePlan();
  const wellbeingScore = getWellbeingScore();

  return (
    <div className="page symptom-page">

      {/* 1. PATIENT INFORMATION (read-only) */}

      <PatientInformation profile={patientProfile} />

      {/* 2. VITALS + WELLBEING SCORE + CARE PLAN SCORE */}

      <VitalsDashboard
        profile={patientProfile}
        wellbeingScore={wellbeingScore}
        carePlan={carePlan}
      />

      {/* 3. SYMPTOM SEARCH & SELECT */}

      <section className="symptom-assessment-card symptom-search-card">

        {/* HEADER */}

        <div className="symptom-card-header">

          <p className="symptom-card-eyebrow">
            <span className="symptom-card-eyebrow-dot" />
            SYMPTOM ENTRY & MATCHING
          </p>

          <h1>Describe Symptoms</h1>

          <p className="symptom-card-subtitle">
            Write what you are experiencing in your own
            words.
          </p>

        </div>

        {/* SEARCH-STYLE INPUT */}

        <div className="symptom-search-bar">

          <SearchIcon />

          <label
            htmlFor="problem-description"
            className="sr-only"
          >
            What are you experiencing?
          </label>

          <textarea
            id="problem-description"
            value={problemDescription}
            onChange={(event) => {
              setProblemDescription(event.target.value);
              setResult(null);
              setErrorMessage("");

              if (!event.target.value.trim()) {
                setStatus("idle");
              }
            }}
            placeholder="Describe what you're experiencing (e.g. cough, fever, shortness of breath)..."
            rows={1}
          />

          {problemDescription && (
            <button
              type="button"
              className="symptom-search-clear"
              aria-label="Clear description"
              onClick={() => {
                setProblemDescription("");
                setResult(null);
                setErrorMessage("");
                setStatus("idle");
              }}
            >
              <CloseIcon />
            </button>
          )}

        </div>

        {/* QUICK-SELECT SYMPTOMS */}

        <div className="symptom-library">

          <div className="symptom-library-header">

            <p className="symptom-section-label">
              QUICK-SELECT COMMON SYMPTOMS
            </p>

            <span>
              {visibleSymptoms.length +
                (activeCategory === "All" && moreSymptomsOpen
                  ? remainingSymptoms.length
                  : 0)}{" "}
              Available Suggestions
            </span>

          </div>

          {/* CATEGORIES */}

          <div className="symptom-category-row">

            {CATEGORY_NAMES.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  activeCategory === category
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handleCategoryChange(category)
                }
              >
                {category === "All"
                  ? "All tags"
                  : category}
              </button>
            ))}

          </div>

          {/* SYMPTOMS */}

          <div className="symptom-chip-row">

            {visibleSymptoms.map((symptom) => {
              const selected =
                symptoms.includes(symptom);

              return (
                <button
                  key={symptom}
                  type="button"
                  aria-pressed={selected}
                  className={
                    selected
                      ? "symptom-chip selected"
                      : "symptom-chip"
                  }
                  onClick={() =>
                    toggleSymptom(symptom)
                  }
                >
                  {selected ? (
                    <CheckCircleIcon />
                  ) : (
                    <PlusCircleIcon />
                  )}

                  {symptom}
                </button>
              );
            })}

          </div>

          {/* MORE SYMPTOMS */}

          {activeCategory === "All" && (
            <>
              <div className="more-symptoms-row">

                <button
                  type="button"
                  onClick={() =>
                    setMoreSymptomsOpen(
                      (open) => !open
                    )
                  }
                  aria-expanded={moreSymptomsOpen}
                >
                  More symptoms

                  <span>
                    {moreSymptomsOpen
                      ? "▲"
                      : "▼"}
                  </span>
                </button>

              </div>

              {moreSymptomsOpen && (
                <div className="more-symptoms-panel">

                  <div className="symptom-chip-row">

                    {remainingSymptoms.map(
                      (symptom) => {
                        const selected =
                          symptoms.includes(
                            symptom
                          );

                        return (
                          <button
                            key={symptom}
                            type="button"
                            aria-pressed={selected}
                            className={
                              selected
                                ? "symptom-chip selected"
                                : "symptom-chip"
                            }
                            onClick={() =>
                              toggleSymptom(
                                symptom
                              )
                            }
                          >
                            {selected ? (
                              <CheckCircleIcon />
                            ) : (
                              <PlusCircleIcon />
                            )}

                            {symptom}
                          </button>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

            </>
          )}

        </div>

        <div className="symptom-divider" />

        {/* SEVERITY */}

        <div className="symptom-selection-card">

          <div className="symptom-severity-row">

            <div>
              <p className="symptom-section-label">
                SELF-RATED SEVERITY
              </p>
            </div>

            <div className="symptom-severity-control">
              {["Mild", "Moderate", "Severe"].map(
                (level) => (
                  <button
                    key={level}
                    type="button"
                    className={
                      severity === level
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setSeverity(level)
                    }
                  >
                    {level}
                  </button>
                )
              )}
            </div>
          </div>

        </div>

        {/* ANALYZE */}

        <div className="symptom-input-footer">

          <p>
            Describe your symptoms in your own words. CarePulse
            will combine recognized symptoms from your description
            with any symptoms you select above.
          </p>

          <button
            type="button"
            className="symptom-primary-button"
            onClick={() => analyzeSymptoms(symptoms)}
            disabled={
              status === "analyzing" ||
              (!problemDescription.trim() && symptoms.length === 0)
            }
          >
            {status === "analyzing"
              ? "Analyzing…"
              : "Analyze Symptoms"}
          </button>

        </div>

      </section>

      {/* 6. DIAGNOSTIC OUTLOOK */}

      {result && (
        <section className="diagnostic-outlook">

          <div className="diagnostic-outlook-heading">

            <div>
              <p className="section-eyebrow">
                DIAGNOSTIC OUTLOOK
              </p>

              <h2>Model prediction</h2>
            </div>

            <Badge tone="success">
              Model output
            </Badge>

          </div>

          <div className="primary-diagnosis-card">

            <div className="primary-diagnosis-top">

              <div>
                <span className="diagnosis-label">
                  Primary prediction
                </span>

                <h3>
                  {result.prediction.predicted_disease}
                </h3>
              </div>

              <Badge tone="success">
                Primary match
              </Badge>

            </div>

            <div className="confidence-section">

              <div className="confidence-header">

                <span>
                  Model confidence
                </span>

                <strong>
                  {
                    result.prediction
                      .confidence_score
                  }
                  %
                </strong>

              </div>

              <div className="progress-track confidence-track">

                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        result.prediction
                          .confidence_score
                      )
                    )}%`,
                  }}
                />

              </div>

              <p>
                {
                  result.prediction
                    .matched_symptoms_count
                }{" "}
                of {symptoms.length} entered symptoms
                recognized.
              </p>

            </div>
          </div>

          {differentials.length > 0 && (
            <div className="differential-card">

              <div className="differential-heading">
                <h3>Other model results</h3>

                <p>
                  Additional candidates returned by
                  the model.
                </p>
              </div>

              <div className="differential-list">

                {differentials.map(
                  (prediction, index) => (
                    <div
                      className="differential-row"
                      key={prediction.disease}
                    >

                      <div className="differential-rank">
                        {index + 2}
                      </div>

                      <div className="differential-body">

                        <div className="differential-title">
                          {prediction.disease}
                        </div>

                        <div className="progress-track">

                          <div
                            className="progress-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  prediction.confidence
                                )
                              )}%`,
                              background:
                                "var(--outline-variant)",
                            }}
                          />

                        </div>

                      </div>

                      <span className="differential-confidence">
                        {prediction.confidence}%
                      </span>

                    </div>
                  )
                )}

              </div>
            </div>
          )}

        </section>
      )}

    </div>
  );
}

