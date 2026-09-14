import os
import sqlite3
import json
import time
import re
from typing import Dict, Any, Optional, List, Tuple

DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
DB_PATH = os.path.join(DB_DIR, "aura_memory.db")


def get_db_connection() -> sqlite3.Connection:
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users table (stores user identity, master persona, and memory summary)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        email TEXT,
        name TEXT,
        avatar_url TEXT,
        created_at REAL,
        last_seen REAL,
        master_persona TEXT,
        total_trials INTEGER DEFAULT 0,
        total_hits INTEGER DEFAULT 0,
        memory_summary TEXT,
        preferences_json TEXT
    )
    """)

    # 2. Trial Inputs table (remembers every question and user input permanently)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trial_inputs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        session_id TEXT,
        question_id TEXT,
        question_domain TEXT,
        question_text TEXT,
        sealed_prediction TEXT,
        user_input TEXT,
        is_hit INTEGER,
        confidence TEXT,
        timestamp REAL,
        tokens_extracted TEXT
    )
    """)

    # 3. Model Evolution table (tracks self-upgrading generations and learned patterns)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS model_evolution (
        generation INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT,
        total_inputs_absorbed INTEGER DEFAULT 0,
        learned_synonyms_json TEXT,
        empirical_weights_json TEXT,
        last_upgraded_at REAL
    )
    """)

    # Initialize model evolution baseline if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM model_evolution")
    if cursor.fetchone()["cnt"] == 0:
        initial_synonyms = {
            "num_force_1089": ["1089", "one thousand eighty nine"],
            "num_force_odd_two_digit": ["37", "73", "thirty seven", "seventy three"],
            "force_tool_color": ["blue wrench", "red hammer", "yellow screwdriver", "wrench", "hammer"],
            "force_stroop_drink": ["milk", "cold milk", "cow milk", "whole milk"],
            "force_index_finger": ["index finger", "index", "pointer", "forefinger"],
            "force_animal_denmark": ["elephant in denmark", "elephant", "denmark elephant"],
            "force_geometric_gestalt": ["triangle and circle", "circle inside triangle", "square and circle"],
            "force_playing_card": ["7 of diamonds", "ace of spades", "seven of diamonds"]
        }
        cursor.execute("""
        INSERT INTO model_evolution (version, total_inputs_absorbed, learned_synonyms_json, empirical_weights_json, last_upgraded_at)
        VALUES (?, ?, ?, ?, ?)
        """, (
            "CLAIRVOYANT-Cognition v2.0 (Baseline)",
            0,
            json.dumps(initial_synonyms),
            json.dumps({}),
            time.time()
        ))

    conn.commit()
    conn.close()


def get_or_create_user(
    user_id: str,
    email: Optional[str] = None,
    name: Optional[str] = None,
    avatar_url: Optional[str] = None
) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()

    now = time.time()
    if row:
        # Update last seen and any updated profile info
        cursor.execute("""
        UPDATE users 
        SET last_seen = ?, 
            email = COALESCE(?, email),
            name = COALESCE(?, name),
            avatar_url = COALESCE(?, avatar_url)
        WHERE user_id = ?
        """, (now, email, name, avatar_url, user_id))
        conn.commit()
        cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        updated_row = cursor.fetchone()
        conn.close()
        return dict(updated_row)
    else:
        # Create new user
        display_name = name or (f"Guest-{user_id[:6]}" if user_id.startswith("guest_") else "Cognitive Explorer")
        cursor.execute("""
        INSERT INTO users (user_id, email, name, avatar_url, created_at, last_seen, master_persona, total_trials, total_hits, memory_summary, preferences_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
        """, (
            user_id,
            email,
            display_name,
            avatar_url or "",
            now,
            now,
            "Calibrating...",
            "First cognitive session initialized.",
            json.dumps({})
        ))
        conn.commit()
        cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        new_row = cursor.fetchone()
        conn.close()
        return dict(new_row)


def record_trial_input(
    user_id: str,
    session_id: str,
    question_id: str,
    question_domain: str,
    question_text: str,
    sealed_prediction: str,
    user_input: str,
    is_hit: bool,
    confidence: str
) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()

    # Extract tokens for NLP memory
    tokens = [t.lower() for t in re.findall(r'\w+', user_input)]
    tokens_json = json.dumps(tokens)

    cursor.execute("""
    INSERT INTO trial_inputs (user_id, session_id, question_id, question_domain, question_text, sealed_prediction, user_input, is_hit, confidence, timestamp, tokens_extracted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        session_id,
        question_id,
        question_domain,
        question_text,
        sealed_prediction,
        user_input,
        1 if is_hit else 0,
        confidence,
        time.time(),
        tokens_json
    ))
    record_id = cursor.lastrowid

    # Update user stats
    cursor.execute("""
    UPDATE users 
    SET total_trials = total_trials + 1,
        total_hits = total_hits + ?
    WHERE user_id = ?
    """, (1 if is_hit else 0, user_id))

    conn.commit()
    conn.close()
    return record_id


