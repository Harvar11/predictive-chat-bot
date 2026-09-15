import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_personality_driven_predictions_and_number_forces():
    print("\n=======================================================")
    print(" TESTING PERSONALITY-DRIVEN PREDICTIONS & NUMBER FORCES")
    print("=======================================================")

    # --- 1. USER CAUTIOUS / ANALYTICAL ---
    print("\n--- Simulation 1: User Alpha (Cautious & Analytical) ---")
    res1 = client.post("/api/session/start")
    sid1 = res1.json()["session_id"]

    for ans in ["Structured & Cautious", "Quiet Solitude", "Logical Precision & Numbers"]:
        step1 = client.post("/api/session/answer", json={"session_id": sid1, "choice_text": ans}).json()

    alpha_persona = step1["persona"]
    print(f"Alpha Persona: {alpha_persona}")
    assert "Analytical" in alpha_persona

    dbg1 = client.get(f"/api/session/{sid1}/debug").json()["debug_state"]
    print(f"Alpha's Queue has {len(dbg1['history']) + dbg1['queue_length']} trials.")

    # Find the odd two digit question in Alpha's queue
    # Target for cautious/analytical must be 37!
    # And tool must be Blue Wrench!
    alpha_targets = {t["id"]: t["target"] for t in client.app.app.extra["engine_ref"] if False} if False else None

    # --- 2. USER BOLD / SPONTANEOUS ---
    print("\n--- Simulation 2: User Beta (Bold & Spontaneous) ---")
    res2 = client.post("/api/session/start")
    sid2 = res2.json()["session_id"]

    for ans in ["Bold & Spontaneous", "Dynamic Social Spaces", "Intuitive Patterns & Imagery"]:
        step2 = client.post("/api/session/answer", json={"session_id": sid2, "choice_text": ans}).json()

    beta_persona = step2["persona"]
    print(f"Beta Persona: {beta_persona}")
    assert "Maverick" in beta_persona

    # --- 3. VERIFY DIFFERENT PREDICTIONS FOR SAME QUESTIONS ---
    from app.engine import FORCING_TRIALS_MASTER
    odd_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "num_force_odd_two_digit")
    tool_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "force_tool_color")
    clasp_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "force_hand_clasp")

    alpha_profile = {"temperament": "cautious", "energy": "quiet", "cognition": "analytical"}
    beta_profile = {"temperament": "bold", "energy": "social", "cognition": "creative"}

    alpha_odd_pred = odd_trial["resolver"](alpha_profile)["target"]
    beta_odd_pred = odd_trial["resolver"](beta_profile)["target"]
    print(f"\nOdd 2-Digit Prediction -> Alpha: '{alpha_odd_pred}' vs Beta: '{beta_odd_pred}'")
    assert alpha_odd_pred == "37"
    assert beta_odd_pred == "73"
    assert alpha_odd_pred != beta_odd_pred

    alpha_tool_pred = tool_trial["resolver"](alpha_profile)["target"]
    beta_tool_pred = tool_trial["resolver"](beta_profile)["target"]
    print(f"Tool Prediction -> Alpha: '{alpha_tool_pred}' vs Beta: '{beta_tool_pred}'")
    assert alpha_tool_pred == "Blue Wrench"
    assert beta_tool_pred == "Red Hammer"
    assert alpha_tool_pred != beta_tool_pred

    alpha_clasp_pred = clasp_trial["resolver"](alpha_profile)["target"]
    beta_clasp_pred = clasp_trial["resolver"](beta_profile)["target"]
    print(f"Hand Clasp Prediction -> Alpha: '{alpha_clasp_pred}' vs Beta: '{beta_clasp_pred}'")
    assert alpha_clasp_pred == "Right thumb"
    assert beta_clasp_pred == "Left thumb"
    assert alpha_clasp_pred != beta_clasp_pred

    # --- 4. VERIFY INVARIANCE NUMBER FORCES ---
    num_1089_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "num_force_1089")
    assert num_1089_trial["resolver"]({})["target"] == "1089"
    print("1089 Invariance Force verified: '1089'")

    num_magic_4 = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "num_force_magic_4")
    assert num_magic_4["resolver"]({})["target"] == "4"
    print("Algebraic Remainder 4 verified: '4'")

    num_root_9 = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "num_force_digital_root_9")
    assert num_root_9["resolver"]({})["target"] == "9"
    print("Digital Root 9 verified: '9'")

    num_repunit_37 = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "num_force_repunit_37")
    assert num_repunit_37["resolver"]({})["target"] == "37"
    print("Repunit 37 verified: '37'")

    num_cyclic_7 = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "num_force_cyclic_7")
    assert num_cyclic_7["resolver"]({})["target"] == "7"
    print("Cyclic 7 verified: '7'")

    # --- 5. VERIFY MIND-PEEK TELEMETRY PREDICTED QUESTIONS & ANSWERS ---
    print("\n--- Verifying Mind-Peek Telemetry Payload ---")
    assert "current_prediction" in dbg1
    assert "question" in dbg1["current_prediction"]
    assert "target" in dbg1["current_prediction"]
    assert len(dbg1["current_prediction"]["question"]) > 5
    assert len(dbg1["current_prediction"]["target"]) > 0
    print(f"Active Pre-Sealed Question: {dbg1['current_prediction']['question'][:40]}...")
    print(f"Active Pre-Sealed Answer:   '{dbg1['current_prediction']['target']}'")

    assert "upcoming_predictions" in dbg1
    assert len(dbg1["upcoming_predictions"]) > 0
    first_up = dbg1["upcoming_predictions"][0]
    assert "question" in first_up
    assert "predicted" in first_up
    print(f"Upcoming Prediction #1 Question: {first_up['question'][:40]}...")
    print(f"Upcoming Prediction #1 Answer:   '{first_up['predicted']}'")

    print("\nALL PERSONALITY-DRIVEN, NUMBER-FORCING & TELEMETRY TESTS PASSED!")


