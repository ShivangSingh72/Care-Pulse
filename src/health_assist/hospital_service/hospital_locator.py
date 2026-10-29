import sys
from math import radians, sin, cos, sqrt, atan2

from config.configuration import ConfigurationManager
from health_assist.exception import AppException
from health_assist.logger import logger
from health_assist.entity.config_entity import MapsConfig
from health_assist.hospital_service.maps_api import MapsAPI

EARTH_RADIUS_KM = 6371.0


def _haversine_km(lat1, lon1, lat2, lon2):
    """Great-circle distance in km between two lat/lon points."""
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return EARTH_RADIUS_KM * c


class HospitalLocator:
    """
    Finds nearby hospitals for either a typed location (geocoded via
    Nominatim) or raw GPS coordinates (e.g. from browser geolocation).

    Both entry points always return the same shape:
        {"hospitals": [...], "count": int, "error": str | None}
    so callers (HealthService, Streamlit UI) never have to type-check
    the response.

    Config is self-loaded by default (matches DiseasePredictor /
    RecommendationService, which are both constructed with zero args),
    but can be injected explicitly for testing.
    """

    def __init__(self, config: MapsConfig = None):
        self.config = config or ConfigurationManager().get_maps_config()
        self.maps_api = MapsAPI(self.config)

    def find_nearby(self, location: str, radius: int = None, max_results: int = None):
        """Entry point for a manually typed location string."""
        try:
            coords = self.maps_api.get_coordinates(location)

            if coords is None:
                logger.info(f"Location not found: {location}")
                return {
                    "hospitals": [],
                    "count": 0,
                    "total_found": 0,
                    "error": "Location not found.",
                }

            lat, lon = coords
            return self.find_nearby_coordinates(lat, lon, radius, max_results)

        except AppException:
            raise
        except Exception as e:
            raise AppException(e, sys)

    def find_nearby_coordinates(
        self, lat: float, lon: float, radius: int = None, max_results: int = None
    ):
        """
        Entry point for raw lat/lon, e.g. from browser GPS.

        Results are sorted by distance from (lat, lon) and trimmed to
        the closest `max_results` (defaults to MapsConfig.max_results).
        Distance-based only — OpenStreetMap doesn't carry rating data,
        so "highly rated" filtering isn't available from this source.
        """
        try:
            max_results = max_results or self.config.max_results

            elements = self.maps_api.nearby_hospitals(lat, lon, radius)

            results = []

            for element in elements:
                tags = element.get("tags", {})

                # Nodes have lat/lon directly; ways/relations use 'center'.
                h_lat = element.get("lat") or element.get("center", {}).get("lat")
                h_lon = element.get("lon") or element.get("center", {}).get("lon")

                if h_lat is None or h_lon is None:
                    continue

                distance_km = _haversine_km(lat, lon, h_lat, h_lon)

                results.append({
                    "name": tags.get("name", "Unknown Hospital"),
                    "latitude": h_lat,
                    "longitude": h_lon,
                    "address": tags.get("addr:full") or tags.get("addr:street"),
                    "phone": tags.get("phone") or tags.get("contact:phone"),
                    "distance_km": round(distance_km, 2),
                })

            results.sort(key=lambda h: h["distance_km"])
            closest = results[:max_results]

            logger.info(
                f"{len(results)} hospitals found near ({lat}, {lon}); "
                f"returning closest {len(closest)}."
            )

            return {
                "hospitals": closest,
                "count": len(closest),
                "total_found": len(results),
                "error": None,
            }

        except AppException:
            raise
        except Exception as e:
            raise AppException(e, sys)