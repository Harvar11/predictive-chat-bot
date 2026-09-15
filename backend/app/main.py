import os
import json
import base64
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.session_store import session_store
from app.database import (
    init_db,
    get_or_create_user,
    get_user_memory,
    get_model_evolution,
    register_user,
    login_user
)
from app.models import (
    StartSessionRequest,
    StartSessionResponse,
    AnswerRequest,
    AnswerResponse,
    SessionStateResponse,
    DebugStateResponse,
    QuestionPayload,
    GoogleAuthRequest,
    RegisterRequest,
    LoginRequest,
    UserProfileResponse,
    ModelEvolutionResponse
)

app = FastAPI(
    title="CLAIRVOYANT Predictive Cognition API",
    description="Backend for CLAIRVOYANT Predictive Chatbot with Persistent User Memory, Self-Upgrading Learning Loop, and Mind-Peek Telemetry",
    version="2.0.0"
)

@app.on_event("startup")
def on_startup():
    init_db()

# Enable CORS for local dev and mobile browsers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api")
@app.head("/api")
@app.get("/api/health")
@app.head("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "clairvoyant-api",
        "message": "CLAIRVOYANT Predictive Cognition API is live and operational."
    }


@app.post("/api/auth/register", response_model=UserProfileResponse)
def register_endpoint(req: RegisterRequest):
    """
    Dedicated user registration endpoint.
    Validates unique email and unique username with PBKDF2 encryption.
    """
    try:
        user_data = register_user(
            email=req.email,
            password=req.password,
            username=req.username,
            name=req.name,
            avatar_url=req.avatar_url
        )
    except ValueError as val_err:
        err_msg = str(val_err)
        if err_msg == "EMAIL_ALREADY_REGISTERED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This email is already registered. Please log in or use another email."
            )
        elif err_msg == "USERNAME_ALREADY_TAKEN":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This username is already taken. Please choose another username."
            )
        elif err_msg == "INVALID_EMAIL":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please enter a valid email address."
            )
        elif err_msg == "INVALID_USERNAME":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username must be 3-30 characters (letters, numbers, underscore, hyphen)."
            )
        elif err_msg == "PASSWORD_TOO_SHORT":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg
        )

    user_memory = get_user_memory(user_data["user_id"])
    return UserProfileResponse(
        user_id=user_data["user_id"],
        username=user_data.get("username"),
        name=user_data["name"] or user_data.get("username") or "Cognitive Explorer",
        email=user_data.get("email"),
        avatar_url=user_data.get("avatar_url"),
        master_persona=user_data.get("master_persona"),
        total_trials=user_memory.get("total_trials", 0),
        total_hits=user_memory.get("total_hits", 0),
        accuracy_percent=user_memory.get("accuracy_percent", 0.0),
        memory_summary=user_data.get("memory_summary"),
        recent_trials=user_memory.get("recent_trials", [])
    )


@app.post("/api/auth/login", response_model=UserProfileResponse)
def login_endpoint(req: LoginRequest):
    """
    Dedicated user login endpoint accepting either registered email or username with password.
    """
    try:
        user_data = login_user(identifier=req.identifier, password=req.password)
    except ValueError as val_err:
        err_msg = str(val_err)
        if err_msg in ("ACCOUNT_NOT_FOUND", "INVALID_PASSWORD"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email/username or password. Please check your credentials."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg
        )

    user_memory = get_user_memory(user_data["user_id"])
    return UserProfileResponse(
        user_id=user_data["user_id"],
        username=user_data.get("username"),
        name=user_data["name"] or user_data.get("username") or "Cognitive Explorer",
        email=user_data.get("email"),
        avatar_url=user_data.get("avatar_url"),
        master_persona=user_data.get("master_persona"),
        total_trials=user_memory.get("total_trials", 0),
        total_hits=user_memory.get("total_hits", 0),
        accuracy_percent=user_memory.get("accuracy_percent", 0.0),
        memory_summary=user_data.get("memory_summary"),
        recent_trials=user_memory.get("recent_trials", [])
    )


