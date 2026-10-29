import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

# Make src/ and project root importable, same as test_locator.py
ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))
sys.path.append(str(ROOT_DIR / "src"))

from health_assist.entity.config_entity import MapsConfig
from health_assist.hospital_service.maps_api import MapsAPI
from health_assist.hospital_service.hospital_locator import HospitalLocator
from health_assist.exception import AppException


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def maps_config():
    """A MapsConfig with small, deterministic values for testing."""
    return MapsConfig(
        nominatim_url="https://nominatim.openstreetmap.org/search",
        overpass_url="https://overpass-api.de/api/interpreter",
        user_agent="HealthAssistAI-Test/1.0",
        default_radius=5000,
        geocode_timeout=10,
        overpass_timeout=30,
        max_results=3,
    )


@pytest.fixture
def locator(maps_config):
    """HospitalLocator with config injected directly (no ConfigurationManager/YAML needed)."""
    return HospitalLocator(maps_config)


def _mock_response(json_data, raises=False):
    """Build a fake requests.Response with a canned .json() and .raise_for_status()."""
    mock_resp = MagicMock()
    mock_resp.json.return_value = json_data
    if raises:
        mock_resp.raise_for_status.side_effect = Exception("HTTP error")
    else:
        mock_resp.raise_for_status.return_value = None
    return mock_resp


def _raise_app_exception(*_args, **_kwargs):
    """Helper to raise a properly-formed AppException (needs a real except block for traceback)."""
    try:
        raise Exception("boom")
    except Exception as e:
        raise AppException(e, sys)


# ---------------------------------------------------------------------------
# MapsAPI.get_coordinates
# ---------------------------------------------------------------------------

class TestGetCoordinates:

    @patch("health_assist.services.maps_api.requests.get")
    def test_returns_lat_lon_on_success(self, mock_get, maps_config):
        mock_get.return_value = _mock_response([{"lat": "26.8467", "lon": "80.9462"}])

        api = MapsAPI(maps_config)
        result = api.get_coordinates("Lucknow, India")

        assert result == (26.8467, 80.9462)

    @patch("health_assist.services.maps_api.requests.get")
    def test_returns_none_when_no_results(self, mock_get, maps_config):
        mock_get.return_value = _mock_response([])

        api = MapsAPI(maps_config)
        result = api.get_coordinates("Nowhereville")

        assert result is None

    @patch("health_assist.services.maps_api.requests.get")
    def test_raises_app_exception_on_network_failure(self, mock_get, maps_config):
        mock_get.side_effect = Exception("network down")

        api = MapsAPI(maps_config)

        with pytest.raises(AppException):
            api.get_coordinates("Lucknow, India")

    @patch("health_assist.services.maps_api.requests.get")
    def test_uses_config_values_in_request(self, mock_get, maps_config):
        mock_get.return_value = _mock_response([{"lat": "26.8", "lon": "80.9"}])

        api = MapsAPI(maps_config)
        api.get_coordinates("Lucknow, India")

        _, kwargs = mock_get.call_args
        assert kwargs["headers"]["User-Agent"] == maps_config.user_agent
        assert kwargs["timeout"] == maps_config.geocode_timeout


# ---------------------------------------------------------------------------
# MapsAPI.nearby_hospitals
# ---------------------------------------------------------------------------

class TestNearbyHospitals:

    @patch("health_assist.services.maps_api.requests.post")
    def test_returns_elements(self, mock_post, maps_config):
        mock_post.return_value = _mock_response({
            "elements": [
                {"type": "node", "lat": 26.85, "lon": 80.95, "tags": {"name": "City Hospital"}}
            ]
        })

        api = MapsAPI(maps_config)
        elements = api.nearby_hospitals(26.8467, 80.9462)

        assert len(elements) == 1
        assert elements[0]["tags"]["name"] == "City Hospital"

    @patch("health_assist.services.maps_api.requests.post")
    def test_raises_app_exception_on_http_failure(self, mock_post, maps_config):
        mock_post.return_value = _mock_response({}, raises=True)

        api = MapsAPI(maps_config)

        with pytest.raises(AppException):
            api.nearby_hospitals(26.8467, 80.9462)


# ---------------------------------------------------------------------------
# HospitalLocator.find_nearby (location string entry point)
# ---------------------------------------------------------------------------

class TestFindNearby:

    @patch.object(MapsAPI, "get_coordinates", return_value=None)
    def test_location_not_found_returns_consistent_shape(self, _mock_geocode, locator):
        result = locator.find_nearby("Nowhereville")

        assert result == {
            "hospitals": [],
            "count": 0,
            "total_found": 0,
            "error": "Location not found.",
        }

    @patch.object(MapsAPI, "nearby_hospitals")
    @patch.object(MapsAPI, "get_coordinates", return_value=(26.8467, 80.9462))
    def test_delegates_to_coordinates_lookup(self, _mock_geocode, mock_hospitals, locator):
        mock_hospitals.return_value = [
            {"lat": 26.85, "lon": 80.95, "tags": {"name": "Near Hospital"}},
        ]

        result = locator.find_nearby("Lucknow, India")

        assert result["count"] == 1
        assert result["hospitals"][0]["name"] == "Near Hospital"
        assert result["error"] is None


