import pandas as pd


class SymptomProcessor:
    """
    Converts user-selected symptoms into the feature vector
    expected by the trained model.
    """

    @staticmethod
    def create_input_vector(selected_symptoms, symptom_columns):
        # Create a one-row DataFrame with all symptoms initialized to 0
        input_vector = pd.DataFrame(
            [[0] * len(symptom_columns)],
            columns=symptom_columns
        )

        # Map lowercase symptom names to original column names
        feature_map = {
            col.strip().lower(): col
            for col in symptom_columns
        }

        matched_count = 0

        # Mark selected symptoms as present
        for symptom in selected_symptoms:
            symptom = symptom.strip().lower()

            if symptom in feature_map:
                input_vector.loc[0, feature_map[symptom]] = 1
                matched_count += 1

        return input_vector, matched_count