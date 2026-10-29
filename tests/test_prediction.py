import sys
from pathlib import Path

# Project root
ROOT_DIR = Path(__file__).resolve().parents[1]

# Add both project root and src
sys.path.append(str(ROOT_DIR))
sys.path.append(str(ROOT_DIR / "src"))

from health_assist.prediction.prediction import DiseasePredictor

predictor = DiseasePredictor()

print(predictor.predict(["fever", "headache"]))

print("\nTop 3 Predictions:")
for item in predictor.predict_top3(["fever", "headache"]):
    print(item)