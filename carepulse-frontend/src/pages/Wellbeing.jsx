import { useEffect, useState } from "react";
import Card from "../components/Card";
import StatusBanner from "../components/StatusBanner";
import { IconMind } from "../components/Icons";
import { predictWellbeing } from "../api/wellbeingApi";
import { ApiError } from "../api/client";

import {
  getCarePlan,
  calculateCarePlanAdherence,
} from "../utils/carePlanStorage";

import {
  saveWellbeingScore,
  getWellbeingScore,
  clearWellbeingScore,
} from "../utils/wellbeingStorage";

const PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Facebook",
  "Twitter",
  "Snapchat",
  "Other",
];

const PURPOSES = [
  "Social Interaction",
  "Entertainment",
  "Education",
  "Business",
  "Other",
];

const ACADEMIC_LEVELS = [
  "High School",
  "Undergraduate",
  "Graduate",
];

const STRESS_LEVELS = [
  "Low",
  "Medium",
  "High",
  "Very High",
];

const INITIAL_FORM = {
  Age: "",
  Gender: "Female",
  Country: "",
  Academic_Level: ACADEMIC_LEVELS[1],
  Most_Used_Platform: PLATFORMS[0],
  Purpose_Of_Use: PURPOSES[0],
  Avg_Daily_Usage_Hours: "4",
  Daily_Unlocks: 30,
  Study_Hours: "",
  Physical_Activity_Hours: "",
  Sleep_Hours_Per_Night: "",
  Stress_Level: "Medium",
};

const NUMERIC_FIELDS = new Set([
  "Age",
  "Avg_Daily_Usage_Hours",
  "Daily_Unlocks",
  "Study_Hours",
  "Physical_Activity_Hours",
  "Sleep_Hours_Per_Night",
]);

