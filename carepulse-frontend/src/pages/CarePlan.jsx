import { useEffect, useMemo, useState } from "react";
import "../styles/carePlan.css";

import { getRecommendations } from "../api/recommendationsApi";
import { ApiError } from "../api/client";
import StatusBanner from "../components/StatusBanner";

import {
  getCarePlan,
  saveCarePlan,
  updateCarePlanItem,
  clearCarePlan,
} from "../utils/carePlanStorage";

/* =========================================================
   Icons
   ========================================================= */

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5 5.5 6.2v5.1c0 4.1 2.5 7.8 6.5 9.2 4-1.4 6.5-5.1 6.5-9.2V6.2L12 3.5Z" />
      <path d="m9.2 12 1.8 1.8 3.8-4" />
    </svg>
  );
}

function PillIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.2 17.2a4.3 4.3 0 0 1 0-6.1l3.9-3.9a4.3 4.3 0 0 1 6.1 6.1l-3.9 3.9a4.3 4.3 0 0 1-6.1 0Z" />
      <path d="m9.1 8.9 6 6" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12h4l2.2-6 3.1 12 2.2-6H21" />
    </svg>
  );
}

function DietIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20c4.3-3.2 6.5-6.2 6.5-9.6A4.4 4.4 0 0 0 14.1 6c-.8 0-1.5.2-2.1.7A3.8 3.8 0 0 0 9.9 6a4.4 4.4 0 0 0-4.4 4.4C5.5 13.8 7.7 16.8 12 20Z" />
      <path d="M12 7v9" />
    </svg>
  );
}

/* =========================================================
   Tabs
   ========================================================= */

const TABS = [
  {
    id: "precautions",
    label: "Precautions",
    key: "precautions",
    icon: ShieldIcon,
    title: "Checklist & Protocol",
    subtitle: "Track the precautions and guidance you want to follow.",
    badge: "Precautions",
  },
  {
    id: "medications",
    label: "Meds",
    key: "medications",
    icon: PillIcon,
    title: "Medication Guidance",
    subtitle: "Medication-related guidance returned by CarePulse.",
    badge: "Medication guidance",
  },
  {
    id: "workouts",
    label: "Exercises",
    key: "workouts",
    icon: ActivityIcon,
    title: "Exercises & Movement",
    subtitle: "Activity guidance returned by CarePulse.",
    badge: "Activity guidance",
  },
  {
    id: "diet",
    label: "Diet & Fluid",
    key: "diet",
    icon: DietIcon,
    title: "Diet & Fluid",
    subtitle: "Dietary guidance returned by CarePulse.",
    badge: "Nutrition guidance",
  },
];

/* =========================================================
   Care plan helpers
   ========================================================= */

