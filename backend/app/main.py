from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.session_store import session_store
from app.models import (
    StartSessionRequest,
    StartSessionResponse,
    AnswerRequest,
    AnswerResponse,
    SessionStateResponse,
    DebugStateResponse,
    QuestionPayload
)

app = FastAPI(
    title="Predictive Bot API",
    description="Backend for Predictive Chatbot with Hidden State Tracker and Dynamic Reveal",
    version="1.0.0"
)

# Enable CORS for local dev and mobile browsers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
@app.head("/")
@app.get("/api")
@app.head("/api")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "predictive-bot-api",
        "message": "AURA Predictive Cognition API is live and operational."
    }


@app.post("/api/session/start", response_model=StartSessionResponse)
def start_session(req: StartSessionRequest = StartSessionRequest()):
    session_id = session_store.create_session(
        min_questions=req.min_questions,
        streak_target=req.streak_target
    )
    engine = session_store.get_session(session_id)
    if not engine:
        raise HTTPException(status_code=500, detail="Failed to initialize engine session")

    first_q = engine.get_active_question()
    q_payload = QuestionPayload(**first_q) if first_q else None

    return StartSessionResponse(
        session_id=session_id,
        phase=engine.phase,
        message="Session initialized. Beginning psychometric calibration.",
        question=q_payload
    )


@app.post("/api/session/answer", response_model=AnswerResponse)
def submit_answer(req: AnswerRequest):
    engine = session_store.get_session(req.session_id)
    if not engine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session expired or not found. Please start a new session."
        )

    result = engine.submit_answer(req.choice_index, req.choice_text)

    next_q = engine.get_active_question()
    next_q_payload = QuestionPayload(**next_q) if next_q else None

    # In cognitive forcing trials, return hit details, sealed prediction, and psychological insight
    is_reveal = result.get("is_reveal", False)
    current_streak = result.get("current_streak")
    is_hit = result.get("is_hit")

    return AnswerResponse(
        session_id=req.session_id,
        status=result.get("status", "ok"),
        phase=engine.phase,
        is_reveal=is_reveal,
        message=result.get("message"),
        next_question=next_q_payload,
        reveal_data=result.get("reveal_data"),
        is_hit=is_hit,
        current_streak=current_streak,
        resolved_choice=result.get("resolved_choice"),
        psychological_insight=result.get("psychological_insight"),
        match_confidence=result.get("match_confidence"),
        sealed_prediction=result.get("sealed_prediction"),
        sealed_hash=result.get("sealed_hash"),
        persona=engine.persona,
        cognitive_branch=result.get("cognitive_branch"),
    )


@app.get("/api/session/{session_id}/state", response_model=SessionStateResponse)
def get_session_state(session_id: str):
    engine = session_store.get_session(session_id)
    if not engine:
        raise HTTPException(status_code=404, detail="Session not found")

    active_q = engine.get_active_question()
    q_payload = QuestionPayload(**active_q) if active_q else None

    return SessionStateResponse(
        session_id=session_id,
        phase=engine.phase,
        total_questions=engine.total_questions,
        reveal_triggered=engine.reveal_triggered,
        active_question=q_payload
    )


@app.get("/api/session/{session_id}/debug", response_model=DebugStateResponse)
def get_debug_state(session_id: str):
    engine = session_store.get_session(session_id)
    if not engine:
        raise HTTPException(status_code=404, detail="Session not found")

    return DebugStateResponse(
        session_id=session_id,
        debug_state=engine.get_debug_state()
    )


@app.post("/api/session/{session_id}/reset")
def reset_session(session_id: str, req: StartSessionRequest = StartSessionRequest()):
    success = session_store.reset_session(
        session_id,
        min_questions=req.min_questions,
        streak_target=req.streak_target
    )
    if not success:
        # If session didn't exist, create it anew
        session_store.create_session(req.min_questions, req.streak_target)

    engine = session_store.get_session(session_id)
    first_q = engine.get_active_question() if engine else None
    q_payload = QuestionPayload(**first_q) if first_q else None

    return {
        "status": "reset",
        "session_id": session_id,
        "phase": engine.phase if engine else "profiling",
        "question": q_payload
    }
