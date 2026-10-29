import os
import sys
import yaml
import pickle
from exception import AppException
from logger import logger


def read_yaml_file(file_path: str) -> dict:
    """Reads a YAML file and returns its content as a dictionary."""
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"YAML file not found at: {file_path}")
        with open(file_path, "rb") as yaml_file:
            return yaml.safe_load(yaml_file)
    except Exception as e:
        logger.error(f"Error reading YAML file: {file_path}")
        raise AppException(e, sys)


def save_pickle_object(file_path: str, obj: object) -> None:
    """Serializes and saves a Python object as a pickle file."""
    try:
        dir_path = os.path.dirname(file_path)
        os.makedirs(dir_path, exist_ok=True)
        with open(file_path, "wb") as file_obj:
            pickle.dump(obj, file_obj)
        logger.info(f"Object successfully saved at: {file_path}")
    except Exception as e:
        raise AppException(e, sys)


def load_pickle_object(file_path: str) -> object:
    """Loads and deserializes a pickle object."""
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Pickle file not found at: {file_path}")
        with open(file_path, "rb") as file_obj:
            return pickle.load(file_obj)
    except Exception as e:
        raise AppException(e, sys)