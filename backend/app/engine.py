import re
import random
import hashlib
from typing import List, Dict, Any, Optional, Tuple

# Phase 1: 3 Personality Calibration Probes
PROFILING_QUESTIONS = [
    {
        "id": "calib_temperament",
        "trait": "temperament",
        "category": "Risk & Decision Temperament",
        "q": "Calibration 1: When planning a major weekend or long journey, what is your natural instinct?",
        "options": [
            "Structured & Cautious (Calculate details, avoid surprises)",
            "Bold & Spontaneous (Embrace risk, dive into the unknown)"
        ],
        "keys": ["cautious", "bold"],
        "keywords": {
            "cautious": ["cautious", "structured", "plan", "safe", "calculate", "careful", "details", "ahead"],
            "bold": ["bold", "spontaneous", "risk", "flow", "dive", "unknown", "random", "exciting"]
        },
        "input_mode": "both",
        "placeholder": "Select an option or type cautious/bold..."
    },
    {
        "id": "calib_energy",
        "trait": "energy",
        "category": "Social & Sensory Energy",
        "q": "Calibration 2: Where does your mental battery recharge most deeply?",
        "options": [
            "Quiet Solitude (Peaceful focus, deep internal thought)",
            "Dynamic Social Spaces (Lively crowd buzz, group energy)"
        ],
        "keys": ["quiet", "social"],
        "keywords": {
            "quiet": ["quiet", "solitude", "alone", "peace", "focus", "calm", "solo", "internal"],
            "social": ["social", "dynamic", "crowd", "buzz", "people", "energy", "party", "group"]
        },
        "input_mode": "both",
        "placeholder": "Select an option or type quiet/social..."
    },
    {
        "id": "calib_cognition",
        "trait": "cognition",
        "category": "Cognitive Processing Axis",
        "q": "Calibration 3: When solving a complex challenge, what internal mode dominates?",
        "options": [
            "Logical Precision & Numbers (Analytical deduction)",
            "Intuitive Patterns & Imagery (Creative perception)"
        ],
        "keys": ["analytical", "creative"],
        "keywords": {
            "analytical": ["analytical", "logic", "numbers", "math", "precision", "deduction", "reason"],
            "creative": ["creative", "intuitive", "pattern", "imagery", "visual", "art", "feeling"]
        },
        "input_mode": "both",
        "placeholder": "Select an option or type analytical/creative..."
    }
]


def classify_persona(profile: Dict[str, str]) -> Tuple[str, str]:
    temp = profile.get("temperament", "cautious")
    energy = profile.get("energy", "quiet")
    cog = profile.get("cognition", "analytical")

    if temp == "cautious" and cog == "analytical":
        return ("The Analytical Strategist", "Methodical, deliberate deduction, high sensitivity to numerical precision and conservative symmetry.")
    elif temp == "bold" and energy == "social":
        return ("The Maverick Catalyst", "High-velocity spontaneous processing, daring intuitive leaps, attraction to sharp asymmetric anchors.")
    elif cog == "creative" and energy == "quiet":
        return ("The Contemplative Visionary", "Deep internal visualization, attuned to organic harmonic patterns and reflective symbolism.")
    elif temp == "bold" and cog == "analytical":
        return ("The Strategic Disruptor", "Calculated risk-taker who systematically exploits counter-intuitive numerical edges.")
    elif energy == "social" and cog == "creative":
        return ("The Vibrant Synthesizer", "Expressive associative thinker, highly responsive to dynamic color and motor priming.")
    elif temp == "cautious" and energy == "quiet":
        return ("The Silent Observer", "Quiet, focused, highly guarded conscious filter that defaults to timeless fundamental archetypes.")
    else:
        return ("The Harmonic Pragmatist", "Balanced cognitive profile shifting smoothly between logic and instinct.")


