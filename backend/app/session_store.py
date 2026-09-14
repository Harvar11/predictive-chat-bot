import uuid
from typing import Dict, Optional
from app.engine import PredictiveEngine


class SessionStore:
    """In-memory session manager for predictive bot instances."""

    def __init__(self):
        self._sessions: Dict[str, PredictiveEngine] = {}

    def create_session(self, min_questions: int = 10, streak_target: int = 3, user_id: Optional[str] = None) -> str:
        session_id = str(uuid.uuid4())
        self._sessions[session_id] = PredictiveEngine(
            session_id=session_id,
            min_questions=min_questions,
            streak_target=streak_target,
            user_id=user_id
        )
        return session_id

    def get_session(self, session_id: str) -> Optional[PredictiveEngine]:
        return self._sessions.get(session_id)

    def reset_session(self, session_id: str, min_questions: int = 10, streak_target: int = 3, user_id: Optional[str] = None) -> bool:
        if session_id in self._sessions:
            self._sessions[session_id] = PredictiveEngine(
                session_id=session_id,
                min_questions=min_questions,
                streak_target=streak_target,
                user_id=user_id
            )
            return True
        return False

    def delete_session(self, session_id: str) -> bool:
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False


# Global singleton instance
session_store = SessionStore()
