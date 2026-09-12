const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = RAW_BASE ? `${RAW_BASE.replace(/\/$/, '')}/api` : '/api';

export async function apiStartSession(minQuestions = 10, streakTarget = 3) {
  const res = await fetch(`${API_BASE}/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      min_questions: minQuestions,
      streak_target: streakTarget
    }),
  });
  if (!res.ok) throw new Error(`Failed to start session: ${res.statusText}`);
  return res.json();
}

export async function apiSubmitAnswer(sessionId, choiceIndex, choiceText = '') {
  const res = await fetch(`${API_BASE}/session/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      choice_index: choiceIndex,
      choice_text: choiceText
    }),
  });
  if (!res.ok) throw new Error(`Failed to submit answer: ${res.statusText}`);
  return res.json();
}

export async function apiGetSessionState(sessionId) {
  const res = await fetch(`${API_BASE}/session/${sessionId}/state`);
  if (!res.ok) throw new Error(`Failed to get session state: ${res.statusText}`);
  return res.json();
}

export async function apiGetDebugState(sessionId) {
  const res = await fetch(`${API_BASE}/session/${sessionId}/debug`);
  if (!res.ok) throw new Error(`Failed to get debug state: ${res.statusText}`);
  return res.json();
}

export async function apiResetSession(sessionId, minQuestions = 10, streakTarget = 3) {
  const res = await fetch(`${API_BASE}/session/${sessionId}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      min_questions: minQuestions,
      streak_target: streakTarget
    }),
  });
  if (!res.ok) throw new Error(`Failed to reset session: ${res.statusText}`);
  return res.json();
}
