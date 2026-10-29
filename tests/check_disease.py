"""
Checks that every disease the model can predict has recommendation
coverage in each of the 5 recommendation CSVs. Run from project root:

    python tests/check_disease_coverage.py
"""
import sys
from pathlib import Path

import pandas as pd

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))
sys.path.append(str(ROOT_DIR / "src"))

from config.configuration import ConfigurationManager


def normalize(series):
    return set(series.astype(str).str.strip().str.lower())


def main():
    data_config = ConfigurationManager().get_data_config()

    symptoms_df = pd.read_csv(data_config.symptoms)

    # Adjust this if your target column isn't literally named 'diseases'
    disease_col = "diseases" if "diseases" in symptoms_df.columns else symptoms_df.columns[-1]
    model_diseases = normalize(symptoms_df[disease_col])

    print(f"Model can predict {len(model_diseases)} unique diseases.\n")

    recommendation_files = {
        "description.csv": data_config.descriptions,
        "medications.csv": data_config.medications,
        "precautions.csv": data_config.precautions,
        "workout.csv": data_config.workouts,
        "diets.csv": data_config.diets,
    }

    any_gaps = False

    for name, path in recommendation_files.items():
        df = pd.read_csv(path)
        rec_diseases = normalize(df["Disease"])

        missing = sorted(model_diseases - rec_diseases)

        print(f"--- {name} ({len(rec_diseases)} diseases) ---")
        if missing:
            any_gaps = True
            print(f"  MISSING {len(missing)} diseases the model can predict but this file has no row for:")
            for d in missing:
                print(f"    - {d}")
        else:
            print("  OK - full coverage.")
        print()

    if any_gaps:
        print(
            "Some diseases the model can predict have no recommendation row in "
            "one or more files above. RecommendationService will still work "
            "(it returns empty lists for missing categories, not an error), "
            "but the user will see gaps for those specific diseases."
        )
    else:
        print("All recommendation files fully cover every predictable disease.")


if __name__ == "__main__":
    main()