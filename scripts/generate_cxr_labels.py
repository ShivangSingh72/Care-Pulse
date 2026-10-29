from pathlib import Path
import re
import sys

import pandas as pd


# =========================================================
# PROJECT ROOT
# =========================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


# =========================================================
# PATHS
# =========================================================

INPUT_FILE = (
    PROJECT_ROOT
    / "data"
    / "cxr"
    / "cxr_matched.csv"
)

OUTPUT_FILE = (
    PROJECT_ROOT
    / "data"
    / "cxr"
    / "cxr_labeled.csv"
)


# =========================================================
# FINDING DEFINITIONS
# =========================================================

FINDINGS = {
    "Pneumonia": [
        "pneumonia",
    ],

    "Pleural Effusion": [
        "pleural effusion",
        "pleural fluid",
        "effusions",
    ],

    "Pneumothorax": [
        "pneumothorax",
        "pneumothoraces",
    ],

    "Atelectasis": [
        "atelectasis",
    ],

    "Consolidation": [
        "consolidation",
    ],

    "Pulmonary Edema": [
        "pulmonary edema",
        "pulmonary oedema",
    ],

    "Cardiomegaly": [
        "cardiomegaly",
        "enlarged cardiac silhouette",
        "enlarged heart",
    ],

    "Opacity": [
        "opacity",
        "opacities",
        "opacification",
    ],

    "Nodule": [
        "nodule",
        "nodular",
    ],

    "Mass": [
        "mass",
        "mass-like",
    ],

    "Fracture": [
        "fracture",
        "fractures",
    ],

    "Emphysema": [
        "emphysema",
    ],

    "Fibrosis": [
        "fibrosis",
        "fibrotic",
    ],

    "Pleural Thickening": [
        "pleural thickening",
    ],
}


# =========================================================
# CLASSIFICATION
# =========================================================

UNCERTAIN_PATTERNS = [
    r"\bpossible\b",
    r"\bpossibly\b",
    r"\bmay represent\b",
    r"\bmay be\b",
    r"\bmay develop\b",
    r"\bmay be developing\b",
    r"\bcannot exclude\b",
    r"\bcannot be excluded\b",
    r"\bquestion of\b",
    r"\bsuspicious for\b",
    r"\bsuggestive of\b",
    r"\bconsistent with\b.*\bpossible\b",
    r"\bcoexisting\b.*\bpossible\b",
]


NEGATIVE_PATTERNS = [
    r"\bno evidence of\b",
    r"\bno clear evidence of\b",
    r"\bno\b",
    r"\bwithout\b",
    r"\bnegative for\b",
    r"\babsence of\b",
    r"\babsent\b",
    r"\bnot seen\b",
    r"\bnot identified\b",
    r"\bthere is no\b",
    r"\bthere are no\b",
]


def classify_finding(text, terms):
    """
    Returns:

        1      = Positive
        0      = Explicitly negative
        -1     = Uncertain
        None   = Not mentioned
    """

    if not isinstance(text, str):
        return None

    text = text.lower()

    sentences = re.split(
        r"(?<=[.!?])\s+",
        text,
    )

    for sentence in sentences:

        matched = any(
            re.search(
                r"\b" + re.escape(term) + r"\b",
                sentence,
            )
            for term in terms
        )

        if not matched:
            continue

        # -------------------------------------------------
        # Uncertain
        # -------------------------------------------------

        if any(
            re.search(pattern, sentence)
            for pattern in UNCERTAIN_PATTERNS
        ):
            return -1

        # -------------------------------------------------
        # Negative
        # -------------------------------------------------

        if any(
            re.search(pattern, sentence)
            for pattern in NEGATIVE_PATTERNS
        ):
            return 0

        # -------------------------------------------------
        # Positive
        # -------------------------------------------------

        return 1

    return None


# =========================================================
# MAIN
# =========================================================

def main():

    print("=" * 60)
    print("CarePulse - CXR Weak Label Generation")
    print("=" * 60)

    # -----------------------------------------------------
    # Check input
    # -----------------------------------------------------

    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"\nInput file not found:\n{INPUT_FILE}"
        )

    # -----------------------------------------------------
    # Load dataset
    # -----------------------------------------------------

    print("\n[1/3] Loading matched CXR dataset...")

    df = pd.read_csv(INPUT_FILE)

    print(
        f"Rows loaded: {len(df):,}"
    )

    required_columns = {
        "image_id",
        "report",
        "relative_image_path",
        "split",
    }

    missing_columns = (
        required_columns - set(df.columns)
    )

    if missing_columns:
        raise ValueError(
            f"Missing columns: {missing_columns}"
        )

    # -----------------------------------------------------
    # Generate labels
    # -----------------------------------------------------

    print("\n[2/3] Generating finding labels...")

    for finding, terms in FINDINGS.items():

        print(
            f"  Processing: {finding}"
        )

        column_name = (
            "label_"
            + finding
            .lower()
            .replace(" ", "_")
        )

        df[column_name] = (
            df["report"]
            .fillna("")
            .apply(
                lambda text: classify_finding(
                    text,
                    terms,
                )
            )
        )

    # -----------------------------------------------------
    # Save
    # -----------------------------------------------------

    print("\n[3/3] Saving labeled dataset...")

    df.to_csv(
        OUTPUT_FILE,
        index=False,
    )

    # =====================================================
    # SUMMARY
    # =====================================================

    print("\n" + "=" * 60)
    print("LABEL SUMMARY")
    print("=" * 60)

    label_columns = [
        column
        for column in df.columns
        if column.startswith("label_")
    ]

    summary = []

    for column in label_columns:

        series = df[column]

        positive = (
            series == 1
        ).sum()

        negative = (
            series == 0
        ).sum()

        uncertain = (
            series == -1
        ).sum()

        not_mentioned = (
            series.isna()
        ).sum()

        mentioned = (
            positive
            + negative
            + uncertain
        )

        positive_percentage = (
            positive / mentioned * 100
            if mentioned > 0
            else 0
        )

        summary.append(
            {
                "Finding": column.replace(
                    "label_",
                    "",
                ),
                "Positive": positive,
                "Negative": negative,
                "Uncertain": uncertain,
                "Not Mentioned": not_mentioned,
                "Mentioned": mentioned,
                "Positive % of Mentioned":
                    round(
                        positive_percentage,
                        2,
                    ),
            }
        )

    summary_df = pd.DataFrame(summary)

    print(
        summary_df.to_string(
            index=False
        )
    )

    print("\n" + "=" * 60)

    print(
        f"Labeled dataset saved to:\n"
        f"{OUTPUT_FILE}"
    )

    print(
        "\nIMPORTANT:"
    )

    print(
        "These labels are weak labels extracted "
        "from radiology reports."
    )

    print(
        "They are NOT manually verified ground truth."
    )

    print(
        "Uncertain findings (-1) should not be treated "
        "as positive training labels."
    )

    print("=" * 60)


if __name__ == "__main__":
    main()