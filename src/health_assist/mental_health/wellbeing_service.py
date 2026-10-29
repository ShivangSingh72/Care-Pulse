import sys

from health_assist.exception import AppException
from health_assist.logger import logger
from health_assist.mental_health.predictor import (
    WellbeingPredictor
)


class WellbeingService:

    def __init__(self):
        try:
            self.predictor = WellbeingPredictor()

            logger.info(
                "WellbeingService initialized successfully."
            )

        except Exception as e:
            logger.error(
                "Failed to initialize WellbeingService."
            )

            raise AppException(
                e,
                sys
            )

    def predict_wellbeing(
        self,
        input_data: dict
    ) -> dict:

        try:
            result = self.predictor.predict(
                input_data
            )

            score = round(
                result["predicted_score"],
                2
            )

            return {
                "predicted_score": score
            }

        except Exception as e:
            logger.error(
                "Wellbeing service prediction failed."
            )

            raise AppException(
                e,
                sys
            )