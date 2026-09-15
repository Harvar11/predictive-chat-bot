const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = RAW_BASE ? `${RAW_BASE.replace(/\/$/, '')}/api` : '/api';

async function fetchWithRetry(url, options = {}, retries = 1, delayMs = 1500) {
  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
      return fetchWithRetry(url, options, retries - 1, delayMs);
    }
    throw err;
  }
}

export async function apiStartSession(minQuestions = 10, streakTarget = 3, userId = null) {
  const res = await fetchWithRetry(`${API_BASE}/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      min_questions: minQuestions,
      streak_target: streakTarget,
      user_id: userId
    }),
  }, 2, 1500);
  if (!res.ok) throw new Error(`Failed to start session: ${res.statusText}`);
  return res.json();
}

export async function apiSubmitAnswer(sessionId, choiceIndex, choiceText = '', userId = null) {
  const res = await fetchWithRetry(`${API_BASE}/session/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      choice_index: choiceIndex,
      choice_text: choiceText,
      user_id: userId
    }),
  }, 1, 1500);
  if (!res.ok) throw new Error(`Failed to submit answer: ${res.statusText}`);
  return res.json();
}

export async function apiGetSessionState(sessionId) {
  const res = await fetchWithRetry(`${API_BASE}/session/${sessionId}/state`);
  if (!res.ok) throw new Error(`Failed to get session state: ${res.statusText}`);
  return res.json();
}

export async function apiGetDebugState(sessionId) {
  const res = await fetchWithRetry(`${API_BASE}/session/${sessionId}/debug`);
  if (!res.ok) throw new Error(`Failed to get debug state: ${res.statusText}`);
  return res.json();
}

export async function apiResetSession(sessionId, minQuestions = 10, streakTarget = 3, userId = null) {
  const res = await fetchWithRetry(`${API_BASE}/session/${sessionId}/reset`, {
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

export async function apiRegister(regData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regData),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Registration failed: ${res.statusText}`);
  }
  return res.json();
}

export async function apiLogin(loginData) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Login failed: ${res.statusText}`);
  }
  return res.json();
}

export async function apiGoogleAuth(authData) {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authData),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Authentication failed: ${res.statusText}`);
  }
  return res.json();
}

export async function apiGetUserMemory(userId) {
  const res = await fetchWithRetry(`${API_BASE}/user/${userId}/memory`);
  if (!res.ok) throw new Error(`Failed to get user memory: ${res.statusText}`);
  return res.json();
}

export async function apiGetModelEvolution() {
  const res = await fetchWithRetry(`${API_BASE}/model/evolution`);
  if (!res.ok) throw new Error(`Failed to get model evolution: ${res.statusText}`);
  return res.json();
}

