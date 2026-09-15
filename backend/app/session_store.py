import time
import uuid
from typing import Dict, Optional
from app.engine import PredictiveEngine


class SessionStore:
    """In-memory session manager for predictive bot instances with TTL cleanup and recovery."""

    def __init__(self):
        self._sessions: Dict[str, PredictiveEngine] = {}
        self._last_active: Dict[str, float] = {}
        self._created_at: Dict[str, float] = {}

    def create_session(self, min_questions: int = 10, streak_target: int = 3, user_id: Optional[str] = None) -> str:
        self.cleanup_expired_sessions(max_age_seconds=7200)
        session_id = str(uuid.uuid4())
        now = time.time()
        self._sessions[session_id] = PredictiveEngine(
            session_id=session_id,
            min_questions=min_questions,
            streak_target=streak_target,
            user_id=user_id
        )
        self._last_active[session_id] = now
        self._created_at[session_id] = now
        return session_id

    def get_session(self, session_id: str) -> Optional[PredictiveEngine]:
        if session_id in self._sessions:
            self._last_active[session_id] = time.time()
            return self._sessions[session_id]
        return None

    def recover_session(self, session_id: str, min_questions: int = 10, streak_target: int = 3, user_id: Optional[str] = None) -> PredictiveEngine:
        """Gracefully re-hydrates an engine session if evicted or after server restart."""
        now = time.time()
        engine = PredictiveEngine(
            session_id=session_id,
            min_questions=min_questions,
            streak_target=streak_target,
            user_id=user_id
        )
        self._sessions[session_id] = engine
        self._last_active[session_id] = now
        self._created_at[session_id] = now
        return engine

    def reset_session(self, session_id: str, min_questions: int = 10, streak_target: int = 3, user_id: Optional[str] = None) -> bool:
        now = time.time()
        self._sessions[session_id] = PredictiveEngine(
            session_id=session_id,
            min_questions=min_questions,
            streak_target=streak_target,
            user_id=user_id
        )
        self._last_active[session_id] = now
        self._created_at[session_id] = now
        return True

    def delete_session(self, session_id: str) -> bool:
        deleted = False
        if session_id in self._sessions:
            del self._sessions[session_id]
            deleted = True
        self._last_active.pop(session_id, None)
        self._created_at.pop(session_id, None)
        return deleted

    def cleanup_expired_sessions(self, max_age_seconds: int = 7200) -> int:
        """Prunes inactive sessions older than max_age_seconds (default 2 hours)."""
        now = time.time()
        expired = [
            sid for sid, last_seen in self._last_active.items()
            if (now - last_seen) > max_age_seconds
        ]
        for sid in expired:
            self._sessions.pop(sid, None)
            self._last_active.pop(sid, None)
            self._created_at.pop(sid, None)
        return len(expired)


# Global singleton instance
session_store = SessionStore()