def update_user_master_persona(user_id: str, persona: str, description: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE users 
    SET master_persona = ?,
        memory_summary = ?
    WHERE user_id = ?
    """, (persona, description, user_id))
    conn.commit()
    conn.close()


def get_user_memory(user_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    user_row = cursor.fetchone()
    if not user_row:
        conn.close()
        return {
            "exists": False,
            "total_trials": 0,
            "total_hits": 0,
            "accuracy_percent": 0.0,
            "past_inputs": []
        }

    # Fetch recent trial inputs
    cursor.execute("""
    SELECT question_id, question_domain, sealed_prediction, user_input, is_hit, timestamp
    FROM trial_inputs
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 20
    """, (user_id,))
    recent_trials = [dict(r) for r in cursor.fetchall()]

    conn.close()

    total_trials = user_row["total_trials"]
    total_hits = user_row["total_hits"]
    accuracy = round((total_hits / total_trials * 100), 1) if total_trials > 0 else 0.0

    return {
        "exists": True,
        "user_id": user_row["user_id"],
        "name": user_row["name"],
        "email": user_row["email"],
        "avatar_url": user_row["avatar_url"],
        "master_persona": user_row["master_persona"],
        "memory_summary": user_row["memory_summary"],
        "total_trials": total_trials,
        "total_hits": total_hits,
        "accuracy_percent": accuracy,
        "recent_trials": recent_trials
    }


def get_model_evolution() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM model_evolution
    ORDER BY generation DESC
    LIMIT 1
    """)
    row = cursor.fetchone()
    conn.close()

    if not row:
        return {
            "generation": 1,
            "version": "CLAIRVOYANT-Cognition v2.0",
            "total_inputs_absorbed": 0,
            "learned_synonyms_count": 0,
            "recent_learned_synonyms": {},
            "last_upgraded_at": time.time()
        }

    synonyms = json.loads(row["learned_synonyms_json"] or "{}")
    weights = json.loads(row["empirical_weights_json"] or "{}")

    total_synonyms = sum(len(v) for v in synonyms.values())

    return {
        "generation": row["generation"],
        "version": row["version"],
        "total_inputs_absorbed": row["total_inputs_absorbed"],
        "learned_synonyms_count": total_synonyms,
        "learned_synonyms": synonyms,
        "empirical_weights": weights,
        "last_upgraded_at": row["last_upgraded_at"]
    }


def absorb_user_input_and_upgrade(
    question_id: str,
    actual_input: str,
    target: str,
    persona: Optional[str] = None,
    is_hit: bool = False
) -> Dict[str, Any]:
    """
    Self-Upgrading Engine Function:
    Reads user input, extracts semantic nuances, absorbs new synonyms,
    adjusts empirical weights, and updates the model generation.
    """
    if not actual_input or not actual_input.strip():
        return {"upgraded": False}

    cleaned = actual_input.strip().lower()
    cleaned = re.sub(r'[^\w\s]', '', cleaned).strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM model_evolution
    ORDER BY generation DESC
    LIMIT 1
    """)
    latest = cursor.fetchone()

    synonyms_dict = json.loads(latest["learned_synonyms_json"] or "{}") if latest else {}
    weights_dict = json.loads(latest["empirical_weights_json"] or "{}") if latest else {}
    total_inputs = (latest["total_inputs_absorbed"] if latest else 0) + 1
    current_gen = latest["generation"] if latest else 1

    q_synonyms = synonyms_dict.setdefault(question_id, [])

    new_synonym_added = None

    # Check if input is a genuine variant that should be learned
    # 1. If it's a hit or near-match (contains key words of target)
    target_clean = re.sub(r'[^\w\s]', '', target.lower()).strip()
    target_words = set(target_clean.split())
    input_words = set(cleaned.split())

    # If it shares words with target or was marked as hit and isn't already known
    is_semantic_variant = bool(target_words & input_words) or is_hit
    if is_semantic_variant and cleaned not in [s.lower() for s in q_synonyms] and len(cleaned) >= 2:
        q_synonyms.append(cleaned)
        new_synonym_added = cleaned

    # Update empirical weights for persona
    if persona:
        p_weights = weights_dict.setdefault(question_id, {}).setdefault(persona, {})
        p_weights[cleaned] = p_weights.get(cleaned, 0) + 1

    # Upgrade version: Every 5 inputs or when a new synonym is absorbed, increment minor generation
    new_version = f"CLAIRVOYANT-Cognition v2.{current_gen + (1 if new_synonym_added else 0)}"
    cursor.execute("""
    INSERT INTO model_evolution (version, total_inputs_absorbed, learned_synonyms_json, empirical_weights_json, last_upgraded_at)
    VALUES (?, ?, ?, ?, ?)
    """, (
        new_version,
        total_inputs,
        json.dumps(synonyms_dict),
        json.dumps(weights_dict),
        time.time()
    ))
    new_gen_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "upgraded": True,
        "generation": new_gen_id,
        "version": new_version,
        "new_synonym_learned": new_synonym_added,
        "total_inputs_absorbed": total_inputs,
        "learned_synonyms_for_question": q_synonyms
    }


# Auto-initialize on import
init_db()
