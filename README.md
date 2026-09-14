# CLAIRVOYANT: Predictive Cognition AI 🧠⚡

A full-stack predictive cognitive AI application built with a **FastAPI** backend and a responsive **React + Tailwind CSS** frontend that works smoothly across both **mobile devices** and **desktop browsers**.

---

## How It Works

1. **Phase 1: Psychometric Calibration (Profiling Stage)**
   The bot asks four baseline anchor questions covering biological rhythm (chronotype), sensory environment, planning style, and risk tolerance. These traits are stored into a structured profile.

2. **Phase 2: Silent Prediction Engine**
   For every subsequent question, the bot's engine runs an $O(1)$ trait affinity algorithm to pre-calculate your choice **before** you answer. An online frequency prior learns your positional habits if no explicit rule applies.

3. **Phase 3: Hidden State Evaluator & Threshold Reveal**
   The bot compares its internal prediction against your actual selection silently:
   - Increments a **hit streak** on a match.
   - Resets streak to 0 on a miss.
   - Remains completely silent until **3 consecutive hits** or **10 total questions** are reached.
   - Upon meeting the condition, an explosive celebration triggers: a **System Reveal Modal** with accuracy %, timeline of guesses vs actual answers, and your psychometric archetype badge!

---

## 📱 Use as a Website OR Install as an App

The project is built as a **Dual-Mode Application** that functions simultaneously as a responsive website and an installable standalone app across all platforms:

### 1. As a Website (Desktop & Mobile)
- **Desktop**: Navigate to `http://localhost:3050` in any web browser.
- **Mobile**: Open `http://<YOUR_LOCAL_IP>:3050` in Chrome, Safari, or Samsung Internet.

### 2. As an Installable App on Mobile (Android & iOS)
- **Android**: Tap the **"Install App"** button in the header (or browser menu $\rightarrow$ **"Install App"** / **"Add to Home screen"**). It installs an app icon on your home screen and runs in native fullscreen standalone mode with its own splash screen.
- **iPhone / iOS**: Tap the Safari **Share** icon (⎋) $\rightarrow$ **"Add to Home Screen"** (⊞).

### 3. As a Standalone Desktop Application (Windows & macOS)
- **Method A (One-Click)**: Double-click `launch_desktop_app.bat`. It starts both backend and frontend and opens CLAIRVOYANT in a dedicated native desktop window (no browser URL bar or tabs).
- **Method B (Browser PWA)**: In Chrome or Edge, click the **"Download"** button in the top header. CLAIRVOYANT will be added to your Desktop, Start Menu, and Taskbar!

---

## Quick Start

### 1. Start Backend (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8088 --reload
```
API docs available at: `http://localhost:8088/docs`

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Open: `http://localhost:3050` (or scan your local network IP on your phone!)

---

## Architecture Overview

```
predictive-bot/
├── backend/
│   ├── app/
│   │   ├── engine.py          # O(1) trait affinity map & state tracker
│   │   ├── models.py          # Pydantic schemas
│   │   ├── session_store.py   # Multi-user session manager
│   │   └── main.py            # FastAPI REST endpoints & CORS
│   ├── tests/
│   │   └── test_api.py        # Automated end-to-end integration test
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatHeader.jsx   # Header with status & Mind-Peek toggle
│   │   │   ├── ChatFeed.jsx     # Conversational bubble stream & typing indicator
│   │   │   ├── OptionPicker.jsx # Mobile touch pills & keyboard listener
│   │   │   ├── RevealModal.jsx  # Celebratory modal, stats, & prediction timeline
│   │   │   └── MindPeekHUD.jsx  # Real-time hidden state inspector
│   │   ├── services/
│   │   │   └── api.js           # REST API client
│   │   ├── utils/
│   │   │   └── sound.js         # Zero-dependency Web Audio synthesizer
│   │   ├── App.jsx              # Main state & layout
│   │   └── index.css            # Tailwind & glassmorphism styles
│   └── package.json
```
