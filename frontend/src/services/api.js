const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = RAW_BASE ? `${RAW_BASE.replace(/\/$/, '')}/api` : '/api';

export async function apiStartSession(minQuestions = 10, streakTarget = 3, userId = null) {
  const res = await fetch(`${API_BASE}/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      min_questions: minQuestions,
      streak_target: streakTarget,
      user_id: userId
    }),
  });
  if (!res.ok) throw new Error(`Failed to start session: ${res.statusText}`);
  return res.json();
}

export async function apiSubmitAnswer(sessionId, choiceIndex, choiceText = '', userId = null) {
  const res = await fetch(`${API_BASE}/session/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      choice_index: choiceIndex,
      choice_text: choiceText,
      user_id: userId
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

export async function apiResetSession(sessionId, minQuestions = 10, streakTarget = 3, userId = null) {
  const res = await fetch(`${API_BASE}/session/${sessionId}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      min_questions: minQuestions,
      streak_target: streakTarget,
      user_id: userId
    }),
  });
  if (!res.ok) throw new Error(`Failed to reset session: ${res.statusText}`);
  return res.json();
}

export async function apiGoogleAuth(authData) {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authData),
  });
  if (!res.ok) throw new Error(`Google Auth failed: ${res.statusText}`);
  return res.json();
}

export async function apiGetUserMemory(userId) {
  const res = await fetch(`${API_BASE}/user/${userId}/memory`);
  if (!res.ok) throw new Error(`Failed to get user memory: ${res.statusText}`);
  return res.json();
}

export async function apiGetModelEvolution() {
  const res = await fetch(`${API_BASE}/model/evolution`);
  if (!res.ok) throw new Error(`Failed to get model evolution: ${res.statusText}`);
  return res.json();
}

