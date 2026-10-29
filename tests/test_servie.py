import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]

sys.path.append(str(ROOT_DIR))
sys.path.append(str(ROOT_DIR / "src"))

from health_assist.hospital_service.health_service import HealthService

service = HealthService()

print(service.diagnose(["fever", "headache"]))

hospitals = service.nearby_hospitals("Lucknow, India", 3000)

print(type(hospitals))
print(hospitals)