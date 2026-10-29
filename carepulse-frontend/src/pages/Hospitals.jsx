import { useMemo, useState } from "react";
import Card from "../components/Card";
import StatusBanner from "../components/StatusBanner";
import {
  IconHospital,
  IconLocation,
  IconPhone,
  IconDirections,
} from "../components/Icons";

// ------------------------------------------------------------
// MOCK DATA
// Replace this with the Google Places API response later.
// The UI should not need to change when the real API is added.
// ------------------------------------------------------------

const MOCK_HOSPITALS = [
  {
    id: "hospital-1",
    name: "CarePulse Regional Medical Center",
    type: "24/7 Emergency",
    address: "Sector 62, Ghaziabad, Uttar Pradesh",
    distance_km: 2.4,
    phone: "+91 98765 43210",
    rating: 4.8,
    rating_count: 1240,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "hospital-2",
    name: "CarePulse Emergency & Trauma Center",
    type: "Emergency & Trauma Care",
    address: "Indirapuram, Ghaziabad, Uttar Pradesh",
    distance_km: 3.1,
    phone: "+91 98765 43211",
    rating: 4.6,
    rating_count: 840,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "hospital-3",
    name: "City General Hospital",
    type: "General Hospital",
    address: "Vaishali, Ghaziabad, Uttar Pradesh",
    distance_km: 4.7,
    phone: "+91 98765 43212",
    rating: 4.5,
    rating_count: 2180,
    emergency: false,
    highlyRated: true,
    open24: true,
  },
  {
    id: "hospital-4",
    name: "Metro Health Care Center",
    type: "Multi-Speciality Hospital",
    address: "Kaushambi, Ghaziabad, Uttar Pradesh",
    distance_km: 6.2,
    phone: "+91 98765 43213",
    rating: 4.4,
    rating_count: 950,
    emergency: true,
    highlyRated: false,
    open24: true,
  },
  {
    id: "hospital-5",
    name: "Sunrise Multi-Speciality Hospital",
    type: "Multi-Speciality",
    address: "Crossings Republik, Ghaziabad, Uttar Pradesh",
    distance_km: 8.4,
    phone: "+91 98765 43214",
    rating: 4.3,
    rating_count: 760,
    emergency: false,
    highlyRated: false,
    open24: false,
  },
  {
    id: "hospital-6",
    name: "Northern India Medical Center",
    type: "General Hospital",
    address: "Raj Nagar, Ghaziabad, Uttar Pradesh",
    distance_km: 11.6,
    phone: "+91 98765 43215",
    rating: 4.2,
    rating_count: 610,
    emergency: true,
    highlyRated: false,
    open24: true,
  },
  {
    id: "hospital-7",
    name: "Green Valley Hospital",
    type: "General Hospital",
    address: "Mohan Nagar, Ghaziabad, Uttar Pradesh",
    distance_km: 14.2,
    phone: "+91 98765 43216",
    rating: 4.1,
    rating_count: 480,
    emergency: false,
    highlyRated: false,
    open24: false,
  },
  {
    id: "hospital-8",
    name: "Advanced Care Hospital",
    type: "Speciality Hospital",
    address: "Sahibabad, Ghaziabad, Uttar Pradesh",
    distance_km: 18.5,
    phone: "+91 98765 43217",
    rating: 4.0,
    rating_count: 390,
    emergency: true,
    highlyRated: false,
    open24: true,
  },
];

const DISTANCE_FILTERS = [
  { id: "all", label: "Any distance" },
  { id: "2", label: "Within 2 km" },
  { id: "5", label: "Within 5 km" },
  { id: "10", label: "Within 10 km" },
  { id: "25", label: "Within 25 km" },
];

const QUICK_FILTERS = [
  { id: "emergency", label: "24/7 Emergency" },
  { id: "highlyRated", label: "Highly Rated" },
  { id: "open24", label: "Open 24/7" },
];

