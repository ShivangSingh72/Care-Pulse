import sys
import joblib
import pandas as pd

from health_assist.constants import ARTIFACTS_DIR
from health_assist.exception import AppException
from health_assist.logger import logger


class WellbeingPredictor:

    def __init__(self):
        try:
            self.model_path = (
                ARTIFACTS_DIR / "wellbeing_model.pkl"
            )

            self.top_countries_path = (
                ARTIFACTS_DIR / "top_countries.pkl"
            )

            self.model = joblib.load(
                self.model_path
            )

            self.top_countries = joblib.load(
                self.top_countries_path
            )

            logger.info(
                "Wellbeing model loaded successfully."
            )

        except Exception as e:
            logger.error(
                "Failed to load wellbeing model."
            )

            raise AppException(
                e,
                sys
            )

    def _group_country(
        self,
        country: str
    ) -> str:

        if country in self.top_countries:
            return country

        return "Other"

    def predict(
        self,
        input_data: dict
    ) -> dict:

        try:
            grouped_country = (
                self._group_country(
                    input_data["Country"]
                )
            )

            data = {
                "Study_Hours": [
                    float(
                        input_data[
                            "Study_Hours"
                        ]
                    )
                ],

                "Age": [
                    int(
                        input_data["Age"]
                    )
                ],

                "Avg_Daily_Usage_Hours": [
                    float(
                        input_data[
                            "Avg_Daily_Usage_Hours"
                        ]
                    )
                ],

                "Daily_Unlocks": [
                    int(
                        input_data[
                            "Daily_Unlocks"
                        ]
                    )
                ],

                "Sleep_Hours_Per_Night": [
                    float(
                        input_data[
                            "Sleep_Hours_Per_Night"
                        ]
                    )
                ],

                "Physical_Activity_Hours": [
                    float(
                        input_data[
                            "Physical_Activity_Hours"
                        ]
                    )
                ],

                # IMPORTANT:
                # Stress_Level must remain a string.
                #
                # Valid values:
                # Low
                # Medium
                # High
                # Very High
                "Stress_Level": [
                    str(
                        input_data[
                            "Stress_Level"
                        ]
                    )
                ],

                "Gender": [
                    str(
                        input_data["Gender"]
                    )
                ],

                "Most_Used_Platform": [
                    str(
                        input_data[
                            "Most_Used_Platform"
                        ]
                    )
                ],

                "Grouped_Country": [
                    grouped_country
                ],

                "Academic_Level": [
                    str(
                        input_data[
                            "Academic_Level"
                        ]
                    )
                ],

                "Purpose_Of_Use": [
                    str(
                        input_data[
                            "Purpose_Of_Use"
                        ]
                    )
                ],
            }

            dataframe = pd.DataFrame(
                data
            )

            prediction = self.model.predict(
                dataframe
            )[0]

            return {
                "predicted_score": float(
                    prediction
                )
            }

        except Exception as e:
            logger.error(
                "Wellbeing prediction failed."
            )

            raise AppException(
                e,
                sys
            )