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
    single_trial = next(t for t in FORCING_TRIALS_MASTER if t["id"] == "num_force_single_digit")

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

    alpha_single_pred = single_trial["resolver"](alpha_profile)["target"]
    beta_single_pred = single_trial["resolver"](beta_profile)["target"]
    print(f"Single Digit Prediction -> Alpha: '{alpha_single_pred}' vs Beta: '{beta_single_pred}'")
    assert alpha_single_pred == "7"
    assert beta_single_pred == "3"
    assert alpha_single_pred != beta_single_pred

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

if __name__ == "__main__":
    test_personality_driven_predictions_and_number_forces()

