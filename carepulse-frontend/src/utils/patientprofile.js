const STORAGE_KEY = "carepulse_patient_profile";

const DEFAULT_PROFILE = {
  name: "",
  age: "",
  gender: "",
  mobile: "",
  disease: "",
  spo2: "",
  heartRate: "",
  peakFlow: "",
};

function normalize(profile) {
  const normalized = { ...DEFAULT_PROFILE };

  Object.keys(DEFAULT_PROFILE).forEach((key) => {
    const value = profile?.[key];

    if (value === undefined || value === null) {
      return;
    }

    normalized[key] = String(value).trim();
  });

  return normalized;
}

export function getPatientProfile() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return { ...DEFAULT_PROFILE };
    }

    return normalize(JSON.parse(stored));
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function savePatientProfile(profile) {
  const normalized = normalize(profile);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Storage unavailable (private mode / quota). Profile still
    // works for the current session through React state.
  }

  return normalized;
}

export function clearPatientProfile() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }

  return { ...DEFAULT_PROFILE };
}

export function hasPatientProfile(profile) {
  return Object.values(profile || {}).some(
    (value) => String(value ?? "").trim() !== ""
  );
}

export function getInitials(name) {
  if (!name?.trim()) {
    return "";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export { DEFAULT_PROFILE };