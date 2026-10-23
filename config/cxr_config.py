import os

# External CXR dataset root.
# This folder stays OUTSIDE the CarePulse OneDrive project.
CXR_DATA_ROOT = os.getenv(
    "CXR_DATA_ROOT",
    r"C:\CarePulseData\mimic_dset\re_512_3ch"
)