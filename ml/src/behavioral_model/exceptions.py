"""Exception hierarchy for the behavioral_model production package.

Kept small and flat on purpose: every input-validation failure is a subclass of
InputValidationError so callers can catch that one type broadly, while artifact
load/consistency failures are a separate ModelArtifactError branch.
"""


class BehavioralModelError(Exception):
    """Base class for every error raised by this package."""


class ModelArtifactError(BehavioralModelError):
    """The joblib model file and/or its metadata JSON could not be loaded, or are
    inconsistent with each other. Raised at load time, never during a prediction."""


class InputValidationError(BehavioralModelError):
    """Base class for all rejected-input errors. Input is never silently coerced,
    defaulted, or dropped -- every violation raises one of these instead."""


class MissingFeatureError(InputValidationError):
    """One or more of the 10 required questions are absent from the input."""


class UnknownFeatureError(InputValidationError):
    """The input contains a field that is not one of the 10 contracted questions."""


class InvalidCategoryError(InputValidationError):
    """A feature's raw value is missing, empty, not a string, or not one of that
    feature's allowed categories (including a value from the wrong response scale)."""