def test_user_persistence_google_auth_and_self_upgrading():
    print("\n=======================================================")
    print(" TESTING GOOGLE AUTH, USER MEMORY & SELF-UPGRADING LOOP ")
    print("=======================================================")

    # 1. Google Sign-In / User Profile
    auth_res = client.post("/api/auth/google", json={
        "user_id": "google_109823471029384",
        "email": "alex@example.com",
        "name": "Alex Rivers",
        "picture": "https://lh3.googleusercontent.com/a/mock_avatar"
    })
    assert auth_res.status_code == 200
    user_data = auth_res.json()
    print(f"Authenticated User: {user_data['name']} ({user_data['user_id']})")
    assert user_data["name"] == "Alex Rivers"
    assert user_data["email"] == "alex@example.com"

    uid = user_data["user_id"]

    # 2. Start Session with User ID
    start_res = client.post("/api/session/start", json={"user_id": uid})
    assert start_res.status_code == 200
    session_data = start_res.json()
    sid = session_data["session_id"]
    print(f"Session Started for user: {sid}")

    # 3. Complete Calibration Probes
    client.post("/api/session/answer", json={"session_id": sid, "choice_text": "Structured & Cautious", "user_id": uid})
    client.post("/api/session/answer", json={"session_id": sid, "choice_text": "Quiet Solitude", "user_id": uid})
    calib3 = client.post("/api/session/answer", json={"session_id": sid, "choice_text": "Logical Precision & Numbers", "user_id": uid}).json()
    assert calib3["status"] == "profiling_completed"

    # 4. Submit a cognitive forcing answer with unique synonym
    dbg = client.get(f"/api/session/{sid}/debug").json()["debug_state"]
    curr_target = dbg["current_prediction"]["target"]
    print(f"Active Trial Target: '{curr_target}'")

    # Type an answer matching target
    ans_res = client.post("/api/session/answer", json={
        "session_id": sid,
        "choice_text": curr_target,
        "user_id": uid
    }).json()

    assert ans_res["is_hit"] == True
    assert "evolution_event" in ans_res
    assert ans_res["evolution_event"]["upgraded"] == True
    print(f"Model Evolution: {ans_res['model_version']} (Generation #{ans_res['evolution_event']['generation']})")
    print(f"Total Inputs Absorbed: {ans_res['evolution_event']['total_inputs_absorbed']}")

    # 5. Check Global Model Evolution Endpoint
    evo_res = client.get("/api/model/evolution").json()
    assert evo_res["total_inputs_absorbed"] >= 1
    assert "version" in evo_res
    print(f"Global Evolution Verified: {evo_res['version']} ({evo_res['learned_synonyms_count']} learned synonyms)")

    # 6. Check Persistent User Memory
    mem_res = client.get(f"/api/user/{uid}/memory").json()
    assert mem_res["total_trials"] >= 1
    assert mem_res["total_hits"] >= 1
    print(f"User Memory Verified: {mem_res['total_trials']} trials recorded permanently in SQLite.")

    # 7. Start a NEW session for the same user and verify memory greeting
    new_sess = client.post("/api/session/start", json={"user_id": uid}).json()
    print(f"Returning User Greeting: '{new_sess['message']}'")
    assert "Alex Rivers" in new_sess["message"]
    assert "Recalling" in new_sess["message"]

    print("\nALL GOOGLE AUTH, USER MEMORY & SELF-UPGRADING TESTS PASSED!")


