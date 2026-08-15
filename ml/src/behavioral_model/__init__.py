"""Production inference package for the Behavioral Profiling K-Means model (Phase 8).

Public API:
    predict_behavioral_cluster(raw_answers: dict) -> dict
    BehavioralClusterModel        -- the underlying loadable model wrapper

This package never trains a model and never reads the raw training CSV -- it only loads
the joblib + metadata artifacts produced by notebooks/08_final_model_packaging.ipynb.
Training and inference are deliberately kept in separate places (Task 20).
"""
from .exceptions import (
    BehavioralModelError,
    InputValidationError,
    InvalidCategoryError,
    MissingFeatureError,
    ModelArtifactError,
    UnknownFeatureError,
)
from .inference import BehavioralClusterModel, predict_behavioral_cluster
from .schemas import BehavioralClusterResult, RawAnswers

__all__ = [
    'BehavioralClusterModel',
    'predict_behavioral_cluster',
    'BehavioralClusterResult',
    'RawAnswers',
    'BehavioralModelError',
    'ModelArtifactError',
    'InputValidationError',
    'MissingFeatureError',
    'UnknownFeatureError',
    'InvalidCategoryError',
]
