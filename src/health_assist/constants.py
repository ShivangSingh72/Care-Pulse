from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]

CONFIG_DIR = ROOT_DIR / "config"
DATA_DIR = ROOT_DIR / "data"
ARTIFACTS_DIR = ROOT_DIR / "artifacts"

CONFIG_FILE_PATH = CONFIG_DIR / "config.yaml"