let wellbeingScore = null;

/**
 * Save the latest Digital Wellbeing score (0-100).
 *
 * Like the Care Plan, this is intentionally kept only in memory.
 * It survives navigation inside the React app but is cleared when
 * the browser page is refreshed or closed.
 */
export function saveWellbeingScore(score) {
  const numeric = Number(score);

  wellbeingScore = Number.isFinite(numeric) ? numeric : null;
}

/**
 * Get the latest Digital Wellbeing score, or null if none exists.
 */
export function getWellbeingScore() {
  return wellbeingScore;
}

/**
 * Clear the stored Digital Wellbeing score.
 */
export function clearWellbeingScore() {
  wellbeingScore = null;
}