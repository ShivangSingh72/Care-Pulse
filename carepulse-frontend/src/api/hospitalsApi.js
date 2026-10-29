import { post } from "./client";

// NOT CONNECTED YET.
// The backend has HospitalLocator / MapsAPI written (hospital_locator.py,
// maps_api.py) but no /hospitals route is exposed in main.py yet — that
// module is paused per the project brief.
//
// This function is wired to call the endpoint under its eventual planned
// shape, so the only change needed later is adding the route on the
// backend. Until then, calling this will fail with a 404 from the API
// client, which HospitalsPage.jsx catches and displays as "not connected"
// rather than a crash.
export function findNearbyHospitals({ location, lat, lon, radius }) {
  if (lat != null && lon != null) {
    return post("/hospitals/by-coordinates", { lat, lon, radius });
  }
  return post("/hospitals", { location, radius });
}