function Gauge({ value }) {
  const size = 180;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const numericValue = Number(value) || 0;

  const clamped = Math.max(
    0,
    Math.min(100, numericValue)
  );

  const offset =
    circumference -
    (clamped / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`${clamped}%`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--surface-container)"
        strokeWidth={stroke}
      />

      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${
          size / 2
        } ${size / 2})`}
      />

      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="gauge-value"
      >
        {clamped}%
      </text>
    </svg>
  );
}

function getAdherenceMessage(percentage) {
  if (percentage >= 80) {
    return "Excellent adherence";
  }

  if (percentage >= 60) {
    return "Good adherence";
  }

  if (percentage >= 40) {
    return "Moderate adherence";
  }

  if (percentage > 0) {
    return "Low adherence";
  }

  return "No completed recommendations yet";
}

export default function Wellbeing() {
  const [form, setForm] =
    useState(INITIAL_FORM);

  const [status, setStatus] =
    useState("idle");

  const [errorMessage, setErrorMessage] =
    useState("");

  /*
   * The score is shared through wellbeingStorage so the
   * Symptoms AI dashboard shows the same value. Starting from
   * the stored value keeps both pages consistent after
   * navigating away and back.
   */
  const [score, setScore] =
    useState(() => getWellbeingScore());

  const [
    carePlanAdherence,
    setCarePlanAdherence,
  ] = useState(null);

  /*
   * Care Plan is stored only in memory.
   * It survives navigation inside the app
   * but disappears after refresh/tab close.
   */
  useEffect(() => {
    const carePlan =
      getCarePlan();

    const adherence =
      calculateCarePlanAdherence(
        carePlan
      );

    setCarePlanAdherence(
      adherence
    );
  }, []);

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function nudgeUnlocks(delta) {
    setForm((prev) => ({
      ...prev,
      Daily_Unlocks: Math.max(
        0,
        prev.Daily_Unlocks + delta
      ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setStatus("loading");
    setErrorMessage("");
    setScore(null);
    clearWellbeingScore();

    const payload =
      Object.fromEntries(
        Object.entries(form).map(
          ([key, value]) => [
            key,
            NUMERIC_FIELDS.has(key)
              ? Number(value)
              : value,
          ]
        )
      );

    try {
      const data =
        await predictWellbeing(
          payload
        );

      const setScoreOutof100 = Number(
        (Number(data.predicted_score) * 10).toFixed(1)
      );

      setScore(setScoreOutof100);
      saveWellbeingScore(setScoreOutof100);

      setStatus("idle");
    } catch (err) {
      setStatus("error");

      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : "Something went wrong."
      );
    }
  }

  return (
    <div className="page wellbeing-page">
      <style>{`
        /*
         * Make the Wellbeing page use the
         * available desktop width instead of
         * the narrow default .page width.
         */
        .wellbeing-page {
          position: relative;
          left: 50%;
          transform: translateX(-50%);
          width: 92vw;
          max-width: 1500px;
          box-sizing: border-box;
        }

        .wellbeing-header {
          margin-bottom: 28px;
        }

        .wellbeing-header h1 {
          font-size: 1.8rem;
          margin-bottom: 8px;
        }

        .wellbeing-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 2.1fr)
            minmax(340px, 0.9fr);
          gap: 28px;
          align-items: start;
        }

        .wellbeing-left {
          min-width: 0;
          padding-right: 100px;
        }

        .wellbeing-right {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 28px;
          padding-right: 100px;
        }

        .wellbeing-right .gauge-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 16px;
          padding: 8px 0;
        }

        .wellbeing-right .gauge-caption {
          max-width: 360px;
          margin: 0 auto;
        }

        .wellbeing-score-empty {
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
        }

        .wellbeing-input-card {
          min-height: 100%;
        }

        /*
         * Give the form more breathing room
         * on wide desktop screens.
         */
        .wellbeing-left .field-row {
          gap: 28px;
        }

        .wellbeing-left .field {
          flex: 1;
          min-width: 0;
        }

        @media (min-width: 1200px) {
          .wellbeing-page {
            width: 94vw;
            max-width: 1550px;
          }

          .wellbeing-layout {
            grid-template-columns:
              minmax(0, 2.2fr)
              minmax(380px, 0.8fr);
          }
        }

        @media (max-width: 900px) {
          .wellbeing-page {
            width: calc(100vw - 32px);
            left: auto;
            transform: none;
            margin-left: 16px;
            margin-right: 16px;
          }

          .wellbeing-layout {
            grid-template-columns: 1fr;
          }

          .wellbeing-right {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 650px) {
          .wellbeing-page {
            width: calc(100vw - 24px);
            margin-left: 12px;
            margin-right: 12px;
          }

          .wellbeing-right {
            display: flex;
            flex-direction: column;
          }

          .wellbeing-left .field-row {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>

      <header className="wellbeing-header">
        <h1>
          Digital wellbeing
        </h1>

        <p className="page-lead">
          A short intake on usage habits
          and daily rhythm. Returns a score
          from the trained model —
          informational, not a clinical
          assessment.
        </p>
      </header>

      <div className="wellbeing-layout">

        {/* =====================================================
            LEFT — WELLBEING INPUTS
            ===================================================== */}

        <div className="wellbeing-left">

          <Card
            icon={
              <IconMind
                width={18}
                height={18}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            }
            title="Habit & lifestyle intake"
          >
            <form
              onSubmit={handleSubmit}
              className="field-group"
            >

              {/* AGE + GENDER */}
              <div className="field-row">
                <div className="field">
                  <label htmlFor="age">
                    Age
                  </label>

                  <input
                    id="age"
                    type="number"
                    min="10"
                    max="100"
                    required
                    value={form.Age}
                    onChange={(e) =>
                      update(
                        "Age",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="gender">
                    Gender
                  </label>

                  <select
                    id="gender"
                    value={form.Gender}
                    onChange={(e) =>
                      update(
                        "Gender",
                        e.target.value
                      )
                    }
                  >
                    <option>
                      Female
                    </option>

                    <option>
                      Male
                    </option>

                    <option>
                      Other
                    </option>
                  </select>
                </div>
              </div>

              {/* COUNTRY + ACADEMIC */}
              <div className="field-row">
                <div className="field">
                  <label htmlFor="country">
                    Country
                  </label>

                  <input
                    id="country"
                    required
                    placeholder="e.g. India"
                    value={form.Country}
                    onChange={(e) =>
                      update(
                        "Country",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="academic">
                    Academic level
                  </label>

                  <select
                    id="academic"
                    value={
                      form.Academic_Level
                    }
                    onChange={(e) =>
                      update(
                        "Academic_Level",
                        e.target.value
                      )
                    }
                  >
                    {ACADEMIC_LEVELS.map(
                      (level) => (
                        <option
                          key={level}
                        >
                          {level}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* PLATFORM + PURPOSE */}
              <div className="field-row">
                <div className="field">
                  <label htmlFor="platform">
                    Most used platform
                  </label>

                  <select
                    id="platform"
                    value={
                      form.Most_Used_Platform
                    }
                    onChange={(e) =>
                      update(
                        "Most_Used_Platform",
                        e.target.value
                      )
                    }
                  >
                    {PLATFORMS.map(
                      (platform) => (
                        <option
                          key={platform}
                        >
                          {platform}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="purpose">
                    Main purpose of use
                  </label>

                  <select
                    id="purpose"
                    value={
                      form.Purpose_Of_Use
                    }
                    onChange={(e) =>
                      update(
                        "Purpose_Of_Use",
                        e.target.value
                      )
                    }
                  >
                    {PURPOSES.map(
                      (purpose) => (
                        <option
                          key={purpose}
                        >
                          {purpose}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* USAGE + UNLOCKS */}
              <div className="field-row">
                <div className="field">
                  <label htmlFor="usage">
                    Avg. daily usage —{" "}
                    {
                      form.Avg_Daily_Usage_Hours
                    }{" "}
                    hrs
                  </label>

                  <div className="slider-row">
                    <input
                      id="usage"
                      type="range"
                      min="0"
                      max="14"
                      step="0.1"
                      value={
                        form.Avg_Daily_Usage_Hours
                      }
                      onChange={(e) =>
                        update(
                          "Avg_Daily_Usage_Hours",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="unlocks">
                    Daily phone unlocks
                  </label>

                  <div className="stepper">
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() =>
                        nudgeUnlocks(-1)
                      }
                      aria-label="Decrease"
                    >
                      −
                    </button>

                    <span className="stepper-value">
                      {
                        form.Daily_Unlocks
                      }
                    </span>

                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() =>
                        nudgeUnlocks(1)
                      }
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* STUDY + ACTIVITY */}
              <div className="field-row">
                <div className="field">
                  <label htmlFor="study">
                    Study hours / day
                  </label>

                  <div className="field-unit">
                    <input
                      id="study"
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      value={
                        form.Study_Hours
                      }
                      onChange={(e) =>
                        update(
                          "Study_Hours",
                          e.target.value
                        )
                      }
                    />

                    <span>
                      hrs
                    </span>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="activity">
                    Physical activity / day
                  </label>

                  <div className="field-unit">
                    <input
                      id="activity"
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      value={
                        form.Physical_Activity_Hours
                      }
                      onChange={(e) =>
                        update(
                          "Physical_Activity_Hours",
                          e.target.value
                        )
                      }
                    />

                    <span>
                      hrs
                    </span>
                  </div>
                </div>
              </div>

              {/* SLEEP + STRESS */}
              <div className="field-row">
                <div className="field">
                  <label htmlFor="sleep">
                    Sleep / night
                  </label>

                  <div className="field-unit">
                    <input
                      id="sleep"
                      type="number"
                      step="0.1"
                      min="0"
                      max="24"
                      required
                      value={
                        form.Sleep_Hours_Per_Night
                      }
                      onChange={(e) =>
                        update(
                          "Sleep_Hours_Per_Night",
                          e.target.value
                        )
                      }
                    />

                    <span>
                      hrs
                    </span>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="stress">
                    Stress level
                  </label>

                  <select
                    id="stress"
                    value={
                      form.Stress_Level
                    }
                    onChange={(e) =>
                      update(
                        "Stress_Level",
                        e.target.value
                      )
                    }
                  >
                    {STRESS_LEVELS.map(
                      (level) => (
                        <option
                          key={level}
                          value={level}
                        >
                          {level}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={
                  status === "loading"
                }
              >
                {status === "loading"
                  ? "Scoring…"
                  : "Calculate wellbeing score"}
              </button>
            </form>
          </Card>

          {status === "error" && (
            <StatusBanner tone="error">
              {errorMessage}
            </StatusBanner>
          )}
        </div>

        {/* =====================================================
            RIGHT — SCORES
            ===================================================== */}

        <div className="wellbeing-right">

          {/* =====================================================
              CARE PLAN ADHERENCE
              ===================================================== */}

          <Card title="Care Plan Adherence">
            {carePlanAdherence ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "18px",
                }}
              >
                <Gauge
                  value={
                    carePlanAdherence.percentage
                  }
                />

                <div>
                  <h3
                    style={{
                      margin: "0 0 10px",
                      fontSize: "1.2rem",
                    }}
                  >
                    {getAdherenceMessage(
                      carePlanAdherence.percentage
                    )}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 10px",
                    }}
                  >
                    You have completed{" "}
                    <strong>
                      {
                        carePlanAdherence.completed
                      }
                    </strong>{" "}
                    of{" "}
                    <strong>
                      {
                        carePlanAdherence.total
                      }
                    </strong>{" "}
                    care plan
                    recommendations.
                  </p>

                  <p
                    className="page-lead"
                    style={{
                      margin: 0,
                      fontSize: "0.9rem",
                    }}
                  >
                    This score reflects how
                    many of your current
                    Care Plan recommendations
                    you have marked as
                    completed.
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="wellbeing-score-empty"
              >
                <div>
                  <h3
                    style={{
                      margin:
                        "0 0 10px",
                    }}
                  >
                    No active Care Plan
                  </h3>

                  <p
                    style={{
                      margin: 0,
                    }}
                  >
                    Analyze your symptoms
                    first to generate a Care
                    Plan and track your
                    adherence here.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* =====================================================
              MENTAL WELLBEING SCORE
              ===================================================== */}

          <Card title="Mental Wellbeing">
            {score !== null ? (
              <div className="gauge-wrap">
                <Gauge
                  value={score}
                />

                <p className="gauge-caption">
                  Predicted mental wellbeing
                  score from your intake.
                  Informational only — not a
                  clinical assessment.
                </p>
              </div>
            ) : (
              <div
                className="wellbeing-score-empty"
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                    }}
                  >
                    Complete the wellbeing
                    intake to calculate your
                    mental wellbeing score.
                  </p>
                </div>
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
}