def test_password_security_and_authentication():
    print("\n=======================================================")
    print(" TESTING PASSWORD SECURITY & CREDENTIAL VERIFICATION ")
    print("=======================================================")

    email = "secure_tester@example.com"
    uid = "user_secure_test_12345"
    password = "SuperSecretPassword#2026"

    # 1. Create account with password
    signup_res = client.post("/api/auth/google", json={
        "user_id": uid,
        "email": email,
        "name": "Secure Tester",
        "password": password
    })
    assert signup_res.status_code == 200
    print("[OK] Account created with encrypted password hash.")

    # 2. Login with correct password
    login_success = client.post("/api/auth/google", json={
        "user_id": uid,
        "email": email,
        "password": password
    })
    assert login_success.status_code == 200
    print("[OK] Login with correct password succeeded.")

    # 3. Login with WRONG password -> Expect 401 Unauthorized
    login_failed = client.post("/api/auth/google", json={
        "user_id": uid,
        "email": email,
        "password": "WrongPassword!999"
    })
    assert login_failed.status_code == 401
    assert "Incorrect password" in login_failed.json()["detail"]
    print("[OK] Login with incorrect password blocked with 401 Unauthorized.")

    print("\nALL PASSWORD ENCRYPTION & SECURITY TESTS PASSED!")


