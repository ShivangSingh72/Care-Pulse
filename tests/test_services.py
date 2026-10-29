import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]

sys.path.append(str(ROOT_DIR))
sys.path.append(str(ROOT_DIR / "src"))

from health_assist.hospital_service.health_service import HealthService

service = HealthService()

result = service.diagnose(["fever", "headache"])

print(result)