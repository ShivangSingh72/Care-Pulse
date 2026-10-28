import logging
from pathlib import Path
from datetime import datetime

ROOT_DIR = Path(__file__).resolve().parents[2]

LOG_DIR = ROOT_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

CURRENT_TIME_STAMP = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

LOG_FILE_PATH = LOG_DIR / f"log_{CURRENT_TIME_STAMP}.log"

logging.basicConfig(
    filename=LOG_FILE_PATH,
    filemode="w",
    format="[%(asctime)s] %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)

logger = logging.getLogger("CarePulseLogger")