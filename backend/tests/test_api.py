import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_pipeline_with_text():
    print("--- 1. Health Check ---")
    res = client.get("/api/health")
    assert res.status_code == 200
    print("Health check OK.")

    print("\n--- 2. Starting Session ---")
    res = client.post("/api/session/start", json={"min_questions": 10, "streak_target": 3})
    assert res.status_code == 200
    data = res.json()
    session_id = data["session_id"]
    print(f"Session started: {session_id}")

    print("\n--- 3. Answering Profiling Questions with FREEFORM TEXT ---")
    text_answers = [
        "I am definitely an early bird who loves morning sunshine",
        "Quiet solitude in a secluded cabin",
        "Strictly planned with an itinerary",
        "Safe bet with high ratings"
    ]
    for step, ans in enumerate(text_answers):
        res = client.post("/api/session/answer", json={
            "session_id": session_id,
            "choice_text": ans
        })
        assert res.status_code == 200
        step_data = res.json()
        print(f"Profiling Step {step + 1}: status={step_data['status']}, phase={step_data['phase']}")

    assert step_data["phase"] == "quiz"
    print("Profiling complete via text input!")

    print("\n--- 4. Checking Learned Traits ---")
    res = client.get(f"/api/session/{session_id}/debug")
    dbg = res.json()["debug_state"]
    print("User profile calibrated:", dbg["user_profile"])
    assert dbg["user_profile"]["chronotype"] == "early"
    assert dbg["user_profile"]["environment"] == "quiet"

    print("\n--- 5. Answering Quiz Questions with Freeform Text to Trigger 3-Streak Reveal ---")
    quiz_answers = [
        "6am sunrise run",             # Correlates with early chronotype
        "isolated mountain cabin",     # Correlates with quiet environment
        "wake up instantly at 6:30"    # Correlates with early chronotype
    ]
    for q_idx, ans in enumerate(quiz_answers):
        res = client.post("/api/session/answer", json={
            "session_id": session_id,
            "choice_text": ans
        })
        assert res.status_code == 200
        q_data = res.json()
        print(f"Quiz turn {q_idx + 1}: is_reveal={q_data['is_reveal']}")

    assert q_data["is_reveal"] is True
    assert q_data["reveal_data"] is not None
    reveal = q_data["reveal_data"]
    print("\n--- 6. Reveal Verification ---")
    print(f"Reason: {reveal['reason']}")
    print(f"Accuracy: {reveal['accuracy_percent']}%")
    print(f"Total Hits: {reveal['total_hits']}/{reveal['total_questions']}")
    assert reveal["total_hits"] == 3
    print("Text-based prediction test PASSED successfully!")

if __name__ == "__main__":
    test_full_pipeline_with_text()