# Comprehensive Master Catalog of Forcing Trials
# Both number forces and highly accurate dynamic non-number forces
FORCING_TRIALS_MASTER = [
    # --- 1. NUMBER FORCES (Mathematical & Psychological) ---
    {
        "id": "num_force_1089",
        "category": "Algebraic Invariance",
        "domain": "numerical",
        "q": "Perform this classic thought experiment in your head:\n\n1. Think of any 3-digit number where the first and last digits differ by at least 2 (e.g. 732).\n2. Reverse the digits (e.g. 237).\n3. Subtract the smaller from the larger (732 - 237 = 495).\n4. Reverse that answer (e.g. 594).\n5. Add those last two numbers together (495 + 594).\n\nType the final sum that remains in your mind:",
        "input_mode": "freeform",
        "placeholder": "Type the final total...",
        "resolver": lambda p: {
            "target": "1089",
            "synonyms": ["1089", "one thousand eighty nine", "1,089", "1089."],
            "secondary": [],
            "insight": "Mathematical invariance! Regardless of your initial 3-digit choice, algebraic symmetry collapses every combination to exactly 1089."
        }
    },
    {
        "id": "num_force_odd_two_digit",
        "category": "Asymmetric Odd Prime",
        "domain": "numerical",
        "q": "Focus your mind on numbers between 10 and 90.\n\n• Think of a 2-digit number.\n• Both digits must be ODD.\n• Both digits cannot be the same (for example, not 11 or 55).\n\nDo not compute. Type the very first odd number that flashes on your mental screen:",
        "input_mode": "freeform",
        "placeholder": "Type your 2-digit odd number...",
        "resolver": lambda p: (
            {
                "target": "73",
                "synonyms": ["73", "seventy three", "seventy-three", "7 3"],
                "secondary": ["37", "75"],
                "insight": "As a bold, spontaneous thinker, your subconscious inverted the conservative lower range and surged into the high-asymmetry maverick prime: 73."
            }
            if p.get("temperament") == "bold"
            else {
                "target": "37",
                "synonyms": ["37", "thirty seven", "thirty-seven", "3 7", "thirtyseven"],
                "secondary": ["35", "39"],
                "insight": "As a cautious, structured thinker, your subconscious avoided extreme digits (19, 79), eliminated rounded 5s (15, 35), and anchored into 37—the universal cornerstone prime."
            }
        )
    },
    {
        "id": "num_force_single_digit",
        "category": "Cognitive Elimination",
        "domain": "numerical",
        "q": "Quickly pick any single digit between 1 and 10.\n\n• Eliminate 1 and 10.\n• Discard all even numbers (2, 4, 6, 8).\n• Discard the exact middle number (5).\n\nType the single digit left standing in your mind:",
        "input_mode": "freeform",
        "placeholder": "Type the single digit...",
        "resolver": lambda p: (
            {
                "target": "7",
                "synonyms": ["7", "seven", "seven."],
                "secondary": ["3"],
                "insight": "Quiet, reflective thinkers gravitate toward 7—the solitary, contemplative prime."
            }
            if p.get("energy") == "quiet"
            else {
                "target": "3",
                "synonyms": ["3", "three", "three."],
                "secondary": ["7"],
                "insight": "Dynamic, high-arousal thinkers subconsciously select 3—the energetic triad anchor."
            }
        )
    },
    {
        "id": "num_force_magic_4",
        "category": "Algebraic Cancellation",
        "domain": "numerical",
        "q": "Follow this mental calculation:\n\n1. Pick any secret number from 1 to 10.\n2. Multiply it by 2.\n3. Add 8.\n4. Divide by 2.\n5. Subtract your original secret number.\n\nType the final number remaining in your thoughts:",
        "input_mode": "freeform",
        "placeholder": "Type the remaining number...",
        "resolver": lambda p: {
            "target": "4",
            "synonyms": ["4", "four", "4."],
            "secondary": [],
            "insight": "Pure algebraic cancellation: ((2x + 8) / 2) - x = 4. Your original secret choice was wiped out, locking 4 in place before you even chose."
        }
    },
    {
        "id": "num_force_digital_root_9",
        "category": "Digital Root Multiplier",
        "domain": "numerical",
        "q": "Think of any integer between 1 and 100.\n\n1. Multiply it by 9.\n2. Add all the digits of your answer together.\n(If your result is still two digits, add them again until you have a single digit).\n\nType that final single digit:",
        "input_mode": "freeform",
        "placeholder": "Type the single digit sum...",
        "resolver": lambda p: {
            "target": "9",
            "synonyms": ["9", "nine", "9."],
            "secondary": [],
            "insight": "Every multiple of 9 in base-10 mathematics reduces to a digital root of 9. The funnel guarantees that any number chosen ends at 9."
        }
    },
    {
        "id": "num_force_fibonacci_21",
        "category": "Harmonic Growth Ratio",
        "domain": "numerical",
        "q": "Think of a number between 15 and 25 associated with perfect balance, golden ratio growth, or maximum strategic winning odds.\n\nDon't calculate, type the number:",
        "input_mode": "freeform",
        "placeholder": "Type the number...",
        "resolver": lambda p: {
            "target": "21",
            "synonyms": ["21", "twenty one", "twenty-one", "2 1"],
            "secondary": ["25", "23"],
            "insight": "21 holds profound cultural and mathematical resonance as the 8th Fibonacci number and the classic threshold of strategic mastery."
        }
    },
    {
        "id": "num_force_century_100",
        "category": "Perceptual Ceiling",
        "domain": "numerical",
        "q": "Picture a progress bar or battery indicator surging to absolute peak completion.\n\nType the iconic landmark number you see:",
        "input_mode": "freeform",
        "placeholder": "Type the landmark number...",
        "resolver": lambda p: {
            "target": "100",
            "synonyms": ["100", "one hundred", "hundred", "100%"],
            "secondary": [],
            "insight": "Base-10 cognitive conditioning sets 100 as the definitive psychological horizon for absolute completion."
        }
    },

    # --- 2. ACCURATE & DYNAMIC NON-NUMBER FORCES ---
    {
        "id": "force_tool_color",
        "category": "Motor Cortex Priming",
        "domain": "semantic",
        "q": "Do these simple math sums in your head as fast as you can:\n2 + 2 = 4\n4 + 4 = 8\n8 + 8 = 16\n16 + 16 = 32\n\nNow QUICK! Don't let your conscious mind filter it:\nType the very first HAND TOOL (like in a household toolbox) and a primary COLOR that pops into your head:",
        "input_mode": "freeform",
        "placeholder": "e.g. tool and color...",
        "resolver": lambda p: (
            {
                "target": "Blue Wrench",
                "synonyms": ["blue wrench", "wrench blue", "wrench", "blue tool", "blue spanner"],
                "secondary": ["steel wrench", "blue screwdriver"],
                "insight": "Analytical profiles prioritize mechanical precision over brute impact, shifting the prototype to 'Wrench' and the calm primary 'Blue'."
            }
            if p.get("cognition") == "analytical" and p.get("temperament") == "cautious"
            else {
                "target": "Red Hammer",
                "synonyms": ["red hammer", "hammer red", "hammer", "red mallet", "claw hammer", "sledgehammer", "a red hammer"],
                "secondary": ["yellow hammer", "blue hammer"],
                "insight": "Bold spontaneous thinkers trigger high-arousal motor cortex neurons, driving 'Hammer' as the physical tool prototype and 'Red' as the dominant focal color."
            }
        )
    },
    {
        "id": "force_stroop_drink",
        "category": "Phonemic Stroop Prime",
        "domain": "semantic",
        "q": "Repeat the word 'WHITE' in your mind 5 times quickly:\nWhite... White... White... White... White...\n\nNow QUICK! In one split second without thinking:\nWhat do cows drink?",
        "input_mode": "freeform",
        "placeholder": "Type your split-second thought...",
        "resolver": lambda p: {
            "target": "Milk",
            "synonyms": ["milk", "cold milk", "a glass of milk", "white milk", "fresh milk"],
            "secondary": ["water"],
            "insight": "The phonemic Stroop trap! Even though adult cows drink water, repeating 'White' primes the semantic node 'cow -> white -> milk', bypassing conscious logic in over 90% of minds."
        }
    },
    {
        "id": "force_geometric_gestalt",
        "category": "Spatial Gestalt",
        "domain": "spatial",
        "q": "Picture a clean whiteboard in your mind. Draw the simplest 3-sided polygon in the center.\n\nNow draw a continuous curved circle around or inside it.\n\nType the two shapes you drew:",
        "input_mode": "freeform",
        "placeholder": "Type the two shapes...",
        "resolver": lambda p: (
            {
                "target": "Circle inside Square",
                "synonyms": ["circle inside square", "square inside circle", "square and circle", "circle and square", "circle square", "square circle"],
                "secondary": ["triangle and circle"],
                "insight": "Analytical minds naturally prioritize orthogonal stability (Square) framed with continuous symmetry (Circle)."
            }
            if p.get("cognition") == "analytical" and p.get("temperament") == "cautious"
            else {
                "target": "Triangle and Circle",
                "synonyms": ["triangle and circle", "circle and triangle", "triangle inside circle", "circle inside triangle", "triangle circle", "circle triangle", "triangle, circle", "circle, triangle"],
                "secondary": ["square and circle"],
                "insight": "Gestalt psychology proves that spontaneous minds universally couple the simplest 3-sided polygon (Triangle) with the infinite continuous curve (Circle)."
            }
        )
    },
    {
        "id": "force_index_finger",
        "category": "Tactile Somatosensory",
        "domain": "kinesthetic",
        "q": "Hold up your dominant hand in front of you. Point directly at the center of the screen.\n\nWhich finger on that hand did you extend to point?",
        "input_mode": "freeform",
        "placeholder": "Type the finger...",
        "resolver": lambda p: {
            "target": "Index finger",
            "synonyms": ["index finger", "index", "pointer", "pointer finger", "forefinger", "first finger", "the index finger"],
            "secondary": ["middle finger", "thumb"],
            "insight": "The brain's primary motor cortex allocates disproportionately large neurological bandwidth to the index finger, making it the mandatory pathway for pointing."
        }
    },
    {
        "id": "force_animal_denmark",
        "category": "Phonetic Invariance",
        "domain": "semantic",
        "q": "Perform this thought experiment:\n\n1. Pick any number from 1 to 9.\n2. Multiply it by 9.\n3. Add the two digits together (always 9).\n4. Subtract 5 from that result (always 4).\n5. Match 4 to the 4th letter of the alphabet: D.\n6. Think of a European country starting with D.\n7. Take the 2nd letter of that country (E), and think of a large wild animal.\n\nType the animal and country you are picturing:",
        "input_mode": "freeform",
        "placeholder": "Type the animal and country...",
        "resolver": lambda p: (
            {
                "target": "Elephant in Denmark",
                "synonyms": ["elephant in denmark", "denmark elephant", "elephant denmark", "elephant", "denmark", "grey elephant in denmark", "gray elephant in denmark"],
                "secondary": ["kangaroo in denmark", "kangaroo"],
                "insight": "Mathematical invariance guarantees letter D -> Denmark -> E -> Elephant in over 93% of human subjects."
            }
        )
    },
    {
        "id": "force_playing_card",
        "category": "Iconic Salience",
        "domain": "spatial",
        "q": "Imagine spreading a brand new deck of 52 playing cards across a black table. Remove all Kings, Queens, and Jacks.\n\nReach into the center and pull out ONE iconic card.\n\nType the card you are holding:",
        "input_mode": "freeform",
        "placeholder": "e.g. 7 of hearts, ace of...",
        "resolver": lambda p: (
            {
                "target": "7 of Diamonds",
                "synonyms": ["7 of diamonds", "seven of diamonds", "diamond 7", "7 diamonds", "the 7 of diamonds"],
                "secondary": ["ace of spades"],
                "insight": "Analytical minds naturally gravitate toward the sharp angular symmetry of the 7 of Diamonds."
            }
            if p.get("cognition") == "analytical"
            else {
                "target": "Ace of Spades",
                "synonyms": ["ace of spades", "ace spades", "spade ace", "ace of spade", "the ace of spades"],
                "secondary": ["7 of diamonds"],
                "insight": "In a 52-card search space, the Ace of Spades holds the highest cultural weight and visual prestige."
            }
        )
    },
    {
        "id": "force_fruit_apple",
        "category": "Semantic Prototype",
        "domain": "semantic",
        "q": "Think of a fresh, crisp, round fruit growing on an orchard tree.\n\nType the first fruit that flashes in your mind in one second:",
        "input_mode": "freeform",
        "placeholder": "Type the fruit...",
        "resolver": lambda p: {
            "target": "Apple",
            "synonyms": ["apple", "red apple", "apples", "an apple", "green apple"],
            "secondary": ["orange", "peach"],
            "insight": "In cognitive linguistic prototyping, 'Apple' is the primary cognitive anchor for the semantic category 'fruit', selected by over 78% of respondents."
        }
    }
]


