let activeCarePlan = null;

/**
 * Save the currently active Care Plan.
 *
 * This is intentionally stored only in memory.
 * It will survive navigation inside the React app,
 * but it will be cleared when the browser page is
 * refreshed or closed.
 */
export function saveCarePlan(carePlan) {
  activeCarePlan = carePlan;
}

/**
 * Get the currently active Care Plan.
 */
export function getCarePlan() {
  return activeCarePlan;
}

/**
 * Update the completion state of one Care Plan item.
 */
export function updateCarePlanItem(
  category,
  itemIndex,
  completed
) {
  if (!activeCarePlan) {
    return null;
  }

  if (!activeCarePlan.items?.[category]) {
    return activeCarePlan;
  }

  const item =
    activeCarePlan.items[category][itemIndex];

  if (!item) {
    return activeCarePlan;
  }

  item.completed = completed;

  activeCarePlan.updatedAt =
    new Date().toISOString();

  return activeCarePlan;
}

/**
 * Clear the currently active Care Plan.
 *
 * Used when a new disease is analyzed.
 */
export function clearCarePlan() {
  activeCarePlan = null;
}

/**
 * Calculate overall Care Plan adherence.
 */
export function calculateCarePlanAdherence(
  carePlan
) {
  if (!carePlan?.items) {
    return null;
  }

  let total = 0;
  let completed = 0;

  Object.values(carePlan.items).forEach(
    (categoryItems) => {
      if (!Array.isArray(categoryItems)) {
        return;
      }

      categoryItems.forEach((item) => {
        total += 1;

        if (item.completed === true) {
          completed += 1;
        }
      });
    }
  );

  if (total === 0) {
    return {
      percentage: 0,
      completed: 0,
      total: 0,
    };
  }

  return {
    percentage: Math.round(
      (completed / total) * 100
    ),
    completed,
    total,
  };
}

/**
 * Calculate adherence separately for each category.
 */
export function calculateCategoryAdherence(
  carePlan
) {
  if (!carePlan?.items) {
    return {};
  }

  const result = {};

  Object.entries(carePlan.items).forEach(
    ([category, items]) => {
      if (!Array.isArray(items)) {
        return;
      }

      const total = items.length;

      const completed = items.filter(
        (item) =>
          item.completed === true
      ).length;

      result[category] = {
        percentage:
          total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
              ),
        completed,
        total,
      };
    }
  );

  return result;
}