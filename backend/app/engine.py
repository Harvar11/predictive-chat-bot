import re
from typing import List, Dict, Any, Optional, Tuple
from collections import Counter

# Keywords mapped to psychometric traits for parsing user text input
TRAIT_KEYWORDS = {
    "chronotype": {
        "early": ["early", "morning", "dawn", "sunrise", "am", "wake", "6:00", "5:30", "breakfast", "daylight"],
        "night": ["night", "late", "owl", "midnight", "evening", "pm", "dark", "snooze", "9:30", "9:00", "moon"],
    },
    "environment": {
        "quiet": ["quiet", "alone", "solitude", "cabin", "silent", "peace", "peaceful", "calm", "mountain", "home", "isolation", "solo"],
        "crowd": ["crowd", "people", "party", "busy", "social", "city", "friends", "penthouse", "tokyo", "coffee", "buzz", "discussion"],
    },
    "planning": {
        "planned": ["plan", "planned", "planning", "list", "itinerary", "spreadsheet", "schedule", "ahead", "prepared", "strict", "organized"],
        "spontaneous": ["spontaneous", "flow", "wander", "random", "improvise", "aimless", "craving", "pack late", "adventure", "flexible"],
    },
    "risk": {
        "safe": ["safe", "steady", "secure", "cautious", "reviews", "savings", "index", "defender", "tactician", "careful", "conservative"],
        "bold": ["bold", "risk", "gamble", "startup", "berserker", "rogue", "high risk", "instinct", "growth", "aggressive", "daring"],
    }
}

PROFILING_QUESTIONS = [
    {
        "id": "chronotype",
        "trait": "chronotype",
        "category": "Biological Rhythm",
        "q": "What best describes your energy pattern throughout the day?",
        "options": ["Early Bird (Peak energy in morning)", "Night Owl (Peak energy late at night)"],
        "keys": ["early", "night"],
    },
    {
        "id": "environment",
        "trait": "environment",
        "category": "Sensory Environment",
        "q": "Where do you recharge your mental battery?",
        "options": ["Quiet Solitude (Peace and silence)", "Dynamic Spaces (Lively buzz and crowds)"],
        "keys": ["quiet", "crowd"],
    },
    {
        "id": "planning",
        "trait": "planning",
        "category": "Organization Style",
        "q": "How do you approach an upcoming weekend or free week?",
        "options": ["Meticulously Planned Itinerary", "Spontaneous & Go with the Flow"],
        "keys": ["planned", "spontaneous"],
    },
    {
        "id": "risk",
        "trait": "risk",
        "category": "Risk Appetite",
        "q": "When choosing a restaurant in a new city, what is your move?",
        "options": ["Check reviews & go with highest rated safe bet", "Wander around and pick a quirky spot on instinct"],
        "keys": ["safe", "bold"],
    }
]

