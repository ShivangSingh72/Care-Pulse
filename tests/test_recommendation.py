import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]

sys.path.append(str(ROOT_DIR))
sys.path.append(str(ROOT_DIR / "src"))

from health_assist.recommendation.recommendation_service import RecommendationService

service = RecommendationService()

result = service.get_recommendations("common cold")

print(result)

result = service.get_recommendations("xyz_unknown_disease")

print(result)