# ---------------------------------------------------------------------------
# HospitalLocator.find_nearby_coordinates — sorting & limiting
# ---------------------------------------------------------------------------

class TestSortingAndLimit:

    @patch.object(MapsAPI, "nearby_hospitals")
    def test_sorts_by_distance_ascending(self, mock_hospitals, locator):
        origin_lat, origin_lon = 26.8467, 80.9462

        mock_hospitals.return_value = [
            {"lat": 27.5, "lon": 81.5, "tags": {"name": "Far Hospital"}},
            {"lat": 26.85, "lon": 80.95, "tags": {"name": "Close Hospital"}},
            {"lat": 27.0, "lon": 81.0, "tags": {"name": "Mid Hospital"}},
        ]

        result = locator.find_nearby_coordinates(origin_lat, origin_lon)

        names = [h["name"] for h in result["hospitals"]]
        assert names == ["Close Hospital", "Mid Hospital", "Far Hospital"]

        distances = [h["distance_km"] for h in result["hospitals"]]
        assert distances == sorted(distances)

    @patch.object(MapsAPI, "nearby_hospitals")
    def test_limits_to_configured_max_results(self, mock_hospitals, locator):
        # maps_config fixture sets max_results=3; supply 5 candidates
        mock_hospitals.return_value = [
            {"lat": 26.80 + i * 0.01, "lon": 80.90 + i * 0.01, "tags": {"name": f"Hospital {i}"}}
            for i in range(5)
        ]

        result = locator.find_nearby_coordinates(26.8467, 80.9462)

        assert result["count"] == 3
        assert result["total_found"] == 5
        assert len(result["hospitals"]) == 3

    @patch.object(MapsAPI, "nearby_hospitals")
    def test_max_results_can_be_overridden_per_call(self, mock_hospitals, locator):
        mock_hospitals.return_value = [
            {"lat": 26.80 + i * 0.01, "lon": 80.90 + i * 0.01, "tags": {"name": f"Hospital {i}"}}
            for i in range(5)
        ]

        result = locator.find_nearby_coordinates(26.8467, 80.9462, max_results=2)

        assert result["count"] == 2

    @patch.object(MapsAPI, "nearby_hospitals")
    def test_empty_results_still_returns_consistent_shape(self, mock_hospitals, locator):
        mock_hospitals.return_value = []

        result = locator.find_nearby_coordinates(26.8467, 80.9462)

        assert result == {
            "hospitals": [],
            "count": 0,
            "total_found": 0,
            "error": None,
        }


# ---------------------------------------------------------------------------
# HospitalLocator — way/relation coordinate handling
# ---------------------------------------------------------------------------

class TestWayAndRelationCoordinates:

    @patch.object(MapsAPI, "nearby_hospitals")
    def test_uses_center_for_way_and_relation(self, mock_hospitals, locator):
        mock_hospitals.return_value = [
            {
                "type": "way",
                "center": {"lat": 26.85, "lon": 80.95},
                "tags": {"name": "Big Campus Hospital"},
            }
        ]

        result = locator.find_nearby_coordinates(26.8467, 80.9462)

        assert result["hospitals"][0]["name"] == "Big Campus Hospital"
        assert result["hospitals"][0]["latitude"] == 26.85
        assert result["hospitals"][0]["longitude"] == 80.95

    @patch.object(MapsAPI, "nearby_hospitals")
    def test_skips_elements_with_no_usable_coordinates(self, mock_hospitals, locator):
        mock_hospitals.return_value = [
            {"tags": {"name": "No Coords Hospital"}},  # no lat/lon, no center
            {"lat": 26.85, "lon": 80.95, "tags": {"name": "Valid Hospital"}},
        ]

        result = locator.find_nearby_coordinates(26.8467, 80.9462)

        assert result["count"] == 1
        assert result["hospitals"][0]["name"] == "Valid Hospital"

    @patch.object(MapsAPI, "nearby_hospitals")
    def test_defaults_unnamed_hospital(self, mock_hospitals, locator):
        mock_hospitals.return_value = [
            {"lat": 26.85, "lon": 80.95, "tags": {}},  # no 'name' tag
        ]

        result = locator.find_nearby_coordinates(26.8467, 80.9462)

        assert result["hospitals"][0]["name"] == "Unknown Hospital"


# ---------------------------------------------------------------------------
# HospitalLocator — exception propagation (no double-wrapping)
# ---------------------------------------------------------------------------

class TestExceptionPropagation:

    @patch.object(MapsAPI, "get_coordinates", side_effect=_raise_app_exception)
    def test_app_exception_from_geocoding_is_not_double_wrapped(self, _mock_geocode, locator):
        with pytest.raises(AppException) as exc_info:
            locator.find_nearby("Somewhere")

        # Should appear exactly once, not "Error occurred... Error occurred..."
        assert str(exc_info.value).count("Error occurred in python script") == 1
        assert "boom" in str(exc_info.value)

    @patch.object(MapsAPI, "nearby_hospitals", side_effect=_raise_app_exception)
    def test_app_exception_from_hospital_search_is_not_double_wrapped(self, _mock_search, locator):
        with pytest.raises(AppException) as exc_info:
            locator.find_nearby_coordinates(26.8467, 80.9462)

        assert str(exc_info.value).count("Error occurred in python script") == 1


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))