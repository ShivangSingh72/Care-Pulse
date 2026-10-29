import sys

from health_assist.exception import AppException
from health_assist.logger import logger
from health_assist.prediction.prediction import DiseasePredictor
from health_assist.recommendation.recommendation_service import RecommendationService
from health_assist.hospital_service.hospital_locator import HospitalLocator


class HealthService:

    def __init__(self):
        self.predictor = DiseasePredictor()
        self.recommender = RecommendationService()
        self.hospital_locator = HospitalLocator()

    def diagnose(self, symptoms):
        try:
            prediction = self.predictor.predict(symptoms)

            if "error" in prediction:
                return prediction

            disease = prediction["predicted_disease"]

            recommendations = self.recommender.get_recommendations(disease)

            response = {
                "prediction": prediction,
                "top3_predictions": self.predictor.predict_top3(symptoms),
                "recommendations": recommendations
            }

            logger.info(f"Diagnosis completed for {disease}")
            return response

        except Exception as e:
            raise AppException(e, sys)

    def nearby_hospitals(self, location, radius=None):
        """
        radius defaults to None so HospitalLocator falls back to
        MapsConfig.default_radius from config.yaml, instead of a
        second hardcoded value living here too.
        """
        try:
            return self.hospital_locator.find_nearby(location, radius)

        except AppException:
            raise
        except Exception as e:
            raise AppException(e, sys)

    def nearby_hospitals_by_coordinates(self, lat, lon, radius=None):
        """For browser-GPS based lookups, once the frontend supports it."""
        try:
            return self.hospital_locator.find_nearby_coordinates(lat, lon, radius)

        except AppException:
            raise
        except Exception as e:
            raise AppException(e, sys)