export default function Hospitals() {
  const [location, setLocation] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [distanceFilter, setDistanceFilter] = useState("5");
  const [quickFilters, setQuickFilters] = useState([]);
  const [facilityType, setFacilityType] = useState("All Facilities");
  const [sortBy, setSortBy] = useState("distance");

  const [visibleCount, setVisibleCount] = useState(6);
  const [hasSearched, setHasSearched] = useState(false);
  const [locating, setLocating] = useState(false);

  function runMockSearch(searchLocation) {
    if (!searchLocation.trim()) return;

    setStatus("loading");
    setErrorMessage("");
    setVisibleCount(6);

    // Simulate API response delay.
    setTimeout(() => {
      setLocationLabel(searchLocation.trim());
      setHasSearched(true);
      setStatus("idle");
    }, 450);
  }

  function handleSubmit(event) {
    event.preventDefault();
    runMockSearch(location);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage(
        "Your browser doesn't support location lookup."
      );
      return;
    }

    setLocating(true);
    setStatus("idle");
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      () => {
        setLocating(false);

        // Mock location for UI development.
        // Replace this with the backend coordinates request later.
        setLocation("Current location");
        setLocationLabel("Your current location");
        setHasSearched(true);
        setVisibleCount(6);
      },
      () => {
        setLocating(false);
        setStatus("error");
        setErrorMessage(
          "Couldn't get your location. Check your browser's location permission."
        );
      }
    );
  }

  function toggleQuickFilter(filterId) {
    setQuickFilters((current) =>
      current.includes(filterId)
        ? current.filter((id) => id !== filterId)
        : [...current, filterId]
    );

    setVisibleCount(6);
  }

  const filteredResults = useMemo(() => {
    let results = [...MOCK_HOSPITALS];

    if (distanceFilter !== "all") {
      const maxDistance = Number(distanceFilter);

      results = results.filter(
        (hospital) => hospital.distance_km <= maxDistance
      );
    }

    if (facilityType === "Emergency") {
      results = results.filter((hospital) => hospital.emergency);
    }

    if (facilityType === "Highly Rated") {
      results = results.filter((hospital) => hospital.rating >= 4.5);
    }

    if (facilityType === "Open 24/7") {
      results = results.filter((hospital) => hospital.open24);
    }

    quickFilters.forEach((filter) => {
      if (filter === "emergency") {
        results = results.filter((hospital) => hospital.emergency);
      }

      if (filter === "highlyRated") {
        results = results.filter((hospital) => hospital.highlyRated);
      }

      if (filter === "open24") {
        results = results.filter((hospital) => hospital.open24);
      }
    });

    if (sortBy === "distance") {
      results.sort((a, b) => a.distance_km - b.distance_km);
    }

    if (sortBy === "rating") {
      results.sort((a, b) => b.rating - a.rating);
    }

    if (sortBy === "name") {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    return results;
  }, [
    distanceFilter,
    facilityType,
    quickFilters,
    sortBy,
  ]);

  const visibleResults = filteredResults.slice(0, visibleCount);

  const hasMore = visibleCount < filteredResults.length;

  return (
    <div className="page">
      {/* ---------------------------------------------------- */}
      {/* HEADER */}
      {/* ---------------------------------------------------- */}

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1.5rem",
          alignItems: "flex-start",
          marginBottom: "1.4rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              gap: "0.6rem",
              flexWrap: "wrap",
              marginBottom: "0.65rem",
            }}
          >
            <span
              style={{
                background: "rgba(20, 184, 166, 0.12)",
                color: "var(--primary)",
                borderRadius: "999px",
                padding: "0.35rem 0.7rem",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              EMERGENCY & CLINICAL NETWORK
            </span>

            <span
              style={{
                background: "var(--surface)",
                color: "var(--text-muted)",
                borderRadius: "999px",
                padding: "0.35rem 0.7rem",
                fontSize: "0.72rem",
                fontWeight: 600,
              }}
            >
              Live Location Search
            </span>
          </div>

          <h1 style={{ fontSize: "1.8rem", marginBottom: "0.35rem" }}>
            Nearby Hospitals & Emergency Centers
          </h1>

          <p
            className="page-lead"
            style={{ maxWidth: "720px", marginBottom: 0 }}
          >
            Find nearby hospitals and emergency facilities, compare
            distance and available facility information, and get
            directions or contact details.
          </p>
        </div>

        {/* Emergency banner */}
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            borderRadius: "14px",
            padding: "0.85rem 1rem",
            minWidth: "250px",
            display: "flex",
            alignItems: "center",
            gap: "0.7rem",
          }}
        >
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              background: "#dc2626",
              flexShrink: 0,
            }}
          />

          <div>
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 800,
                color: "#b91c1c",
                letterSpacing: "0.05em",
              }}
            >
              24/7 EMERGENCY
            </div>

            <div
              style={{
                fontWeight: 800,
                fontSize: "0.95rem",
              }}
            >
              Emergency: 112
            </div>

            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
              }}
            >
              For immediate medical emergencies
            </div>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* LOCATION SEARCH */}
      {/* ---------------------------------------------------- */}

      <Card>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(220px, 1.8fr) minmax(170px, 0.9fr) auto auto",
              gap: "0.7rem",
              alignItems: "end",
            }}
          >
            <div className="field">
              <label htmlFor="hospital-location">
                Location
              </label>

              <div style={{ position: "relative" }}>
                <IconLocation
                  width={17}
                  height={17}
                  style={{
                    position: "absolute",
                    left: "0.8rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />

                <input
                  id="hospital-location"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="City, area, address, or landmark"
                  style={{
                    paddingLeft: "2.35rem",
                    width: "100%",
                  }}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="facility-type">
                Facility type
              </label>

              <select
                id="facility-type"
                value={facilityType}
                onChange={(event) =>
                  setFacilityType(event.target.value)
                }
              >
                <option>All Facilities</option>
                <option>Emergency</option>
                <option>Highly Rated</option>
                <option>Open 24/7</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                status === "loading" ||
                !location.trim()
              }
              style={{
                minHeight: "42px",
                whiteSpace: "nowrap",
              }}
            >
              {status === "loading"
                ? "Searching…"
                : "Find Hospitals"}
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={useMyLocation}
              disabled={locating || status === "loading"}
              style={{
                minHeight: "42px",
                whiteSpace: "nowrap",
              }}
            >
              <IconLocation width={16} height={16} />

              {locating ? "Locating…" : "GPS"}
            </button>
          </div>

          {locationLabel && (
            <div
              style={{
                marginTop: "0.85rem",
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
                fontSize: "0.74rem",
                color: "var(--text-muted)",
              }}
            >
              <span>
                <strong style={{ color: "var(--primary)" }}>
                  ●
                </strong>{" "}
                Location confirmed: {locationLabel}
              </span>

              <span>
                Search radius based on selected distance
              </span>
            </div>
          )}
        </form>
      </Card>

      {/* ---------------------------------------------------- */}
      {/* ERRORS */}
      {/* ---------------------------------------------------- */}

      {status === "error" && (
        <StatusBanner tone="error">
          {errorMessage}
        </StatusBanner>
      )}

      {/* ---------------------------------------------------- */}
      {/* RESULTS */}
      {/* ---------------------------------------------------- */}

      {hasSearched && status !== "loading" && (
        <>
          {/* Distance + sorting */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
              marginTop: "1.3rem",
              marginBottom: "0.7rem",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "0.45rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "var(--text-muted)",
                  marginRight: "0.2rem",
                }}
              >
                DISTANCE:
              </span>

              {DISTANCE_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`chip-toggle ${
                    distanceFilter === filter.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    setDistanceFilter(filter.id);
                    setVisibleCount(6);
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Showing {visibleResults.length} of{" "}
                {filteredResults.length}
              </span>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                style={{
                  minHeight: "36px",
                  width: "auto",
                }}
                aria-label="Sort hospitals"
              >
                <option value="distance">
                  Distance (Nearest First)
                </option>
                <option value="rating">
                  Rating (Highest First)
                </option>
                <option value="name">
                  Name (A–Z)
                </option>
              </select>
            </div>
          </div>

          {/* Quick filters */}
          <div
            style={{
              display: "flex",
              gap: "0.45rem",
              flexWrap: "wrap",
              marginBottom: "1.1rem",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 800,
                color: "var(--text-muted)",
                marginRight: "0.15rem",
              }}
            >
              QUICK FILTERS:
            </span>

            {QUICK_FILTERS.map((filter) => {
              const active = quickFilters.includes(filter.id);

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() =>
                    toggleQuickFilter(filter.id)
                  }
                  style={{
                    border: active
                      ? "1px solid var(--primary)"
                      : "1px solid var(--border)",
                    background: active
                      ? "rgba(20, 184, 166, 0.12)"
                      : "var(--surface)",
                    color: active
                      ? "var(--primary)"
                      : "var(--text)",
                    borderRadius: "999px",
                    padding:
                      "0.35rem 0.7rem",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      color: active
                        ? "var(--primary)"
                        : "#94a3b8",
                      marginRight: "0.25rem",
                    }}
                  >
                    ●
                  </span>

                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* ------------------------------------------------ */}
          {/* EMPTY STATE */}
          {/* ------------------------------------------------ */}

          {filteredResults.length === 0 ? (
            <StatusBanner tone="pending">
              No hospitals match the selected filters.
              Try increasing the search distance or
              removing a filter.
            </StatusBanner>
          ) : (
            <>
              {/* -------------------------------------------- */}
              {/* HOSPITAL GRID */}
              {/* -------------------------------------------- */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(340px, 1fr))",
                  gap: "1rem",
                }}
              >
                {visibleResults.map((hospital) => (
                  <Card
                    key={hospital.id}
                    icon={
                      <IconHospital
                        width={18}
                        height={18}
                      />
                    }
                    title={hospital.name}
                    subtitle={hospital.type}
                    right={
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          background:
                            "rgba(20, 184, 166, 0.1)",
                          color: "var(--primary)",
                          borderRadius: "999px",
                          padding:
                            "0.3rem 0.55rem",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        ★ {hospital.rating}
                        <span
                          style={{
                            fontWeight: 600,
                            opacity: 0.7,
                          }}
                        >
                          ({hospital.rating_count})
                        </span>
                      </span>
                    }
                  >
                    {/* Address */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.45rem",
                        marginBottom: "0.45rem",
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <IconLocation
                        width={15}
                        height={15}
                      />

                      <span>
                        {hospital.address}
                      </span>
                    </div>

                    {/* Distance */}
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "var(--primary)",
                        marginBottom: "0.85rem",
                      }}
                    >
                      {hospital.distance_km} km away
                    </div>

                    {/* Information strip */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(3, 1fr)",
                        gap: "0.5rem",
                        background:
                          "rgba(59, 130, 246, 0.07)",
                        borderRadius: "10px",
                        padding: "0.7rem",
                        marginBottom: "0.8rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.62rem",
                            color:
                              "var(--text-muted)",
                            fontWeight: 700,
                          }}
                        >
                          FACILITY
                        </div>

                        <div
                          style={{
                            fontSize: "0.76rem",
                            fontWeight: 700,
                          }}
                        >
                          Hospital
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: "0.62rem",
                            color:
                              "var(--text-muted)",
                            fontWeight: 700,
                          }}
                        >
                          RATING
                        </div>

                        <div
                          style={{
                            fontSize: "0.76rem",
                            fontWeight: 700,
                            color:
                              "var(--primary)",
                          }}
                        >
                          {hospital.rating}/5
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: "0.62rem",
                            color:
                              "var(--text-muted)",
                            fontWeight: 700,
                          }}
                        >
                          ACCESS
                        </div>

                        <div
                          style={{
                            fontSize: "0.76rem",
                            fontWeight: 700,
                          }}
                        >
                          {hospital.open24
                            ? "24/7"
                            : "Standard"}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div
                      style={{
                        display: "flex",
                        gap: "0.4rem",
                        flexWrap: "wrap",
                        marginBottom: "1rem",
                      }}
                    >
                      {hospital.emergency && (
                        <span
                          style={{
                            background:
                              "rgba(239, 68, 68, 0.1)",
                            color: "#b91c1c",
                            borderRadius: "4px",
                            padding:
                              "0.25rem 0.45rem",
                            fontSize: "0.64rem",
                            fontWeight: 700,
                          }}
                        >
                          Emergency Care
                        </span>
                      )}

                      {hospital.open24 && (
                        <span
                          style={{
                            background:
                              "rgba(20, 184, 166, 0.1)",
                            color: "var(--primary)",
                            borderRadius: "4px",
                            padding:
                              "0.25rem 0.45rem",
                            fontSize: "0.64rem",
                            fontWeight: 700,
                          }}
                        >
                          Open 24/7
                        </span>
                      )}

                      {hospital.highlyRated && (
                        <span
                          style={{
                            background:
                              "rgba(59, 130, 246, 0.08)",
                            color: "#2563eb",
                            borderRadius: "4px",
                            padding:
                              "0.25rem 0.45rem",
                            fontSize: "0.64rem",
                            fontWeight: 700,
                          }}
                        >
                          Highly Rated
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div
                      style={{
                        display: "flex",
                        gap: "0.55rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <a
                        className="btn btn-primary"
                        href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.address}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <IconDirections
                          width={16}
                          height={16}
                        />
                        Directions
                      </a>

                      {hospital.phone && (
                        <a
                          className="btn btn-ghost"
                          href={`tel:${hospital.phone}`}
                        >
                          <IconPhone
                            width={16}
                            height={16}
                          />
                          Call
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "1.4rem",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() =>
                      setVisibleCount(
                        (current) => current + 2
                      )
                    }
                  >
                    ↓ Load 2 Additional Facilities
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ---------------------------------------------------- */}
      {/* INITIAL STATE */}
      {/* ---------------------------------------------------- */}

      {!hasSearched && status === "idle" && (
        <div
          style={{
            marginTop: "1.4rem",
            textAlign: "center",
            padding: "3rem 1rem",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 1rem",
              borderRadius: "16px",
              display: "grid",
              placeItems: "center",
              background:
                "rgba(20, 184, 166, 0.1)",
              color: "var(--primary)",
            }}
          >
            <IconHospital
              width={26}
              height={26}
            />
          </div>

          <h2
            style={{
              fontSize: "1.1rem",
              marginBottom: "0.4rem",
            }}
          >
            Find hospitals near you
          </h2>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            Enter a location or use your current GPS
            location to discover nearby healthcare
            facilities.
          </p>
        </div>
      )}
    </div>
  );
}