QUIZ_QUESTION_BANK = [
    {
        "id": "q_run_time",
        "trait": "chronotype",
        "category": "Daily Routine",
        "q": "If you had to do a vigorous 5km run today, when would you do it?",
        "options": ["6:00 AM (Catch the sunrise)", "9:30 PM (Under the night lights)"],
        "affinity": {"early": 0, "night": 1},
        "option_keywords": [["6:00", "6am", "am", "morning", "sunrise", "early"], ["9:30", "9pm", "pm", "night", "dark", "evening"]]
    },
    {
        "id": "q_vacation_spot",
        "trait": "environment",
        "category": "Travel",
        "q": "Which dream vacation sounds most appealing to you?",
        "options": ["Secluded cabin deep in the misty mountains", "Vibrant penthouse in downtown Tokyo or NYC"],
        "affinity": {"quiet": 0, "crowd": 1},
        "option_keywords": [["cabin", "mountain", "mountains", "nature", "woods", "quiet", "forest"], ["penthouse", "tokyo", "nyc", "city", "downtown", "vibrant", "party"]]
    },
    {
        "id": "q_alarm_reaction",
        "trait": "chronotype",
        "category": "Daily Routine",
        "q": "Your alarm rings at 6:30 AM on a workday. What is your reaction?",
        "options": ["Up instantly, ready to seize the day", "Hit snooze 3 times and question your life choices"],
        "affinity": {"early": 0, "night": 1},
        "option_keywords": [["up", "instant", "instantly", "wake", "ready", "seize", "energy"], ["snooze", "sleep", "tired", "later", "bed", "question"]]
    },
    {
        "id": "q_work_space",
        "trait": "environment",
        "category": "Work Style",
        "q": "Where would you feel most productive writing a deep-focus report?",
        "options": ["A whisper-quiet private study room", "A buzzing artisan coffee shop with lo-fi music"],
        "affinity": {"quiet": 0, "crowd": 1},
        "option_keywords": [["quiet", "study", "private", "silent", "home", "library"], ["coffee", "cafe", "buzzing", "music", "crowd", "shop", "people"]]
    },
    {
        "id": "q_travel_packing",
        "trait": "planning",
        "category": "Lifestyle",
        "q": "How do you pack your luggage for a week-long journey?",
        "options": ["Spreadsheet & color-coded pouches 3 days in advance", "Throw clothes into the bag 40 minutes before leaving"],
        "affinity": {"planned": 0, "spontaneous": 1},
        "option_keywords": [["spreadsheet", "pouches", "advance", "organized", "checklist", "days ahead"], ["throw", "last minute", "40 minutes", "rush", "spontaneous", "clothes"]]
    },
    {
        "id": "q_investment",
        "trait": "risk",
        "category": "Decision Making",
        "q": "You receive an unexpected $5,000 bonus. Where does it go?",
        "options": ["High-yield savings or steady index fund", "High-growth speculative tech or exciting startup venture"],
        "affinity": {"safe": 0, "bold": 1},
        "option_keywords": [["savings", "index", "safe", "fund", "bank", "steady", "conservative"], ["crypto", "startup", "venture", "tech", "speculative", "risk", "growth"]]
    },
    {
        "id": "q_friday_evening",
        "trait": "environment",
        "category": "Social Life",
        "q": "It's Friday 8:00 PM after an exhausting week. Where are you?",
        "options": ["Curled on the couch with a good book or movie", "At a lively rooftop party or busy restaurant with friends"],
        "affinity": {"quiet": 0, "crowd": 1},
        "option_keywords": [["couch", "book", "movie", "home", "relaxing", "curled", "solo", "netflix"], ["party", "rooftop", "friends", "restaurant", "out", "dancing", "drinks"]]
    },
    {
        "id": "q_creative_hour",
        "trait": "chronotype",
        "category": "Cognitive Rhythm",
        "q": "When do your wildest, most creative ideas strike?",
        "options": ["During the calm dawn before the world awakens", "Past midnight when the rest of the world is asleep"],
        "affinity": {"early": 0, "night": 1},
        "option_keywords": [["dawn", "calm", "morning", "sunrise", "early hours", "daybreak"], ["midnight", "night", "past midnight", "late", "dark", "2am", "3am"]]
    },
    {
        "id": "q_grocery_run",
        "trait": "planning",
        "category": "Daily Routine",
        "q": "Entering the grocery supermarket on Sunday afternoon:",
        "options": ["Strict list in hand, strictly stick to the aisles", "Browse leisurely and grab whatever looks delicious"],
        "affinity": {"planned": 0, "spontaneous": 1},
        "option_keywords": [["list", "strict", "plan", "aisles", "specific", "stick"], ["browse", "delicious", "wander", "whatever", "random", "craving"]]
    },
    {
        "id": "q_adventure_game",
        "trait": "risk",
        "category": "Entertainment",
        "q": "In a role-playing game or strategy challenge, what role fits you best?",
        "options": ["The Defender/Tactician (high armor, calculated moves)", "The Berserker/Rogue (high risk, high critical damage)"],
        "affinity": {"safe": 0, "bold": 1},
        "option_keywords": [["defender", "tactician", "armor", "calculated", "shield", "tank"], ["berserker", "rogue", "damage", "attack", "high risk", "critical", "dps"]]
    },
    {
        "id": "q_dinner_choice",
        "trait": "planning",
        "category": "Lifestyle",
        "q": "Dinner plans on a normal Wednesday night:",
        "options": ["Meal-prepped or decided hours ahead", "Decided at 7:30 PM based on whatever craving hits"],
        "affinity": {"planned": 0, "spontaneous": 1},
        "option_keywords": [["meal prep", "prepped", "decided ahead", "plan", "cook ahead"], ["craving", "whatever", "takeout", "last minute", "order", "7:30"]]
    },
    {
        "id": "q_study_partner",
        "trait": "environment",
        "category": "Learning",
        "q": "Prepping for a high-stakes exam or certification:",
        "options": ["Solo deep-dive in complete isolation", "Study group discussion with lively debates"],
        "affinity": {"quiet": 0, "crowd": 1},
        "option_keywords": [["solo", "isolation", "deep dive", "alone", "quiet", "self study"], ["group", "discussion", "debates", "peers", "study group", "talk", "team"]]
    }
]