def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def evaluate_forcing_match(user_text: str, target: str, synonyms: List[str], secondary: List[str] = []) -> Tuple[bool, str]:
    norm_user = normalize_text(user_text)
    if not norm_user:
        return False, "diverged"

    norm_target = normalize_text(target)
    norm_synonyms = [normalize_text(s) for s in synonyms]

    # 1. Exact match with target or primary synonyms
    if norm_user == norm_target or norm_user in norm_synonyms:
        return True, "high"

    # 2. Whole phrase / token regex match
    for syn in norm_synonyms:
        pattern = r'\b' + re.escape(syn) + r'\b'
        if re.search(pattern, norm_user):
            return True, "high"

    # 3. Token subset match for multi-word targets
    target_tokens = set(norm_target.split())
    user_tokens = set(norm_user.split())
    if len(target_tokens) > 1 and target_tokens.issubset(user_tokens):
        return True, "high"

    # 4. Secondary fallback match
    norm_secondary = [normalize_text(s) for s in secondary]
    for sec in norm_secondary:
        pattern = r'\b' + re.escape(sec) + r'\b'
        if re.search(pattern, norm_user):
            return True, "medium"

    # 5. Substring containment
    for syn in norm_synonyms:
        if len(syn) >= 4 and syn in norm_user:
            return True, "high"

    return False, "diverged"


