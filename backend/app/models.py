from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class StartSessionRequest(BaseModel):
    min_questions: int = Field(default=10, ge=1, le=50)
    streak_target: int = Field(default=3, ge=1, le=10)


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


class StartSessionResponse(BaseModel):
    session_id: str
    phase: str
    message: str
    question: Optional[QuestionPayload] = None


class AnswerRequest(BaseModel):
    session_id: str
    choice_index: Optional[int] = None
    choice_text: Optional[str] = None


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


class SessionStateResponse(BaseModel):
    session_id: str
    phase: str
    total_questions: int
    reveal_triggered: bool
    active_question: Optional[QuestionPayload] = None


class DebugStateResponse(BaseModel):
    session_id: str
    debug_state: Dict[str, Any]
