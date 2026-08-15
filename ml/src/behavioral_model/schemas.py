"""Lightweight structures describing the public input/output shape of the model.

These are documentation/typing aids only. They are NOT the source of truth for actual
values -- feature names, allowed categories, ordinal mappings, the semantic-cluster
mapping, and the borderline/unusual-profile thresholds all live in the metadata JSON
produced by ml/notebooks/08_final_model_packaging.ipynb (see inference.DEFAULT_METADATA_PATH).
Duplicating those values here as a second hardcoded copy is exactly what Phase 8's
single-source-of-truth requirement rules out.
"""
from dataclasses import dataclass
from typing import Dict

# {feature_name: raw_category_string}, e.g. {"Eat_WhenAnxious": "Sometimes", ...}
RawAnswers = Dict[str, str]


@dataclass(frozen=True)
class BehavioralClusterResult:
    """The structured result of one prediction. See Task 12 of Phase 8 for the field
    list and, for each field, why it was kept. No probability field exists: KMeans is
    not a calibrated probabilistic model, so none is fabricated."""

    semantic_cluster: str               # 'higher_concern' | 'lower_concern'
    raw_cluster_id: int                 # KMeans' own internal id -- debugging/traceability only
    assignment_strength: float          # geometric distance to the decision boundary, NOT a probability
    distance_to_assigned_centroid: float
    is_borderline: bool
    is_unusual_profile: bool
    model_version: str

    def to_dict(self) -> dict:
        return {
            'semantic_cluster': self.semantic_cluster,
            'raw_cluster_id': self.raw_cluster_id,
            'assignment_strength': self.assignment_strength,
            'distance_to_assigned_centroid': self.distance_to_assigned_centroid,
            'is_borderline': self.is_borderline,
            'is_unusual_profile': self.is_unusual_profile,
            'model_version': self.model_version,
        }