def generate_sealed_hash(target: str, question_id: str, session_id: str) -> str:
    salt = "aura_personality_salt_2026"
    raw = f"{target}:{question_id}:{session_id}:{salt}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()[:12].upper()


class PredictiveEngine:
    """
    Dynamic Personality-Driven Cognitive Prediction Engine.
    All secret predictions are calculated in the background and stored exclusively in Mind-Peek.
    """

    def __init__(self, session_id: Optional[str] = None, min_questions: int = 10, streak_target: int = 3):
        self.session_id = session_id or "default_session"
        self.min_questions = min_questions
        self.streak_target = streak_target

        self.phase = "profiling"
        self.profiling_index = 0

        self.user_profile: Dict[str, str] = {}
        self.persona: Optional[str] = None
        self.persona_description: Optional[str] = None

        self.dynamic_queue: List[Dict[str, Any]] = []
        self.queue_index = 0

        self.total_questions = 0
        self.total_hits = 0
        self.current_streak = 0
        self.max_streak = 0
        self.history: List[Dict[str, Any]] = []

        self.reveal_triggered = False
        self.reveal_reason = ""

        seed_int = int(hashlib.md5(self.session_id.encode('utf-8')).hexdigest()[:8], 16)
        self.rng = random.Random(seed_int)

    def _build_dynamic_queue(self):
        """Builds the dynamic question queue customized to this specific user's personality."""
        self.persona, self.persona_description = classify_persona(self.user_profile)

        trials_pool = list(FORCING_TRIALS_MASTER)
        
        # Heavy focus on numbers + accurate dynamic semantic/spatial trials
        numerical_trials = [t for t in trials_pool if t["domain"] == "numerical"]
        other_trials = [t for t in trials_pool if t["domain"] != "numerical"]
        self.rng.shuffle(numerical_trials)
        self.rng.shuffle(other_trials)

        # Assemble queue: Start with strong numbers, interleave high-accuracy dynamic non-numbers
        ordered = []
        ordered.append(numerical_trials[0])
        ordered.append(numerical_trials[1])
        ordered.append(other_trials[0])
        ordered.append(numerical_trials[2])
        ordered.append(other_trials[1])
        ordered.extend(numerical_trials[3:])
        ordered.extend(other_trials[2:])

        resolved_queue = []
        for item in ordered:
            trial_copy = dict(item)
            pred_data = item["resolver"](self.user_profile)
            trial_copy["target"] = pred_data["target"]
            trial_copy["synonyms"] = pred_data["synonyms"]
            trial_copy["secondary"] = pred_data.get("secondary", [])
            trial_copy["psychological_insight"] = pred_data["insight"]
            resolved_queue.append(trial_copy)

        self.dynamic_queue = resolved_queue

    def get_active_question(self) -> Optional[Dict[str, Any]]:
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
                    "input_mode": item.get("input_mode", "both"),
                    "placeholder": item.get("placeholder", "Type your response..."),
                    "sealed_hash": None,
                    "persona": self.persona,
                    "cognitive_branch": "Calibration",
                }
            else:
                self.phase = "forcing"
                if not self.dynamic_queue:
                    self._build_dynamic_queue()

        if self.phase in ("forcing", "quiz", "revealed"):
            if not self.dynamic_queue:
                self._build_dynamic_queue()

            if self.queue_index < len(self.dynamic_queue):
                item = self.dynamic_queue[self.queue_index]
                sealed_hash = generate_sealed_hash(item["target"], item["id"], self.session_id)

                return {
                    "question_id": item["id"],
                    "phase": self.phase,
                    "step_number": self.total_questions + 1,
                    "min_questions": self.min_questions,
                    "streak_target": self.streak_target,
                    "category": item["category"],
                    "question": item["q"],
                    "options": [],
                    "input_mode": "freeform",
                    "placeholder": item.get("placeholder", "Type your immediate thought..."),
                    "sealed_hash": sealed_hash,
                    "persona": self.persona,
                    "cognitive_branch": item.get("domain", "Cognitive").capitalize(),
                }

        return None

    def submit_answer(self, choice_index: Optional[int] = None, choice_text: Optional[str] = None) -> Dict[str, Any]:
        if self.phase == "profiling":
            return self._handle_profiling_answer(choice_index, choice_text)
        elif self.phase in ("forcing", "quiz", "revealed"):
            return self._handle_forcing_answer(choice_index, choice_text)
        else:
            return {"status": "error", "message": "Unknown phase"}

    def _handle_profiling_answer(self, choice_index: Optional[int], choice_text: Optional[str]) -> Dict[str, Any]:
        if self.profiling_index >= len(PROFILING_QUESTIONS):
            self.phase = "forcing"
            if not self.dynamic_queue:
                self._build_dynamic_queue()
            return {"status": "ok", "next_question": self.get_active_question()}

        current_q = PROFILING_QUESTIONS[self.profiling_index]
        keys = current_q["keys"]
        options = current_q["options"]
        trait = current_q["trait"]
        keywords_map = current_q.get("keywords", {})

        actual_text = ""
        chosen_key = None

        if choice_text and choice_text.strip():
            actual_text = choice_text.strip()
            text_lower = actual_text.lower()
            for k, kw_list in keywords_map.items():
                if any(kw in text_lower for kw in kw_list):
                    chosen_key = k
                    break

            if not chosen_key:
                for idx, opt in enumerate(options):
                    if text_lower in opt.lower() or opt.lower() in text_lower:
                        chosen_key = keys[idx]
                        break
        elif choice_index is not None and 0 <= choice_index < len(options):
            actual_text = options[choice_index]
            chosen_key = keys[choice_index]

        if not chosen_key:
            chosen_key = keys[0]
            actual_text = actual_text or options[0]

        self.user_profile[trait] = chosen_key
        self.profiling_index += 1

        if self.profiling_index >= len(PROFILING_QUESTIONS):
            self.phase = "forcing"
            self._build_dynamic_queue()
            next_q = self.get_active_question()
            return {
                "status": "profiling_completed",
                "message": f"Neural baseline calibrated. Persona: {self.persona}. Silent prediction engine engaged.",
                "user_profile": self.user_profile,
                "persona": self.persona,
                "cognitive_branch": "Personalized Targets",
                "resolved_choice": actual_text,
                "next_question": next_q,
                "is_reveal": False,
            }
        else:
            return {
                "status": "profiling_progress",
                "message": f"Recorded {current_q['category']}.",
                "resolved_choice": actual_text,
                "next_question": self.get_active_question(),
                "is_reveal": False,
            }

    def _handle_forcing_answer(self, choice_index: Optional[int], choice_text: Optional[str]) -> Dict[str, Any]:
        if not self.dynamic_queue or self.queue_index >= len(self.dynamic_queue):
            return {
                "status": "trials_completed",
                "message": "All cognitive trials completed.",
                "is_reveal": True,
                "reveal_data": self.get_reveal_summary(),
                "next_question": None,
            }

        trial = self.dynamic_queue[self.queue_index]
        target = trial["target"]
        synonyms = trial.get("synonyms", [])
        secondary = trial.get("secondary", [])
        sealed_hash = generate_sealed_hash(target, trial["id"], self.session_id)

        actual_text = choice_text.strip() if choice_text and choice_text.strip() else ""

        is_hit, match_confidence = evaluate_forcing_match(actual_text, target, synonyms, secondary)

        self.total_questions += 1

        if is_hit:
            self.current_streak += 1
            self.total_hits += 1
            if self.current_streak > self.max_streak:
                self.max_streak = self.current_streak
        else:
            self.current_streak = 0

        # Log prediction exclusively into history for Mind-Peek telemetry
        entry = {
            "step": self.total_questions,
            "question_id": trial["id"],
            "question": trial["q"],
            "category": trial["category"],
            "domain": trial.get("domain", "general"),
            "predicted": target,
            "sealed_hash": sealed_hash,
            "actual": actual_text,
            "hit": is_hit,
            "confidence": match_confidence,
            "insight": trial.get("psychological_insight", ""),
            "streak_at_step": self.current_streak,
        }
        self.history.append(entry)

        self.queue_index += 1

        streak_triggered = self.current_streak >= self.streak_target
        questions_triggered = self.total_questions >= self.min_questions

        is_reveal = False
        reveal_payload = None

        if (streak_triggered or questions_triggered) and not self.reveal_triggered:
            self.reveal_triggered = True
            self.phase = "revealed"
            self.reveal_reason = (
                f"{self.streak_target}-Trial Psychological Hit Streak! Mind-Peek Telemetry Unlocked."
                if streak_triggered
                else "Cognitive Milestone Achieved! Full Telemetry Unlocked."
            )
            is_reveal = True
            reveal_payload = self.get_reveal_summary()

        next_q = self.get_active_question()

        # Predictions are kept silent in chat, delivered to Mind-Peek
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
            "psychological_insight": trial.get("psychological_insight", ""),
            "match_confidence": match_confidence,
            "sealed_prediction": target,
            "sealed_hash": sealed_hash,
            "persona": self.persona,
            "cognitive_branch": trial.get("domain", "Cognitive").capitalize(),
        }

    def get_reveal_summary(self) -> Dict[str, Any]:
        accuracy = (self.total_hits / self.total_questions * 100) if self.total_questions > 0 else 0.0

        return {
            "reason": self.reveal_reason,
            "total_hits": self.total_hits,
            "total_questions": self.total_questions,
            "accuracy_percent": round(accuracy, 1),
            "max_streak": self.max_streak,
            "archetype": self.persona or "The Harmonic Pragmatist",
            "archetype_description": self.persona_description or "Fluid integration across multiple cognitive modalities.",
            "user_profile": self.user_profile,
        }

    def get_debug_state(self) -> Dict[str, Any]:
        current_pred = None
        if self.phase in ("forcing", "quiz", "revealed") and self.dynamic_queue and self.queue_index < len(self.dynamic_queue):
            t = self.dynamic_queue[self.queue_index]
            current_pred = {
                "question_id": t["id"],
                "target": t["target"],
                "sealed_hash": generate_sealed_hash(t["target"], t["id"], self.session_id),
                "category": t["category"],
                "domain": t.get("domain", "general"),
                "psychological_insight": t.get("psychological_insight", "")
            }

        return {
            "phase": self.phase,
            "persona": self.persona,
            "persona_description": self.persona_description,
            "total_questions": self.total_questions,
            "total_hits": self.total_hits,
            "current_streak": self.current_streak,
            "max_streak": self.max_streak,
            "user_profile": self.user_profile,
            "current_prediction": current_pred,
            "history": self.history,
            "queue_length": len(self.dynamic_queue),
            "queue_index": self.queue_index,
        }
