import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))
sys.path.append(str(ROOT_DIR / "src"))

from health_assist.prediction.prediction import DiseasePredictor
from health_assist.recommendation.recommendation_service import RecommendationService

predictor = DiseasePredictor()
service = RecommendationService()

prediction = predictor.predict(["fever", "headache"])

print("Prediction:")
print(prediction)

if "predicted_disease" in prediction:
    recommendations = service.get_recommendations(
        prediction["predicted_disease"]
    )

    print("\nRecommendations:")
    print(recommendations)