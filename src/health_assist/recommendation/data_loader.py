import ast
import sys
import pandas as pd

from config.configuration import ConfigurationManager
from health_assist.exception import AppException
from health_assist.logger import logger


def _safe_literal_eval(value):
    """
    Parse a stringified Python list (e.g. "['A', 'B']") safely.
    Returns [] for NaN/blank/unparseable values instead of crashing
    the whole DataLoader on one bad row.
    """
    if isinstance(value, list):
        return value

    if not isinstance(value, str) or not value.strip():
        return []

    try:
        parsed = ast.literal_eval(value)
        return parsed if isinstance(parsed, list) else [parsed]
    except (ValueError, SyntaxError):
        logger.warning(f"Could not parse list value, defaulting to []: {value!r}")
        return []


def _get_value_column(df, name_for_error, exclude="Disease"):
    """
    Datasets like description/workout/diet only have two columns:
    Disease + one value column. Rather than hardcoding the exact
    header text (which we haven't verified against the real CSVs),
    detect it: whatever isn't 'Disease' is the value column.
    """
    candidates = [c for c in df.columns if c != exclude]

    if len(candidates) != 1:
        raise ValueError(
            f"{name_for_error}: expected exactly one non-Disease column, "
            f"found {candidates}. Check the CSV headers."
        )

    return candidates[0]


class DataLoader:
    """
    Loads and prepares all recommendation datasets.
    """

    def __init__(self):
        try:
            config = ConfigurationManager()
            data_config = config.get_data_config()

            self.description_df = pd.read_csv(data_config.descriptions)
            self.medication_df = pd.read_csv(data_config.medications)
            self.precaution_df = pd.read_csv(data_config.precautions)
            self.workout_df = pd.read_csv(data_config.workouts)
            self.diet_df = pd.read_csv(data_config.diets)

            # Auto-detected value column names (see _get_value_column docstring).
            # RecommendationService reads these instead of hardcoding strings.
            self.description_col = _get_value_column(self.description_df, "description.csv")
            self.workout_col = _get_value_column(self.workout_df, "workout.csv")
            self.diet_col = _get_value_column(self.diet_df, "diets.csv")

            self._clean_disease_names()
            self._convert_list_columns()

            logger.info(
                "Recommendation datasets loaded successfully. "
                f"description_col={self.description_col!r}, "
                f"workout_col={self.workout_col!r}, "
                f"diet_col={self.diet_col!r}"
            )

        except Exception as e:
            raise AppException(e, sys)

    def _clean_disease_names(self):
        datasets = [
            self.description_df,
            self.medication_df,
            self.precaution_df,
            self.workout_df,
            self.diet_df,
        ]

        for df in datasets:
            df["Disease"] = df["Disease"].astype(str).str.strip().str.lower()

    def _convert_list_columns(self):
        # Medication is confirmed to be a stringified list from the sample CSV.
        if "Medication" in self.medication_df.columns:
            self.medication_df["Medication"] = self.medication_df["Medication"].apply(
                _safe_literal_eval
            )

        # Workout/Diet are documented as *possibly* stringified lists (section 3
        # of the handoff). Safe to attempt parsing either way: a plain string
        # that isn't a list literal falls through _safe_literal_eval's except
        # and would return [] — so only apply this if the column really does
        # contain list-like strings. Detect that from the first non-null value.
        self._maybe_convert_to_list(self.workout_df, self.workout_col)
        self._maybe_convert_to_list(self.diet_df, self.diet_col)

    @staticmethod
    def _maybe_convert_to_list(df, column):
        sample = df[column].dropna().astype(str).head(1)

        looks_like_list = (
            not sample.empty and sample.iloc[0].strip().startswith("[")
        )

        if looks_like_list:
            df[column] = df[column].apply(_safe_literal_eval)