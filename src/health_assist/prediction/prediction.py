import pickle
import sys
from pathlib import Path

import numpy as np

from config.configuration import ConfigurationManager
from health_assist.exception import AppException
from health_assist.logger import logger
from health_assist.prediction.symptom_processor import SymptomProcessor


class DiseasePredictor:
    """
    Loads trained ML artifacts and performs disease prediction.
    """

    def __init__(self):
        self.model = None
        self.symptom_columns = None
        self.label_encoder = None

        self._load_artifacts()

    def _load_artifacts(self):
        try:
            config = ConfigurationManager()
            model_config = config.get_model_config()

            with open(Path(model_config.path), "rb") as f:
                self.model = pickle.load(f)

            with open(Path(model_config.symptom_columns), "rb") as f:
                self.symptom_columns = pickle.load(f)

            with open(Path(model_config.label_encoder), "rb") as f:
                self.label_encoder = pickle.load(f)

            logger.info("Prediction artifacts loaded successfully.")

        except Exception as e:
            raise AppException(e, sys)

    def predict(self, selected_symptoms):

        try:
            input_vector, matched_count = SymptomProcessor.create_input_vector(
                selected_symptoms,
                self.symptom_columns
            )

            if matched_count == 0:
                return {
                    "error": "No matching symptoms recognized."
                }

            prediction = self.model.predict(input_vector)[0]

            disease = self.label_encoder.inverse_transform([prediction])[0]

            confidence = 0.0

            if hasattr(self.model, "predict_proba"):
                probabilities = self.model.predict_proba(input_vector)[0]
                confidence = round(float(probabilities[prediction]) * 100, 2)

            logger.info(f"Predicted Disease: {disease}")

            return {
                "predicted_disease": disease,
                "confidence_score": confidence,
                "matched_symptoms_count": matched_count
            }

        except Exception as e:
            raise AppException(e, sys)

    def predict_top3(self, selected_symptoms):
        """
        Return top three predicted diseases with confidence.
        """

        try:
            input_vector, matched_count = SymptomProcessor.create_input_vector(
                selected_symptoms,
                self.symptom_columns
            )

            if matched_count == 0:
                return []

            probabilities = self.model.predict_proba(input_vector)[0]

            top3_idx = np.argsort(probabilities)[::-1][:3]

            return [
                {
                    "disease": self.label_encoder.inverse_transform([i])[0],
                    "confidence": round(float(probabilities[i]) * 100, 2)
                }
                for i in top3_idx
            ]

        except Exception as e:
            raise AppException(e, sys)