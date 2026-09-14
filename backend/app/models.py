from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class StartSessionRequest(BaseModel):
    min_questions: int = Field(default=10, ge=1, le=50)
    streak_target: int = Field(default=3, ge=1, le=10)
    user_id: Optional[str] = None


class QuestionPayload(BaseModel):
    question_id: str
    phase: str
    step_number: int
    category: str
    question: str
    options: List[str]
    total_steps: Optional[int] = None
    min_questions: Optional[int] = None
    streak_target: Optional[int] = None
    input_mode: str = "both"  # "freeform" | "choice" | "both"
    placeholder: Optional[str] = "Type your immediate thought..."
    sealed_hash: Optional[str] = None
    priming_steps: Optional[List[str]] = None
    persona: Optional[str] = None
    cognitive_branch: Optional[str] = None


class StartSessionResponse(BaseModel):
    session_id: str
    phase: str
    message: str
    question: Optional[QuestionPayload] = None
    user_profile: Optional[Dict[str, Any]] = None
    user_memory: Optional[Dict[str, Any]] = None
    model_version: Optional[str] = None


class AnswerRequest(BaseModel):
    session_id: str
    choice_index: Optional[int] = None
    choice_text: Optional[str] = None
    user_id: Optional[str] = None


class AnswerResponse(BaseModel):
    session_id: str
    status: str
    phase: str
    is_reveal: bool
    message: Optional[str] = None
    next_question: Optional[QuestionPayload] = None
    reveal_data: Optional[Dict[str, Any]] = None
    is_hit: Optional[bool] = None
    current_streak: Optional[int] = None
    resolved_choice: Optional[str] = None
    psychological_insight: Optional[str] = None
    match_confidence: Optional[str] = None
    sealed_prediction: Optional[str] = None
    sealed_hash: Optional[str] = None
    persona: Optional[str] = None
    cognitive_branch: Optional[str] = None
    evolution_event: Optional[Dict[str, Any]] = None
    model_version: Optional[str] = None
    user_memory: Optional[Dict[str, Any]] = None


class SessionStateResponse(BaseModel):
    session_id: str
    phase: str
    total_questions: int
    reveal_triggered: bool
    active_question: Optional[QuestionPayload] = None


class DebugStateResponse(BaseModel):
    session_id: str
    debug_state: Dict[str, Any]


class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    user_id: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    password: Optional[str] = None


class UserProfileResponse(BaseModel):
    user_id: str
    name: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    master_persona: Optional[str] = None
    total_trials: int = 0
    total_hits: int = 0
    accuracy_percent: float = 0.0
    memory_summary: Optional[str] = None
    recent_trials: Optional[List[Dict[str, Any]]] = None


class ModelEvolutionResponse(BaseModel):
    generation: int
    version: str
    total_inputs_absorbed: int
    learned_synonyms_count: int
    learned_synonyms: Optional[Dict[str, List[str]]] = None
    last_upgraded_at: Optional[float] = None