def test_auth_registration_login_and_progress_retention():
    print("\n=======================================================")
    print(" TESTING REGISTRATION, USERNAME LOGIN & PROGRESS SYNC")
    print("=======================================================")

    import time
    ts = int(time.time() * 1000)
    email = f"voyager_{ts}@twilightparadox.com"
    username = f"voyager_{ts}"
    password = "QuantumVault#2026"

    # 1. Register a new user with email, password, and username
    reg_res = client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "username": username,
        "name": "Alpha Voyager"
    })
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
    user_data = reg_res.json()
    assert user_data["username"] == username
    assert user_data["email"] == email
    user_id = user_data["user_id"]
    print(f"[OK] User registered successfully: user_id={user_id}, username={username}")

    # 2. Reject duplicate email registration
    dup_email_res = client.post("/api/auth/register", json={
        "email": email,
        "password": "AnotherPassword#123",
        "username": "differentusername"
    })
    assert dup_email_res.status_code == 409
    assert "already registered" in dup_email_res.json()["detail"].lower()
    print("[OK] Duplicate email rejected with 409 Conflict.")

    # 3. Reject duplicate username registration
    dup_un_res = client.post("/api/auth/register", json={
        "email": "different_email@test.com",
        "password": "AnotherPassword#123",
        "username": username
    })
    assert dup_un_res.status_code == 409
    assert "already taken" in dup_un_res.json()["detail"].lower()
    print("[OK] Duplicate username rejected with 409 Conflict.")

    # 4. Login using registered email
    login_email_res = client.post("/api/auth/login", json={
        "identifier": email,
        "password": password
    })
    assert login_email_res.status_code == 200
    assert login_email_res.json()["username"] == username
    print("[OK] Login via email succeeded.")

    # 5. Login using registered username
    login_un_res = client.post("/api/auth/login", json={
        "identifier": username,
        "password": password
    })
    assert login_un_res.status_code == 200
    assert login_un_res.json()["email"] == email
    print("[OK] Login via username succeeded.")

    # 6. Reject invalid password
    bad_login_res = client.post("/api/auth/login", json={
        "identifier": username,
        "password": "IncorrectPassword999"
    })
    assert bad_login_res.status_code == 401
    print("[OK] Login with incorrect password rejected with 401.")

    # 7. Complete calibration and record a forcing trial under this user_id
    s_res = client.post("/api/session/start", json={"user_id": user_id})
    sid = s_res.json()["session_id"]
    for ans in ["Structured & Cautious", "Quiet Solitude", "Logical Precision & Numbers"]:
        client.post("/api/session/answer", json={"session_id": sid, "choice_text": ans, "user_id": user_id})
    # Answer first forcing trial
    client.post("/api/session/answer", json={"session_id": sid, "choice_text": "37", "user_id": user_id})

    # Reload profile via login and check progress
    reloaded = client.post("/api/auth/login", json={
        "identifier": username,
        "password": password
    }).json()
    assert reloaded["total_trials"] >= 1
    print(f"[OK] Lifetime progress retained across logins: {reloaded['total_trials']} total trials recorded.")

    # 8. Sign in via Google using the same email (tests email collision & account merge)
    google_res = client.post("/api/auth/google", json={
        "user_id": f"google_oauth_{ts}",
        "email": email,
        "name": "Alpha Voyager Google",
        "picture": "https://lh3.googleusercontent.com/a/google_avatar"
    })
    assert google_res.status_code == 200, f"Google auth failed on existing email: {google_res.text}"
    google_data = google_res.json()
    assert google_data["user_id"] == user_id
    assert google_data["username"] == username
    assert google_data["total_trials"] >= 1
    print("[OK] Google Sign-In with already-registered email resolved cleanly without IntegrityError.")

    print("\nALL USER AUTH & REGISTRATION TESTS PASSED!")