@app.post("/api/auth/google", response_model=UserProfileResponse)
def google_auth(req: GoogleAuthRequest):
    """
    Google Sign-In Handler.
    Supports official Google GSI JWT tokens as well as lightweight local logins.
    """
    user_id = req.user_id
    email = req.email
    name = req.name
    avatar_url = req.picture

    # If official Google Identity Services credential token is provided, decode payload
    if req.credential:
        try:
            parts = req.credential.split(".")
            if len(parts) >= 2:
                # Add padding if needed
                payload_b64 = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
                payload_json = base64.urlsafe_b64decode(payload_b64).decode("utf-8")
                payload = json.loads(payload_json)

                user_id = f"google_{payload.get('sub')}"
                email = payload.get("email")
                name = payload.get("name")
                avatar_url = payload.get("picture")
        except Exception as e:
            pass  # Fall back to supplied fields if JWT decode fails

    if not user_id:
        clean_key = (email or name or 'guest').lower()
        user_id = f"google_{hashlib.md5(clean_key.encode('utf-8')).hexdigest()[:12]}"

    try:
        user_data = get_or_create_user(
            user_id=user_id,
            email=email,
            name=name,
            avatar_url=avatar_url,
            password=req.password
        )
    except ValueError as val_err:
        if str(val_err) == "INVALID_PASSWORD":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password for this account. Please enter the correct password."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    user_memory = get_user_memory(user_data["user_id"])

    return UserProfileResponse(
        user_id=user_data["user_id"],
        username=user_data.get("username"),
        name=user_data["name"] or user_data.get("username") or "Cognitive Explorer",
        email=user_data.get("email"),
        avatar_url=user_data.get("avatar_url"),
        master_persona=user_data.get("master_persona"),
        total_trials=user_memory.get("total_trials", 0),
        total_hits=user_memory.get("total_hits", 0),
        accuracy_percent=user_memory.get("accuracy_percent", 0.0),
        memory_summary=user_data.get("memory_summary"),
        recent_trials=user_memory.get("recent_trials", [])
    )


@app.get("/api/user/{user_id}/memory", response_model=UserProfileResponse)
def get_user_profile(user_id: str):
    memory = get_user_memory(user_id)
    if not memory.get("exists"):
        raise HTTPException(status_code=404, detail="User memory not found")

    return UserProfileResponse(
        user_id=memory["user_id"],
        username=memory.get("username"),
        name=memory["name"] or memory.get("username") or "Cognitive Explorer",
        email=memory.get("email"),
        avatar_url=memory.get("avatar_url"),
        master_persona=memory.get("master_persona"),
        total_trials=memory.get("total_trials", 0),
        total_hits=memory.get("total_hits", 0),
        accuracy_percent=memory.get("accuracy_percent", 0.0),
        memory_summary=memory.get("memory_summary"),
        recent_trials=memory.get("recent_trials", [])
    )


@app.get("/api/model/evolution", response_model=ModelEvolutionResponse)
def get_evolution():
    """Returns self-upgraded model generation metrics and learned patterns."""
    evo = get_model_evolution()
    return ModelEvolutionResponse(
        generation=evo["generation"],
        version=evo["version"],
        total_inputs_absorbed=evo["total_inputs_absorbed"],
        learned_synonyms_count=evo["learned_synonyms_count"],
        learned_synonyms=evo.get("learned_synonyms", {}),
        last_upgraded_at=evo.get("last_upgraded_at")
    )


@app.post("/api/session/start", response_model=StartSessionResponse)
def start_session(req: StartSessionRequest = StartSessionRequest()):
    session_id = session_store.create_session(
        min_questions=req.min_questions,
        streak_target=req.streak_target,
        user_id=req.user_id
    )
    engine = session_store.get_session(session_id)
    if not engine:
        raise HTTPException(status_code=500, detail="Failed to initialize engine session")

    first_q = engine.get_active_question()
    q_payload = QuestionPayload(**first_q) if first_q else None

    # Load persistent user memory for greeting personalization
    user_mem = get_user_memory(engine.user_id)
    evo = get_model_evolution()

    welcome_msg = "Session initialized. Beginning psychometric calibration."
    if user_mem.get("exists") and user_mem.get("total_trials", 0) > 0:
        welcome_msg = (
            f"Welcome back, {user_mem['name']}. Recalling {user_mem['total_trials']} previous cognitive trials "
            f"({user_mem['accuracy_percent']}% baseline accuracy). Model upgraded to {evo['version']}."
        )

    return StartSessionResponse(
        session_id=session_id,
        phase=engine.phase,
        message=welcome_msg,
        question=q_payload,
        user_profile=engine.user_record,
        user_memory=user_mem,
        model_version=evo.get("version")
    )


