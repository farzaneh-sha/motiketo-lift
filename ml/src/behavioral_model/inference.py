"""Production inference for the Behavioral Profiling K-Means model (Phase 8).

This module NEVER trains a model and NEVER reads the raw training CSV. It only loads a
pre-fit `joblib` artifact plus its metadata JSON -- the single source of truth for
feature names, feature order, ordinal mappings, the semantic-cluster mapping, and the
borderline / unusual-profile thresholds -- and turns one new user's 10 raw categorical
answers into a structured cluster assignment.

Security note: `joblib.load` can execute arbitrary code for a maliciously-crafted file.
Only ever load the artifact this project's own training notebook produced. Never load a
`.joblib` file uploaded by a user or fetched from an untrusted/unknown source.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Optional

import joblib
import numpy as np

from .exceptions import (
    InvalidCategoryError,
    MissingFeatureError,
    ModelArtifactError,
    UnknownFeatureError,
)
from .schemas import BehavioralClusterResult, RawAnswers

_PACKAGE_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MODEL_DIR = _PACKAGE_ROOT / 'production'
DEFAULT_MODEL_PATH = DEFAULT_MODEL_DIR / 'behavioral_kmeans_v1.joblib'
DEFAULT_METADATA_PATH = DEFAULT_MODEL_DIR / 'behavioral_model_metadata_v1.json'

_REQUIRED_METADATA_KEYS = {
    'model_version', 'feature_order', 'ordinal_mappings',
    'semantic_mapping', 'cluster_centers',
    'borderline_threshold', 'unusual_profile_threshold',
}


class BehavioralClusterModel:
    """Wraps a fitted 2-cluster K-Means model plus its metadata for safe, reproducible
    production inference. Construct via `BehavioralClusterModel.load(...)`, not directly."""

    def __init__(self, kmeans_model, metadata: dict):
        missing_keys = _REQUIRED_METADATA_KEYS - metadata.keys()
        if missing_keys:
            raise ModelArtifactError(f"Metadata is missing required keys: {sorted(missing_keys)}")

        self._kmeans = kmeans_model
        self._metadata = metadata
        self._feature_order = list(metadata['feature_order'])
        self._ordinal_mappings = metadata['ordinal_mappings']
        self._semantic_mapping = {int(k): v for k, v in metadata['semantic_mapping'].items()}
        self._centers = np.asarray(metadata['cluster_centers'], dtype=float)
        self._borderline_threshold = float(metadata['borderline_threshold'])
        self._unusual_threshold = float(metadata['unusual_profile_threshold'])
        self._model_version = metadata['model_version']

        n_features = len(self._feature_order)
        model_centers = np.asarray(kmeans_model.cluster_centers_, dtype=float)
        if model_centers.shape != (2, n_features):
            raise ModelArtifactError(
                f"Loaded KMeans has cluster_centers_ shape {model_centers.shape}, "
                f"expected (2, {n_features}) from metadata's feature_order."
            )
        if not np.allclose(model_centers, self._centers, atol=1e-8):
            raise ModelArtifactError(
                "Metadata 'cluster_centers' do not match the loaded model's cluster_centers_ "
                "-- the joblib file and the metadata JSON appear to come from different training runs."
            )
        if set(self._semantic_mapping) != {0, 1}:
            raise ModelArtifactError(f"semantic_mapping must cover raw cluster ids {{0, 1}}, got {set(self._semantic_mapping)}")
        if set(self._ordinal_mappings) != set(self._feature_order):
            raise ModelArtifactError("ordinal_mappings keys do not match feature_order exactly.")

    @classmethod
    def load(
        cls,
        model_path: Path | str = DEFAULT_MODEL_PATH,
        metadata_path: Path | str = DEFAULT_METADATA_PATH,
    ) -> 'BehavioralClusterModel':
        model_path = Path(model_path)
        metadata_path = Path(metadata_path)

        if not model_path.exists():
            raise ModelArtifactError(f"Model file not found: {model_path}")
        if not metadata_path.exists():
            raise ModelArtifactError(f"Metadata file not found: {metadata_path}")

        try:
            kmeans_model = joblib.load(model_path)
        except Exception as exc:  # noqa: BLE001 -- deliberately broad: any load failure is an artifact error
            raise ModelArtifactError(f"Failed to load model artifact '{model_path}': {exc}") from exc

        try:
            with open(metadata_path, encoding='utf-8') as f:
                metadata = json.load(f)
        except Exception as exc:  # noqa: BLE001
            raise ModelArtifactError(f"Failed to load/parse metadata artifact '{metadata_path}': {exc}") from exc

        return cls(kmeans_model, metadata)

    @property
    def feature_order(self) -> list:
        return list(self._feature_order)

    @property
    def model_version(self) -> str:
        return self._model_version

    @property
    def metadata(self) -> dict:
        return dict(self._metadata)

    def _validate_and_encode(self, raw_answers: RawAnswers) -> np.ndarray:
        if not isinstance(raw_answers, dict):
            raise InvalidCategoryError(f"raw_answers must be a dict, got {type(raw_answers).__name__}")

        provided = set(raw_answers)
        expected = set(self._feature_order)

        missing = expected - provided
        if missing:
            raise MissingFeatureError(f"Missing required answers: {sorted(missing)}")

        extra = provided - expected
        if extra:
            raise UnknownFeatureError(f"Unexpected fields not in the 10-question contract: {sorted(extra)}")

        encoded = np.empty(len(self._feature_order), dtype=float)
        for i, feature in enumerate(self._feature_order):  # fixed, correct feature ordering -- ignores dict order
            value = raw_answers[feature]
            if value is None:
                raise InvalidCategoryError(f"'{feature}': value is None, which is not an allowed category.")
            if not isinstance(value, str) or value == '':
                raise InvalidCategoryError(f"'{feature}': value must be a non-empty string, got {value!r}.")
            mapping = self._ordinal_mappings[feature]
            if value not in mapping:  # exact match only -- no case/whitespace normalization (Task 6)
                raise InvalidCategoryError(
                    f"Unknown category for '{feature}': {value!r}. Allowed values: {list(mapping)}"
                )
            encoded[i] = mapping[value]
        return encoded.reshape(1, -1)

    def predict(self, raw_answers: RawAnswers) -> dict:
        """Full pipeline: validate -> encode -> order -> predict -> semantic map ->
        boundary distance -> nearest-centroid distance -> borderline/unusual flags."""
        x = self._validate_and_encode(raw_answers)

        raw_cluster_id = int(self._kmeans.predict(x)[0])
        distances_to_each_center = np.linalg.norm(x - self._centers, axis=1)
        distance_to_assigned = float(distances_to_each_center[raw_cluster_id])

        c0, c1 = self._centers[0], self._centers[1]
        w = c1 - c0
        midpoint = (c0 + c1) / 2.0
        norm_w = np.linalg.norm(w)
        signed_boundary_distance = float(((x - midpoint) @ w / norm_w)[0])
        assignment_strength = abs(signed_boundary_distance)  # a DISTANCE, not a probability

        result = BehavioralClusterResult(
            semantic_cluster=self._semantic_mapping[raw_cluster_id],
            raw_cluster_id=raw_cluster_id,
            assignment_strength=assignment_strength,
            distance_to_assigned_centroid=distance_to_assigned,
            is_borderline=assignment_strength <= self._borderline_threshold,
            is_unusual_profile=distance_to_assigned >= self._unusual_threshold,
            model_version=self._model_version,
        )
        return result.to_dict()


_default_model: Optional[BehavioralClusterModel] = None


def _get_default_model() -> BehavioralClusterModel:
    global _default_model
    if _default_model is None:
        _default_model = BehavioralClusterModel.load()
    return _default_model


def predict_behavioral_cluster(raw_answers: RawAnswers, model: Optional[BehavioralClusterModel] = None) -> dict:
    """Public convenience function. Uses a lazily-loaded, process-wide default model
    (loaded once from ml/production/) unless an explicit `model` is passed in --
    pass one explicitly in tests so each test controls exactly which artifact is used."""
    active_model = model or _get_default_model()
    return active_model.predict(raw_answers)
