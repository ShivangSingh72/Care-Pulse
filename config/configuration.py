import sys
import yaml

from health_assist.constants import CONFIG_FILE_PATH
from health_assist.exception import AppException
from health_assist.logger import logger
from health_assist.entity.config_entity import (
    ModelConfig,
    DataConfig,
    TrainingConfig,
    MapsConfig,
)


class ConfigurationManager:

    def __init__(self, config_filepath=CONFIG_FILE_PATH):
        try:
            with open(config_filepath, "r") as f:
                self.config = yaml.safe_load(f)

            logger.info("Configuration loaded successfully.")

        except Exception as e:
            raise AppException(e, sys)

    def get_model_config(self):

        try:
            cfg = self.config["model"]

            response = ModelConfig(
                path=cfg["path"],
                label_encoder=cfg["label_encoder"],
                symptom_columns=cfg["symptom_columns"],
            )

            logger.info(f"Model Config: {response}")

            return response

        except Exception as e:
            raise AppException(e, sys)

    def get_data_config(self):

        try:
            cfg = self.config["data"]

            response = DataConfig(
                symptoms=cfg["symptoms"],
                descriptions=cfg["descriptions"],
                medications=cfg["medications"],
                precautions=cfg["precautions"],
                workouts=cfg["workouts"],
                diets=cfg["diets"],
            )

            logger.info(f"Data Config: {response}")

            return response

        except Exception as e:
            raise AppException(e, sys)

    def get_training_config(self):

        try:
            cfg = self.config["training"]

            response = TrainingConfig(
                test_size=float(cfg["test_size"]),
                random_state=int(cfg["random_state"]),
            )

            logger.info(f"Training Config: {response}")

            return response

        except Exception as e:
            raise AppException(e, sys)

    def get_maps_config(self):

        try:
            cfg = self.config["maps"]

            response = MapsConfig(
                nominatim_url=cfg["nominatim_url"],
                overpass_url=cfg["overpass_url"],
                user_agent=cfg["user_agent"],
                default_radius=int(cfg["default_radius"]),
                geocode_timeout=int(cfg["geocode_timeout"]),
                overpass_timeout=int(cfg["overpass_timeout"]),
                max_results=int(cfg["max_results"]),
            )

            logger.info(f"Maps Config: {response}")

            return response

        except Exception as e:
            raise AppException(e, sys)
        