@app.post("/api/session/answer", response_model=AnswerResponse)
def submit_answer(req: AnswerRequest):
    engine = session_store.get_session(req.session_id)
    if not engine:
        # Gracefully re-hydrate the session to avoid 404 dead-ends during container restarts
        engine = session_store.recover_session(session_id=req.session_id, user_id=req.user_id)

    # Sync user_id if provided
    if req.user_id and engine.user_id != req.user_id:
        engine.user_id = req.user_id
        engine.user_record = get_or_create_user(req.user_id)

    result = engine.submit_answer(req.choice_index, req.choice_text)

    next_q = engine.get_active_question()
    next_q_payload = QuestionPayload(**next_q) if next_q else None

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
        evolution_event=result.get("evolution_event"),
        model_version=result.get("model_version"),
        user_memory=result.get("user_memory"),
    )


@app.get("/api/session/{session_id}/state", response_model=SessionStateResponse)
def get_session_state(session_id: str):
    engine = session_store.get_session(session_id)
    if not engine:
        engine = session_store.recover_session(session_id=session_id)

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
        engine = session_store.recover_session(session_id=session_id)

    return DebugStateResponse(
        session_id=session_id,
        debug_state=engine.get_debug_state()
    )


@app.post("/api/session/{session_id}/reset")
def reset_session(session_id: str, req: StartSessionRequest = StartSessionRequest()):
    success = session_store.reset_session(
        session_id,
        min_questions=req.min_questions,
        streak_target=req.streak_target,
        user_id=req.user_id
    )
    if not success:
        session_store.create_session(req.min_questions, req.streak_target, user_id=req.user_id)

    engine = session_store.get_session(session_id)
    first_q = engine.get_active_question() if engine else None
    q_payload = QuestionPayload(**first_q) if first_q else None

    return {
        "status": "reset",
        "session_id": session_id,
        "phase": engine.phase if engine else "profiling",
        "question": q_payload
    }


# Static Files & SPA Frontend Serving
STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static"))

if os.path.exists(STATIC_DIR):
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    assets_dir = os.path.join(STATIC_DIR, "assets")

    @app.get("/assets/{asset_name:path}")
    def get_asset(asset_name: str):
        target = os.path.join(assets_dir, asset_name)
        if os.path.isfile(target):
            return FileResponse(target)
        # Resilient fallback: If an outdated JS bundle is requested by a client's stale cached index.html,
        # fallback to the active bundle so the client never crashes with 404!
        if asset_name.endswith(".js"):
            for f in sorted(os.listdir(assets_dir), reverse=True):
                if f.startswith("index-") and f.endswith(".js"):
                    return FileResponse(os.path.join(assets_dir, f), media_type="application/javascript")
        if asset_name.endswith(".css"):
            for f in sorted(os.listdir(assets_dir), reverse=True):
                if f.startswith("index-") and f.endswith(".css"):
                    return FileResponse(os.path.join(assets_dir, f), media_type="text/css")
        raise HTTPException(status_code=404, detail="Asset not found")

    @app.get("/manifest.webmanifest")
    def get_manifest():
        return FileResponse(
            os.path.join(STATIC_DIR, "manifest.webmanifest"),
            media_type="application/manifest+json",
            headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
        )

    @app.get("/sw.js")
    def get_sw():
        return FileResponse(
            os.path.join(STATIC_DIR, "sw.js"),
            media_type="application/javascript",
            headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
        )

    @app.get("/favicon.ico")
    def get_favicon():
        fav = os.path.join(STATIC_DIR, "favicon-64.png")
        if os.path.exists(fav):
            return FileResponse(fav, media_type="image/png")
        return FileResponse(os.path.join(STATIC_DIR, "icon.svg"), media_type="image/svg+xml")

    @app.get("/")
    @app.head("/")
    def serve_root():
        return FileResponse(
            os.path.join(STATIC_DIR, "index.html"),
            headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
        )

    @app.get("/{full_path:path}")
    @app.head("/{full_path:path}")
    def catch_all_spa(full_path: str):
        # Do not intercept /api calls
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(
            os.path.join(STATIC_DIR, "index.html"),
            headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
        )
