import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]

sys.path.append(str(ROOT_DIR))
sys.path.append(str(ROOT_DIR / "src"))

from health_assist.hospital_service.maps_api import MapsAPI

coords = MapsAPI.get_coordinates("Lucknow, India")

print("Coordinates:", coords)

if coords:
    hospitals = MapsAPI.nearby_hospitals(coords[0], coords[1], 3000)

    print("Hospitals Found:", len(hospitals))