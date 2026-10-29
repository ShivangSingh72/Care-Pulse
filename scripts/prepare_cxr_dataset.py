from pathlib import Path
import sys
import zipfile

import pandas as pd


# =========================================================
# PROJECT ROOT
# =========================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Add CarePulse project root to Python import path
# so that "config" can be imported when this script
# is executed directly.
sys.path.insert(0, str(PROJECT_ROOT))


from config.cxr_config import CXR_DATA_ROOT


# =========================================================
# PATHS
# =========================================================

# Original report CSV ZIP
REPORT_ZIP = Path.home() / "Downloads" / "cxr_df.csv.zip"

# External CXR image dataset
# This stays OUTSIDE the CarePulse OneDrive project.
DATASET_ROOT = Path(CXR_DATA_ROOT)

# Small metadata/index file stored inside CarePulse
OUTPUT_DIR = PROJECT_ROOT / "data" / "cxr"
OUTPUT_FILE = OUTPUT_DIR / "cxr_matched.csv"


# =========================================================
# CONFIGURATION
# =========================================================

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
}


# =========================================================
# MAIN
# =========================================================

def main():

    print("=" * 60)
    print("CarePulse - CXR Dataset Preparation")
    print("=" * 60)

    print("\nReport ZIP:")
    print(REPORT_ZIP)

    print("\nCXR dataset:")
    print(DATASET_ROOT)

    print("\nOutput:")
    print(OUTPUT_FILE)

    # =====================================================
    # Validate paths
    # =====================================================

    if not REPORT_ZIP.exists():
        raise FileNotFoundError(
            f"\nReport ZIP not found:\n{REPORT_ZIP}"
        )

    if not DATASET_ROOT.exists():
        raise FileNotFoundError(
            f"\nCXR dataset folder not found:\n{DATASET_ROOT}"
        )

    # =====================================================
    # READ REPORT CSV FROM ZIP
    # =====================================================

    print("\n[1/4] Reading report CSV...")

    with zipfile.ZipFile(REPORT_ZIP, "r") as zip_file:

        csv_files = [
            name
            for name in zip_file.namelist()
            if name.lower().endswith(".csv")
        ]

        if not csv_files:
            raise FileNotFoundError(
                "No CSV file found inside the ZIP."
            )

        csv_name = csv_files[0]

        print(f"CSV inside ZIP: {csv_name}")

        with zip_file.open(csv_name) as file:

            df = pd.read_csv(file)

    print(f"CSV rows: {len(df):,}")

    # =====================================================
    # CHECK REQUIRED COLUMNS
    # =====================================================

    required_columns = {
        "id",
        "text",
    }

    missing_columns = required_columns - set(df.columns)

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    # =====================================================
    # SCAN LOCAL IMAGES
    # =====================================================

    print("\n[2/4] Scanning local CXR images...")

    image_records = []

    for split in ["Train", "Test"]:

        split_dir = DATASET_ROOT / split

        if not split_dir.exists():

            print(
                f"Warning: {split_dir} does not exist."
            )

            continue

        for image_path in split_dir.rglob("*"):

            if image_path.suffix.lower() not in IMAGE_EXTENSIONS:
                continue

            image_id = image_path.stem

            # Portable path.
            # This does NOT contain the absolute CXR dataset path.
            relative_path = (
                f"{split}/{image_path.name}"
            )

            image_records.append(
                {
                    "image_id": image_id,
                    "relative_image_path": relative_path,
                    "split": split,
                }
            )

    images_df = pd.DataFrame(image_records)

    print(
        f"Local images found: {len(images_df):,}"
    )

    # =====================================================
    # CHECK DUPLICATE IMAGE IDs
    # =====================================================

    if not images_df.empty:

        duplicate_ids = images_df[
            images_df["image_id"].duplicated(
                keep=False
            )
        ]

        if not duplicate_ids.empty:

            print(
                "\nWARNING:"
                f" {duplicate_ids['image_id'].nunique():,}"
                " duplicate image IDs found."
            )

            images_df = images_df.drop_duplicates(
                subset="image_id",
                keep="first",
            )

    # =====================================================
    # PREPARE REPORT DATA
    # =====================================================

    print("\n[3/4] Matching reports with local images...")

    reports_df = df[
        ["id", "text"]
    ].copy()

    reports_df = reports_df.rename(
        columns={
            "id": "image_id",
            "text": "report",
        }
    )

    reports_df["image_id"] = (
        reports_df["image_id"]
        .astype(str)
        .str.strip()
    )

    images_df["image_id"] = (
        images_df["image_id"]
        .astype(str)
        .str.strip()
    )

    # =====================================================
    # MATCH
    # =====================================================

    matched_df = images_df.merge(
        reports_df,
        on="image_id",
        how="inner",
    )

    # =====================================================
    # FINAL COLUMN ORDER
    # =====================================================

    matched_df = matched_df[
        [
            "image_id",
            "report",
            "relative_image_path",
            "split",
        ]
    ]

    # =====================================================
    # VALIDATION
    # =====================================================

    duplicate_matched_ids = matched_df[
        matched_df["image_id"].duplicated(
            keep=False
        )
    ]

    if not duplicate_matched_ids.empty:

        raise ValueError(
            "Duplicate image IDs exist in the matched dataset."
        )

    matched_df = (
        matched_df
        .sort_values(
            ["split", "image_id"]
        )
        .reset_index(drop=True)
    )

    # =====================================================
    # SAVE
    # =====================================================

    print(
        "\n[4/4] Saving portable dataset index..."
    )

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    matched_df.to_csv(
        OUTPUT_FILE,
        index=False,
    )

    # =====================================================
    # SUMMARY
    # =====================================================

    train_count = (
        matched_df["split"] == "Train"
    ).sum()

    test_count = (
        matched_df["split"] == "Test"
    ).sum()

    unique_count = (
        matched_df["image_id"].nunique()
    )

    print("\n" + "=" * 60)
    print("DONE")
    print("=" * 60)

    print(
        f"\nMatched image/report pairs: "
        f"{len(matched_df):,}"
    )

    print(
        f"Train: {train_count:,}"
    )

    print(
        f"Test:  {test_count:,}"
    )

    print(
        f"Unique image IDs: "
        f"{unique_count:,}"
    )

    print(
        f"\nSaved to:\n{OUTPUT_FILE}"
    )

    print("\nIMPORTANT:")
    print(
        "The medical images were NOT copied."
    )
    print(
        "The ~8 GB CXR dataset remains outside OneDrive."
    )
    print(
        "Only the small metadata CSV was created inside CarePulse."
    )

    print("\nPortable paths look like:")
    print("Train/s54117358.jpg")
    print("Test/s54117359.jpg")


# =========================================================
# ENTRY POINT
# =========================================================

if __name__ == "__main__":
    main()