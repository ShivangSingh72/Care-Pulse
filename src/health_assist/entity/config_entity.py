from dataclasses import dataclass


# Model & Artifact Paths
@dataclass
class ModelConfig:
    path: str
    label_encoder: str
    symptom_columns: str


# Dataset Paths
@dataclass
class DataConfig:
    symptoms: str
    descriptions: str
    medications: str
    precautions: str
    workouts: str
    diets: str


# Training Hyperparameters
@dataclass
class TrainingConfig:
    test_size: float
    random_state: int


# Maps / Hospital Locator Settings
@dataclass
class MapsConfig:
    nominatim_url: str
    overpass_url: str
    user_agent: str
    default_radius: int
    geocode_timeout: int
    overpass_timeout: int
    max_results: int
    