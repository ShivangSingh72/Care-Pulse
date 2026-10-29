from pathlib import Path
import json

import tensorflow as tf


# --------------------------------------------------
# Paths
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[3]

MODEL_PATH = PROJECT_ROOT / "models" / "cxr_finding_model.keras"
THRESHOLD_PATH = PROJECT_ROOT / "models" / "cxr_thresholds.json"


# --------------------------------------------------
# Configuration
# --------------------------------------------------

IMG_SIZE = 224

# Findings that we are currently comfortable
# exposing in the CarePulse report.
FINDINGS = [
    "pneumonia",
    "pleural_effusion",
    "consolidation",
    "pulmonary_edema",
]

# Pneumothorax is intentionally kept out of the
# user-facing result because the current model's
# test performance is not reliable enough.
MODEL_FINDINGS = [
    "pneumonia",
    "pleural_effusion",
    "pneumothorax",
    "consolidation",
    "pulmonary_edema",
]


# --------------------------------------------------
# Load model
# --------------------------------------------------

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"CXR finding model not found at: {MODEL_PATH}"
    )

model = tf.keras.models.load_model(MODEL_PATH)


# --------------------------------------------------
# Load thresholds
# --------------------------------------------------

if not THRESHOLD_PATH.exists():
    raise FileNotFoundError(
        f"CXR threshold file not found at: {THRESHOLD_PATH}"
    )

with open(THRESHOLD_PATH, "r") as f:
    THRESHOLDS = json.load(f)


# --------------------------------------------------
# Image preprocessing
# --------------------------------------------------

def preprocess_image(image_bytes: bytes):
    """
    Decode and preprocess an uploaded chest X-ray.
    """

    image = tf.io.decode_image(
        image_bytes,
        channels=3,
        expand_animations=False,
    )

    image = tf.image.resize(
        image,
        (IMG_SIZE, IMG_SIZE)
    )

    image = tf.cast(
        image,
        tf.float32
    )

    image = tf.expand_dims(
        image,
        axis=0
    )

    return image


# --------------------------------------------------
# Prediction
# --------------------------------------------------

def predict_cxr_findings(image_bytes: bytes):
    """
    Predict supported radiographic findings.

    The returned score is the model's sigmoid output.
    It is NOT a calibrated medical probability.

    Results are AI-assisted image classification only
    and are not a confirmed diagnosis.
    """

    image = preprocess_image(image_bytes)

    probabilities = model.predict(
        image,
        verbose=0
    )[0]

    findings = []

    for finding in FINDINGS:

        model_index = MODEL_FINDINGS.index(
            finding
        )

        probability = float(
            probabilities[model_index]
        )

        threshold = float(
            THRESHOLDS.get(
                finding,
                0.5
            )
        )

        detected = probability >= threshold

        findings.append(
            {
                "finding": finding,
                "score": round(
                    probability,
                    4
                ),
                "score_percent": round(
                    probability * 100,
                    2
                ),
                "threshold": threshold,
                "detected": bool(detected),
            }
        )

    detected_findings = [
        finding
        for finding in findings
        if finding["detected"]
    ]

    return {
        "findings": findings,
        "detected_findings": detected_findings,
        "model": "EfficientNetB0 CXR Finding Classifier",
        "disclaimer": (
            "AI-assisted image classification only. "
            "These results are model scores, not calibrated "
            "medical probabilities or a confirmed diagnosis. "
            "A qualified healthcare professional should "
            "interpret the medical image."
        ),
    }