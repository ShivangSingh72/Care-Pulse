import sys
from pathlib import Path

# Add src to Python path
sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from health_assist.exception import AppException

try:
    10 / 0
except Exception as e:
    print(AppException(e, sys))