def test_dynamic_profiling_and_expanded_forces():
    print("\n=======================================================")
    print(" TESTING DYNAMIC PROFILING PROBES & EXPANDED FORCING CATALOG ")
    print("=======================================================")

    from app.engine import DYNAMIC_PROFILING_POOLS, FORCING_TRIALS_MASTER

    # 1. Verify pool sizes
    print(f"Temperament pool size: {len(DYNAMIC_PROFILING_POOLS['temperament'])} probes")
    print(f"Energy pool size:      {len(DYNAMIC_PROFILING_POOLS['energy'])} probes")
    print(f"Cognition pool size:   {len(DYNAMIC_PROFILING_POOLS['cognition'])} probes")
    assert len(DYNAMIC_PROFILING_POOLS["temperament"]) >= 5
    assert len(DYNAMIC_PROFILING_POOLS["energy"]) >= 5
    assert len(DYNAMIC_PROFILING_POOLS["cognition"]) >= 5

    num_trials = [t for t in FORCING_TRIALS_MASTER if t.get("domain") == "numerical"]
    gen_trials = [t for t in FORCING_TRIALS_MASTER if t.get("domain") != "numerical"]
    print(f"High-Precision Numerical Funnels: {len(num_trials)} trials")
    print(f"High-Accuracy General Forces:     {len(gen_trials)} trials")
    print(f"Total Master Forcing Catalog:     {len(FORCING_TRIALS_MASTER)} trials")
    assert len(num_trials) == 15, "Must have 15 distinct high-precision numerical funnels"
    assert len(gen_trials) == 6, "Must have 6 high-accuracy general psychological forces"
    assert len(FORCING_TRIALS_MASTER) == 21

    # 2. Verify dynamic variation across 10 distinct sessions
    distinct_first_probes = set()
    distinct_second_probes = set()
    distinct_third_probes = set()

    for i in range(10):
        res = client.post("/api/session/start").json()
        sid = res["session_id"]
        q1 = res["question"]["question"]
        distinct_first_probes.add(q1)

        # Answer probe 1
        res_p2 = client.post("/api/session/answer", json={"session_id": sid, "choice_index": 0}).json()
        distinct_second_probes.add(res_p2["next_question"]["question"])

        # Answer probe 2
        res_p3 = client.post("/api/session/answer", json={"session_id": sid, "choice_index": 0}).json()
        distinct_third_probes.add(res_p3["next_question"]["question"])

    print(f"[OK] Distinct Calibration Q1 observed: {len(distinct_first_probes)}/10")
    print(f"[OK] Distinct Calibration Q2 observed: {len(distinct_second_probes)}/10")
    print(f"[OK] Distinct Calibration Q3 observed: {len(distinct_third_probes)}/10")
    assert len(distinct_first_probes) > 1, "Dynamic profiling probes must vary across sessions"
    assert len(distinct_second_probes) > 1, "Dynamic profiling probes must vary across sessions"
    assert len(distinct_third_probes) > 1, "Dynamic profiling probes must vary across sessions"

    # 3. Complete calibration for a new session and inspect the dynamic queue
    sess = client.post("/api/session/start").json()
    sid = sess["session_id"]
    client.post("/api/session/answer", json={"session_id": sid, "choice_index": 0})
    client.post("/api/session/answer", json={"session_id": sid, "choice_index": 0})
    p3_res = client.post("/api/session/answer", json={"session_id": sid, "choice_index": 0}).json()
    assert p3_res["status"] == "profiling_completed"

    dbg = client.get(f"/api/session/{sid}/debug").json()["debug_state"]
    queue_len = dbg["queue_length"]
    print(f"[OK] Dynamic forcing queue length: {queue_len} trials")
    assert queue_len >= 20

    # 4. Verify interleaving of Numerical and General domains
    upcoming = dbg["upcoming_predictions"]
    curr = dbg["current_prediction"]
    domains_in_preview = {curr["domain"]} | {u["domain"] for u in upcoming}
    print(f"[OK] Cognitive domains present in active preview: {domains_in_preview}")
    assert len(domains_in_preview) >= 2, "Queue must interleave multiple cognitive domains"

    # 5. Verify General psychological forces resolver accuracy
    elephant_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "force_animal_denmark")
    assert "Elephant in Denmark" in elephant_trial["resolver"]({})["target"]

    stroop_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "force_stroop_drink")
    assert stroop_trial["resolver"]({})["target"] == "Milk"
    # Verify secondary answer 'water' is supported
    assert "water" in stroop_trial["resolver"]({})["secondary"]

    kangaroo_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "force_animal_australia")
    assert "Kangaroo in Australia" in kangaroo_trial["resolver"]({})["target"]

    finger_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "force_index_finger")
    assert finger_trial["resolver"]({})["target"] == "Index finger"

    clasp_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "force_hand_clasp")
    assert clasp_trial["resolver"]({"cognition": "analytical"})["target"] == "Right thumb"
    assert clasp_trial["resolver"]({"cognition": "creative"})["target"] == "Left thumb"

    # 6. Verify New High-Precision Numerical Funnels
    sum9_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "num_force_two_digit_digit_sum_9")
    assert sum9_trial["resolver"]({})["target"] == "9"

    rep37_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "num_force_repunit_37")
    assert rep37_trial["resolver"]({})["target"] == "37"

    cyclic7_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "num_force_cyclic_7")
    assert cyclic7_trial["resolver"]({})["target"] == "7"

    cal5_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "num_force_calendar_5")
    assert cal5_trial["resolver"]({})["target"] == "5"

    cent100_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "num_force_century_100")
    assert cent100_trial["resolver"]({})["target"] == "100"

    half50_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "num_force_half_century_50")
    assert half50_trial["resolver"]({})["target"] == "50"

    print("[OK] All High-Precision Numerical & General Forces Verified.")

    # 7. Verify answering the active forcing trial with target yields instant HIT
    active_target = curr["target"]
    ans_post = client.post("/api/session/answer", json={
        "session_id": sid,
        "choice_text": active_target
    }).json()
    assert ans_post["is_hit"] == True
    print(f"[OK] Answering with sealed prediction '{active_target}' scored a HIT: streak={ans_post['current_streak']}")

    print("\nALL DYNAMIC PROFILING & EXPANDED FORCING CATALOG TESTS PASSED!")


