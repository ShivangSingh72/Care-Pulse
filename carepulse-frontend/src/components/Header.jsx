import { useEffect, useRef, useState } from "react";

import "../styles/profile.css";

import {
  savePatientProfile,
  clearPatientProfile,
  getInitials,
} from "../utils/patientprofile";


function LogoMark() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="11"
        fill="var(--primary)"
      />

      <path
        d="M9 20h4l2.7-6.5 4.3 13 3.8-9.5 2.7 3h4.5"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="28"
        cy="11"
        r="2.6"
        fill="var(--tertiary)"
      />
    </svg>
  );
}


function UserIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}


function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}


export default function Header({
  title,
  subtitle,
  onLogoClick,
  profile,
  onProfileChange,
}) {
  const [openPopover, setOpenPopover] =
    useState(null);

  const [draftProfile, setDraftProfile] =
    useState(profile);

  const actionsRef = useRef(null);

  // Keep the draft in sync with the saved profile
  useEffect(() => {
    setDraftProfile(profile);
  }, [profile]);

  // Close popovers on outside click or Escape
  useEffect(() => {
    if (!openPopover) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target)
      ) {
        setOpenPopover(null);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpenPopover(null);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );
    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [openPopover]);

  function togglePopover(name) {
    setOpenPopover((current) => {
      const next =
        current === name ? null : name;

      // Opening the profile panel always starts from saved data
      if (next === "avatar") {
        setDraftProfile(profile);
      }

      return next;
    });
  }

  function updateField(field, value) {
    setDraftProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSaveProfile(event) {
    event.preventDefault();

    const saved =
      savePatientProfile(draftProfile);

    onProfileChange(saved);
    setOpenPopover(null);
  }

  function handleClearProfile() {
    const cleared = clearPatientProfile();

    setDraftProfile(cleared);
    onProfileChange(cleared);
  }

  const initials = getInitials(
    profile?.name
  );

  const hasInitials = Boolean(initials);

  return (
    <header className="topbar">

      {/* BRAND */}

      <button
        className="topbar-brand"
        onClick={onLogoClick}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
        aria-label="Go to Symptoms AI"
      >

        <LogoMark />

        <div
          className="topbar-titles"
          style={{
            textAlign: "left",
          }}
        >
          <h1>{title}</h1>

          {subtitle && (
            <p>{subtitle}</p>
          )}
        </div>

      </button>


      {/* RIGHT ACTIONS */}

      <div
        className="topbar-actions"
        ref={actionsRef}
      >

        {/* NOTIFICATIONS */}

        <button
          className="icon-btn"
          aria-label="Notifications"
          aria-expanded={openPopover === "bell"}
          onClick={() =>
            togglePopover("bell")
          }
        >

          <BellIcon />

          {openPopover === "bell" && (
            <div
              className="popover notification-popover"
              role="dialog"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <p className="popover-title">
                Notifications
              </p>

              <p className="popover-muted">
                No new notifications.
              </p>

            </div>
          )}

        </button>


        {/* ACCOUNT */}

        <button
          className={
            hasInitials
              ? "avatar-btn profile-avatar-filled"
              : "avatar-btn"
          }
          aria-label="Patient account"
          aria-expanded={openPopover === "avatar"}
          onClick={() =>
            togglePopover("avatar")
          }
        >

          {hasInitials ? (
            <span className="profile-avatar-text">
              {initials}
            </span>
          ) : (
            <UserIcon />
          )}

        </button>


        {/* PROFILE PANEL */}

        {openPopover === "avatar" && (
          <div
            className="profile-popover"
            role="dialog"
            aria-label="Patient profile"
          >

            <div className="profile-popover-header">

              <div className="profile-large-avatar">
                {hasInitials ? (
                  initials
                ) : (
                  <UserIcon size={22} />
                )}
              </div>

              <div>

                <strong>
                  {profile?.name?.trim()
                    ? profile.name
                    : "Patient Profile"}
                </strong>

                <span>
                  {profile?.age
                    ? `${profile.age} years`
                    : "Add your information"}
                </span>

              </div>

            </div>


            <div className="profile-divider" />


            <form
              className="profile-form"
              onSubmit={handleSaveProfile}
            >

              {/* NAME */}

              <div className="profile-field">

                <label htmlFor="profile-name">
                  FULL NAME
                </label>

                <input
                  id="profile-name"
                  type="text"
                  autoComplete="name"
                  value={
                    draftProfile?.name || ""
                  }
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Enter your name"
                />

              </div>


              {/* AGE + GENDER */}

              <div className="profile-field-row">

                <div className="profile-field">

                  <label htmlFor="profile-age">
                    AGE
                  </label>

                  <input
                    id="profile-age"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="120"
                    value={
                      draftProfile?.age || ""
                    }
                    onChange={(event) =>
                      updateField(
                        "age",
                        event.target.value
                      )
                    }
                    placeholder="Age"
                  />

                </div>


                <div className="profile-field">

                  <label htmlFor="profile-gender">
                    GENDER
                  </label>

                  <select
                    id="profile-gender"
                    value={
                      draftProfile?.gender || ""
                    }
                    onChange={(event) =>
                      updateField(
                        "gender",
                        event.target.value
                      )
                    }
                  >

                    <option value="">
                      Select
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>

                    <option value="Prefer not to say">
                      Prefer not to say
                    </option>

                  </select>

                </div>

              </div>


              {/* MOBILE */}

              <div className="profile-field">

                <label htmlFor="profile-mobile">
                  MOBILE NUMBER
                </label>

                <input
                  id="profile-mobile"
                  type="tel"
                  autoComplete="tel"
                  value={
                    draftProfile?.mobile || ""
                  }
                  onChange={(event) =>
                    updateField(
                      "mobile",
                      event.target.value
                    )
                  }
                  placeholder="Enter mobile number"
                />

              </div>


              {/* EXISTING CONDITION */}

              <div className="profile-field">

                <label htmlFor="profile-disease">
                  EXISTING CONDITION
                </label>

                <input
                  id="profile-disease"
                  type="text"
                  value={
                    draftProfile?.disease || ""
                  }
                  onChange={(event) =>
                    updateField(
                      "disease",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Asthma, Diabetes, None"
                />

                <small>
                  Informational only — this is
                  not used as the AI diagnosis.
                </small>

              </div>


              {/* VITALS */}

              <div className="profile-section-label">
                VITALS
              </div>


              <div className="profile-vitals-grid">

                <div className="profile-field">

                  <label htmlFor="profile-spo2">
                    SpO₂ %
                  </label>

                  <input
                    id="profile-spo2"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    value={
                      draftProfile?.spo2 || ""
                    }
                    onChange={(event) =>
                      updateField(
                        "spo2",
                        event.target.value
                      )
                    }
                    placeholder="--"
                  />

                </div>


                <div className="profile-field">

                  <label htmlFor="profile-heart-rate">
                    HEART RATE
                  </label>

                  <input
                    id="profile-heart-rate"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="250"
                    value={
                      draftProfile?.heartRate ||
                      ""
                    }
                    onChange={(event) =>
                      updateField(
                        "heartRate",
                        event.target.value
                      )
                    }
                    placeholder="BPM"
                  />

                </div>


                <div className="profile-field">

                  <label htmlFor="profile-peak-flow">
                    PEAK FLOW
                  </label>

                  <input
                    id="profile-peak-flow"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="1000"
                    value={
                      draftProfile?.peakFlow || ""
                    }
                    onChange={(event) =>
                      updateField(
                        "peakFlow",
                        event.target.value
                      )
                    }
                    placeholder="L/min"
                  />

                </div>

              </div>


              <div className="profile-actions">

                <button
                  type="button"
                  className="profile-clear-button"
                  onClick={handleClearProfile}
                >
                  Clear
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                >
                  Save Profile
                </button>

              </div>

            </form>

          </div>
        )}

      </div>

    </header>
  );
}