function createCarePlan(result, disease) {
  const items = {};

  TABS.forEach((tab) => {
    const recommendations = Array.isArray(result?.[tab.key])
      ? result[tab.key]
      : [];

    items[tab.key] = recommendations.map((recommendation) => ({
      text: recommendation,
      completed: false,
    }));
  });

  return {
    disease: disease.trim(),
    items,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function convertStoredItemsToResult(carePlan) {
  if (!carePlan?.items) {
    return null;
  }

  const result = {};

  TABS.forEach((tab) => {
    result[tab.key] = Array.isArray(carePlan.items[tab.key])
      ? carePlan.items[tab.key].map((item) => item.text)
      : [];
  });

  return result;
}

function getCompletedState(carePlan) {
  const restored = {};

  if (!carePlan?.items) {
    return restored;
  }

  TABS.forEach((tab) => {
    const items = carePlan.items[tab.key] || [];

    items.forEach((item, index) => {
      restored[`${tab.id}-${index}`] = item.completed === true;
    });
  });

  return restored;
}

/* =========================================================
   Page
   ========================================================= */

export default function CarePlan({ disease }) {
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("precautions");
  const [completed, setCompleted] = useState({});
  const [carePlan, setCarePlan] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCarePlan() {
      const normalizedDisease = disease?.trim() || "";
      const storedCarePlan = getCarePlan();

      /*
       * No disease supplied.
       * Restore an existing in-memory plan if available.
       */
      if (!normalizedDisease) {
        if (storedCarePlan) {
          const storedResult =
            convertStoredItemsToResult(storedCarePlan);

          if (!cancelled) {
            setCarePlan(storedCarePlan);
            setResult(storedResult);
            setCompleted(getCompletedState(storedCarePlan));
            setStatus("idle");
          }
        }

        return;
      }

      /*
       * Remember the most recently analyzed disease.
       */
      localStorage.setItem(
        "carepulse:lastDisease",
        normalizedDisease
      );

      /*
       * Same disease:
       * restore the existing plan instead of fetching again.
       */
      if (
        storedCarePlan &&
        storedCarePlan.disease === normalizedDisease
      ) {
        const storedResult =
          convertStoredItemsToResult(storedCarePlan);

        if (!cancelled) {
          setCarePlan(storedCarePlan);
          setResult(storedResult);
          setCompleted(getCompletedState(storedCarePlan));
          setStatus("idle");
        }

        return;
      }

      /*
       * Different disease:
       * replace the old plan.
       */
      clearCarePlan();

      setCarePlan(null);
      setCompleted({});
      setResult(null);
      setActiveTab("precautions");
      setStatus("loading");
      setErrorMessage("");

      try {
        const data = await getRecommendations(normalizedDisease);

        if (cancelled) {
          return;
        }

        const newCarePlan = createCarePlan(
          data,
          normalizedDisease
        );

        saveCarePlan(newCarePlan);

        setCarePlan(newCarePlan);
        setResult(data);
        setCompleted({});
        setStatus("idle");
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (err instanceof ApiError && err.status === 404) {
          setStatus("not-found");
          return;
        }

        setStatus("error");

        setErrorMessage(
          err instanceof ApiError
            ? err.message
            : "Unable to load the care plan."
        );
      }
    }

    loadCarePlan();

    return () => {
      cancelled = true;
    };
  }, [disease]);

  const activeTabData = useMemo(() => {
    const tab =
      TABS.find((item) => item.id === activeTab) || TABS[0];

    return {
      ...tab,
      items: result ? result[tab.key] || [] : [],
    };
  }, [activeTab, result]);

  const completedCount = activeTabData.items.filter(
    (_, index) => completed[`${activeTab}-${index}`]
  ).length;

  const totalItems = activeTabData.items.length;

  function toggleCompleted(index) {
    const id = `${activeTab}-${index}`;
    const newCompleted = !completed[id];

    setCompleted((previous) => ({
      ...previous,
      [id]: newCompleted,
    }));

    const updatedCarePlan = updateCarePlanItem(
      activeTab,
      index,
      newCompleted
    );

    if (updatedCarePlan) {
      setCarePlan(updatedCarePlan);
    }
  }

  /*
   * Empty state.
   */
  if (!carePlan && !disease && status === "idle") {
    return (
      <section className="care-plan-section">
        <div className="care-plan-empty-state">
          <div className="care-plan-empty-icon">
            <ShieldIcon />
          </div>

          <p className="care-plan-eyebrow">
            CARE PROTOCOL
          </p>

          <h2>No active care plan</h2>

          <p>
            Analyze your symptoms from the Symptoms AI
            module to generate a personalized care plan.
          </p>
        </div>
      </section>
    );
  }

  const ActiveIcon = activeTabData.icon;

  return (
    <section className="care-plan-section">
      <div className="care-plan-header">
        <div>
          <p className="care-plan-eyebrow">
            CARE PROTOCOL
          </p>

          <h2>Care Plan & Guidance</h2>

          <p>
            Review and track personalized guidance for{" "}
            <strong>
              {carePlan?.disease || disease}
            </strong>
            .
          </p>
        </div>

        <div className="care-plan-interactive">
          <span />
          Interactive
        </div>
      </div>

      {status === "loading" && (
        <StatusBanner tone="pending">
          Loading care plan for {disease}…
        </StatusBanner>
      )}

      {status === "not-found" && (
        <StatusBanner tone="pending">
          No recommendation data is available for{" "}
          {disease}.
        </StatusBanner>
      )}

      {status === "error" && (
        <StatusBanner tone="error">
          {errorMessage}
        </StatusBanner>
      )}

      {status === "idle" && result && (
        <>
          <div
            className="care-plan-tabs"
            role="tablist"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`care-plan-tab ${
                    activeTab === tab.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                >
                  <Icon />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="care-plan-panel">
            <div className="care-plan-panel-header">
              <div className="care-plan-panel-title">
                <div className="care-plan-main-icon">
                  <ActiveIcon />
                </div>

                <div>
                  <h3>{activeTabData.title}</h3>

                  <p>
                    {activeTabData.subtitle}
                  </p>
                </div>
              </div>

              <div className="care-plan-panel-badge">
                {totalItems > 0
                  ? `${completedCount} of ${totalItems} Completed`
                  : activeTabData.badge}
              </div>
            </div>

            {totalItems > 0 ? (
              <div className="care-plan-items">
                {activeTabData.items.map(
                  (item, index) => {
                    const id =
                      `${activeTab}-${index}`;

                    const isCompleted =
                      Boolean(completed[id]);

                    return (
                      <article
                        className={`care-plan-item ${
                          isCompleted
                            ? "completed"
                            : ""
                        }`}
                        key={`${activeTab}-${index}-${item}`}
                      >
                        <button
                          type="button"
                          className="care-plan-checkbox"
                          aria-label={
                            isCompleted
                              ? `Mark ${item} incomplete`
                              : `Mark ${item} completed`
                          }
                          aria-pressed={
                            isCompleted
                          }
                          onClick={() =>
                            toggleCompleted(index)
                          }
                        >
                          {isCompleted && "✓"}
                        </button>

                        <div className="care-plan-item-content">
                          <h4>{item}</h4>

                          <p>
                            {isCompleted
                              ? "Marked as completed."
                              : "Mark this item when you have followed it."}
                          </p>
                        </div>

                        <span
                          className={`care-plan-status ${
                            isCompleted
                              ? "completed"
                              : ""
                          }`}
                        >
                          {isCompleted
                            ? "Completed"
                            : "Not completed"}
                        </span>
                      </article>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="care-plan-empty">
                <strong>
                  No guidance available
                </strong>

                <p>
                  The recommendation data does not
                  contain items for this section.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}