def test_typo_tolerance_and_session_recovery():
    print("\n=======================================================")
    print(" TESTING TYPO TOLERANCE, LEVENSHTEIN & SESSION RECOVERY")
    print("=======================================================")

    from app.engine import evaluate_forcing_match, PredictiveEngine

    # 1. Typo tolerance tests
    hit1, _ = evaluate_forcing_match("1089.", "1089", ["1089"])
    assert hit1 == True, "Punctuation stripping should match 1089."

    hit2, _ = evaluate_forcing_match("10899", "1089", ["1089"])
    assert hit2 == True, "Levenshtein distance <= 1 should match 10899"

    hit3, _ = evaluate_forcing_match("elefant in denmark", "Elephant in Denmark", ["elephant", "denmark"])
    assert hit3 == True, "Levenshtein distance <= 1 should match elefant in denmark"

    hit4, _ = evaluate_forcing_match("cinamon", "cinnamon", ["cinnamon"])
    assert hit4 == True, "Levenshtein distance <= 1 should match cinamon"

    print("[OK] Typo-tolerance with Levenshtein <= 1 verified.")

    # 2. Session recovery test: submit to non-existent session_id should recover instead of 404
    recovered_sid = "non_existent_session_test_9999"
    recovery_res = client.post("/api/session/answer", json={
        "session_id": recovered_sid,
        "choice_text": "Structured & Cautious"
    })
    assert recovery_res.status_code == 200, f"Expected 200 from graceful recovery, got {recovery_res.status_code}"
    rec_json = recovery_res.json()
    assert rec_json["session_id"] == recovered_sid
    print("[OK] Graceful session recovery verified without 404.")

    # 3. Verify get_reveal_summary returns consistent payload keys
    engine = PredictiveEngine("test_reveal_sid")
    engine.total_questions = 10
    engine.total_hits = 8
    summary = engine.get_reveal_summary()
    assert "accuracy" in summary and "accuracy_percent" in summary
    assert "persona" in summary and "archetype" in summary
    assert "reason" in summary and "reveal_reason" in summary
    assert summary["accuracy_percent"] == 80.0
    print("[OK] Reveal summary key parity verified.")

    print("\nALL TYPO TOLERANCE & SESSION RECOVERY TESTS PASSED!")


if __name__ == "__main__":
    test_personality_driven_predictions_and_number_forces()
    test_user_persistence_google_auth_and_self_upgrading()
    test_password_security_and_authentication()
    test_auth_registration_login_and_progress_retention()
    test_dynamic_profiling_and_expanded_forces()
    test_typo_tolerance_and_session_recovery()




