import sys

from health_assist.exception import AppException
from health_assist.logger import logger
from health_assist.recommendation.data_loader import DataLoader


class RecommendationService:
    """
    Returns all health recommendations for a disease.
    """

    def __init__(self):
        self.data = DataLoader()

    def _find_row(self, dataframe, disease):
        row = dataframe[dataframe["Disease"] == disease.strip().lower()]

        if row.empty:
            return None

        return row.iloc[0]

    def get_recommendations(self, disease):
        try:
            description = self._find_row(self.data.description_df, disease)
            medication = self._find_row(self.data.medication_df, disease)
            precaution = self._find_row(self.data.precaution_df, disease)
            workout = self._find_row(self.data.workout_df, disease)
            diet = self._find_row(self.data.diet_df, disease)

            precautions = []

            if precaution is not None:
                for col in precaution.index:
                    if col.lower().startswith("precaution"):
                        value = precaution[col]
                        if isinstance(value, str) and value.strip():
                            precautions.append(value)

            found = any(
                x is not None
                for x in [description, medication, precaution, workout, diet]
            )

            logger.info(f"Recommendations fetched for {disease} (found={found})")

            return {
                "found": found,
                "description": None if description is None else description[self.data.description_col],
                "medications": [] if medication is None else medication["Medication"],
                "precautions": precautions,
                "workouts": [] if workout is None else workout[self.data.workout_col],
                "diet": [] if diet is None else diet[self.data.diet_col],
            }

        except AppException:
            raise
        except Exception as e:
            raise AppException(e, sys)