class PredictiveEngine:
    """
    Stateful predictive bot engine with text resolution and dynamic prediction.
    Features:
    1. Robust text matching for freeform user input.
    2. Adaptive prediction engine that learns from both baseline profile and typed vocabulary.
    3. Silent O(1) state evaluation with zero intrusive popups.
    4. Delayed reveal unlock (triggered only when streak >= 3 or total_questions >= 10).
    """

    def __init__(self, min_questions: int = 10, streak_target: int = 3):
        self.min_questions = min_questions
        self.streak_target = streak_target

        self.phase = "profiling"  # "profiling" | "quiz" | "revealed"
        self.profiling_index = 0
        self.quiz_index = 0

        self.user_profile: Dict[str, str] = {}
        self.user_vocabulary: Counter = Counter()  # Tracks user terminology and keywords
        self.total_questions = 0
        self.total_hits = 0
        self.current_streak = 0
        self.max_streak = 0
        self.history: List[Dict[str, Any]] = []

        # Online Frequency Prior: tracks option bias over time
        self.choice_position_priors: Counter = Counter()

        # Cache the silent prediction for the currently presented quiz question
        self._current_prediction: Optional[Dict[str, Any]] = None
        self.reveal_triggered = False
        self.reveal_reason = ""

    def get_active_question(self) -> Optional[Dict[str, Any]]:
        """Returns the question currently awaiting user response."""
        if self.phase == "profiling":
            if self.profiling_index < len(PROFILING_QUESTIONS):
                item = PROFILING_QUESTIONS[self.profiling_index]
                return {
                    "question_id": item["id"],
                    "phase": "profiling",
                    "step_number": self.profiling_index + 1,
                    "total_steps": len(PROFILING_QUESTIONS),
                    "category": item["category"],
                    "question": item["q"],
                    "options": item["options"],
                }
            else:
                self.phase = "quiz"

        if self.phase in ("quiz", "revealed"):
            if self.quiz_index < len(QUIZ_QUESTION_BANK):
                item = QUIZ_QUESTION_BANK[self.quiz_index]

                # Pre-calculate internal prediction silently
                if self._current_prediction is None or self._current_prediction.get("question_id") != item["id"]:
                    pred_idx = self._predict_option_index(item)
                    pred_text = item["options"][pred_idx] if 0 <= pred_idx < len(item["options"]) else ""
                    self._current_prediction = {
                        "question_id": item["id"],
                        "predicted_index": pred_idx,
                        "predicted_text": pred_text,
                    }

                return {
                    "question_id": item["id"],
                    "phase": self.phase,
                    "step_number": self.total_questions + 1,
                    "min_questions": self.min_questions,
                    "streak_target": self.streak_target,
                    "category": item["category"],
                    "question": item["q"],
                    "options": item["options"],
                }

        return None

    def _predict_option_index(self, q_data: Dict[str, Any]) -> int:
        """
        Predicts option index using trait affinities, enriched with learned user vocabulary.
        """
        trait = q_data.get("trait")
        options = q_data.get("options", [])
        num_options = len(options)
        if not options:
            return 0

        # 1. Trait Affinity Rule
        if trait and trait in self.user_profile:
            user_trait_val = self.user_profile[trait]
            affinity_map = q_data.get("affinity", {})
            if user_trait_val in affinity_map:
                pred_idx = affinity_map[user_trait_val]
                if 0 <= pred_idx < num_options:
                    return pred_idx

        # 2. Vocabulary Match: Check if user previously typed words that correlate with any option's keywords
        option_keywords = q_data.get("option_keywords", [])
        best_vocab_score = 0
        best_vocab_idx = -1
        for idx, kws in enumerate(option_keywords):
            score = sum(self.user_vocabulary[kw] for kw in kws if kw in self.user_vocabulary)
            if score > best_vocab_score:
                best_vocab_score = score
                best_vocab_idx = idx

        if best_vocab_idx >= 0 and best_vocab_idx < num_options:
            return best_vocab_idx

        # 3. Adaptive Prior Fallback (most frequently chosen position)
        if self.choice_position_priors:
            most_common_pos, _ = self.choice_position_priors.most_common(1)[0]
            if most_common_pos < num_options:
                return most_common_pos

        # 4. Default fallback
        return 0

    def _resolve_user_input(self, q_data: Dict[str, Any], choice_index: Optional[int], choice_text: Optional[str]) -> Tuple[int, str]:
        """
        Resolves either numeric index or freeform text to an option index and display text.
        Accepts:
        - Exact option clicks (choice_index)
        - Typed numbers ("1", "2")
        - Typed keywords ("morning", "quiet cabin", "party", "run at 6am")
        """
        options = q_data.get("options", [])
        num_options = len(options)

        # Case 1: Valid choice_index passed directly
        if choice_index is not None and 0 <= choice_index < num_options:
            actual_text = choice_text.strip() if choice_text and choice_text.strip() else options[choice_index]
            return choice_index, actual_text

        # Case 2: User provided text input
        if choice_text and choice_text.strip():
            raw = choice_text.strip()
            raw_lower = raw.lower()

            # Check if user typed a number (e.g. "1" or "2")
            if raw.isdigit():
                val = int(raw)
                if 1 <= val <= num_options:
                    return val - 1, options[val - 1]

            # Direct substring match against options
            for idx, opt in enumerate(options):
                if raw_lower in opt.lower() or opt.lower() in raw_lower:
                    return idx, raw

            # Check against question option_keywords if available
            option_keywords = q_data.get("option_keywords", [])
            tokens = re.findall(r'\b\w+\b', raw_lower)
            best_kw_match = -1
            max_kw_hits = 0

            for idx, kws in enumerate(option_keywords):
                hits = sum(1 for kw in kws if kw in raw_lower or any(t == kw for t in tokens))
                if hits > max_kw_hits:
                    max_kw_hits = hits
                    best_kw_match = idx

            if best_kw_match >= 0:
                return best_kw_match, raw

            # Token overlap score with options
            best_opt_idx = 0
            best_score = 0
            for idx, opt in enumerate(options):
                opt_tokens = set(re.findall(r'\b\w+\b', opt.lower()))
                overlap = sum(1 for t in tokens if t in opt_tokens)
                if overlap > best_score:
                    best_score = overlap
                    best_opt_idx = idx

            return best_opt_idx, raw

        # Default fallback
        return 0, options[0] if options else ""

    def _learn_traits_from_text(self, text: str):
        """Extracts and stores personality signals and vocabulary from user's typed input."""
        if not text:
            return

        tokens = set(re.findall(r'\b\w+\b', text.lower()))
        for token in tokens:
            self.user_vocabulary[token] += 1

        text_lower = text.lower()
        # Check trait keywords with exact token/phrase matching
        for trait, values in TRAIT_KEYWORDS.items():
            for val_key, kws in values.items():
                for kw in kws:
                    if " " in kw:
                        if kw in text_lower:
                            self.user_profile[trait] = val_key
                            break
                    else:
                        if kw in tokens:
                            self.user_profile[trait] = val_key
                            break

    def submit_answer(self, choice_index: Optional[int] = None, choice_text: Optional[str] = None) -> Dict[str, Any]:
        """Submits an answer (either button click or freeform text) for active question."""
        if self.phase == "profiling":
            return self._handle_profiling_answer(choice_index, choice_text)
        elif self.phase in ("quiz", "revealed"):
            return self._handle_quiz_answer(choice_index, choice_text)
        else:
            return {"status": "error", "message": "Unknown phase"}

    def _handle_profiling_answer(self, choice_index: Optional[int], choice_text: Optional[str]) -> Dict[str, Any]:
        if self.profiling_index >= len(PROFILING_QUESTIONS):
            self.phase = "quiz"
            return {"status": "ok", "next_question": self.get_active_question()}

        current_q = PROFILING_QUESTIONS[self.profiling_index]
        keys = current_q["keys"]
        trait = current_q["trait"]

        # Resolve input
        resolved_idx, actual_display_text = self._resolve_user_input(current_q, choice_index, choice_text)
        stored_trait = keys[resolved_idx] if 0 <= resolved_idx < len(keys) else keys[0]
        self.user_profile[trait] = stored_trait

        if choice_text:
            self._learn_traits_from_text(choice_text)

        self.profiling_index += 1

        # Check if profiling complete
        if self.profiling_index >= len(PROFILING_QUESTIONS):
            self.phase = "quiz"
            next_q = self.get_active_question()
            return {
                "status": "profiling_completed",
                "message": "Baseline psychometric traits calibrated. Neural prediction engine activated.",
                "user_profile": self.user_profile,
                "resolved_choice": actual_display_text,
                "next_question": next_q,
                "is_reveal": False,
            }
        else:
            return {
                "status": "profiling_progress",
                "message": f"Recorded trait for {current_q['category']}.",
                "resolved_choice": actual_display_text,
                "next_question": self.get_active_question(),
                "is_reveal": False,
            }

    def _handle_quiz_answer(self, choice_index: Optional[int], choice_text: Optional[str]) -> Dict[str, Any]:
        if self.quiz_index >= len(QUIZ_QUESTION_BANK):
            return {
                "status": "quiz_exhausted",
                "message": "All trial questions completed.",
                "is_reveal": True,
                "reveal_data": self.get_reveal_summary(),
                "next_question": None,
            }

        q_item = QUIZ_QUESTION_BANK[self.quiz_index]
        options = q_item["options"]

        # Resolve user choice
        actual_idx, actual_text = self._resolve_user_input(q_item, choice_index, choice_text)

        # Learn vocabulary and traits from user's typed text for future questions
        if choice_text:
            self._learn_traits_from_text(choice_text)

        # Retrieve silent pre-computed prediction
        prediction = self._current_prediction or {
            "predicted_index": self._predict_option_index(q_item),
            "predicted_text": options[0],
        }
        pred_idx = prediction["predicted_index"]
        pred_text = prediction["predicted_text"]

        # Hit evaluation:
        # Match if option indices equal OR user's typed text contains predicted keywords
        is_hit = (pred_idx == actual_idx)
        if not is_hit and choice_text:
            pred_kws = q_item.get("option_keywords", [])[pred_idx] if q_item.get("option_keywords") else []
            choice_lower = choice_text.lower()
            if any(kw in choice_lower for kw in pred_kws):
                is_hit = True

        self.total_questions += 1
        self.choice_position_priors[actual_idx] += 1

        if is_hit:
            self.current_streak += 1
            self.total_hits += 1
            if self.current_streak > self.max_streak:
                self.max_streak = self.current_streak
        else:
            self.current_streak = 0

        # Record to history with user's actual text
        entry = {
            "step": self.total_questions,
            "question_id": q_item["id"],
            "question": q_item["q"],
            "category": q_item["category"],
            "predicted": pred_text,
            "predicted_index": pred_idx,
            "actual": actual_text,
            "actual_index": actual_idx,
            "hit": is_hit,
            "streak_at_step": self.current_streak,
        }
        self.history.append(entry)

        # Advance quiz pointer
        self.quiz_index += 1
        self._current_prediction = None

        # Threshold check: total_questions >= min_questions or current_streak >= streak_target
        streak_triggered = self.current_streak >= self.streak_target
        questions_triggered = self.total_questions >= self.min_questions

        is_reveal = False
        reveal_payload = None

        if (streak_triggered or questions_triggered) and not self.reveal_triggered:
            self.reveal_triggered = True
            self.phase = "revealed"
            self.reveal_reason = (
                f"{self.streak_target}-Hit Streak Locked! The bot anticipated your moves."
                if streak_triggered
                else "Baseline Question Milestone Reached!"
            )
            is_reveal = True
            reveal_payload = self.get_reveal_summary()

        next_q = self.get_active_question()

        return {
            "status": "turn_completed",
            "is_hit": is_hit,
            "current_streak": self.current_streak,
            "total_hits": self.total_hits,
            "total_questions": self.total_questions,
            "is_reveal": is_reveal,
            "reveal_data": reveal_payload,
            "resolved_choice": actual_text,
            "next_question": next_q,
        }

    def get_reveal_summary(self) -> Dict[str, Any]:
        """Calculates archetype and accuracy breakdown for the reveal view."""
        accuracy = (self.total_hits / self.total_questions * 100) if self.total_questions > 0 else 0.0

        chrono = self.user_profile.get("chronotype", "early")
        env = self.user_profile.get("environment", "quiet")
        plan = self.user_profile.get("planning", "planned")
        risk = self.user_profile.get("risk", "safe")

        if env == "quiet" and plan == "planned":
            archetype = "The Strategist Monk"
            description = "Methodical, laser-focused, deeply contemplative, valuing quiet efficiency over noisy impulse."
        elif env == "crowd" and plan == "spontaneous":
            archetype = "The Freeform Catalyst"
            description = "Energized by vibrant crowds, adaptable to chaos, and thrives on spur-of-the-moment adventures."
        elif env == "quiet" and risk == "bold":
            archetype = "The Silent Maverick"
            description = "Quietly independent with a strong appetite for asymmetric risk and bold intuitive bets."
        else:
            archetype = "The Harmonic Navigator"
            description = "Balanced pragmatist who transitions smoothly between structured focus and dynamic exploration."

        return {
            "reason": self.reveal_reason,
            "total_hits": self.total_hits,
            "total_questions": self.total_questions,
            "accuracy_percent": round(accuracy, 1),
            "max_streak": self.max_streak,
            "current_streak": self.current_streak,
            "user_profile": self.user_profile,
            "archetype": archetype,
            "description": description,
            "history": self.history,
        }

    def get_debug_state(self) -> Dict[str, Any]:
        """Provides inspector access to hidden internal predictions and state."""
        return {
            "phase": self.phase,
            "user_profile": self.user_profile,
            "total_questions": self.total_questions,
            "total_hits": self.total_hits,
            "current_streak": self.current_streak,
            "max_streak": self.max_streak,
            "reveal_triggered": self.reveal_triggered,
            "current_prediction": self._current_prediction,
            "history": self.history,
            "vocabulary_size": len(self.user_vocabulary),
        }
