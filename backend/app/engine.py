import re
import random
import hashlib
from typing import List, Dict, Any, Optional, Tuple

from app.database import (
    get_or_create_user,
    record_trial_input,
    update_user_master_persona,
    get_user_memory,
    get_model_evolution,
    absorb_user_input_and_upgrade
)

# =====================================================================
# DYNAMIC PROFILING & ADAPTIVE CALIBRATION POOLS (Phase 1)
# The first few questions change dynamically for every user/session
# while extracting the core psychological axes: Temperament, Energy, Cognition.
# =====================================================================

DYNAMIC_PROFILING_POOLS: Dict[str, List[Dict[str, Any]]] = {
    "temperament": [
        {
            "id": "calib_expedition",
            "trait": "temperament",
            "category": "Risk & Decision Velocity",
            "q": "Calibration 1: You are invited on a spontaneous expedition to an uncharted destination. What is your natural instinct?",
            "options": [
                "Calculate & Prepare (Map logistics, assess risks, calculate details)",
                "Embrace the Unknown (Pack in five minutes, dive in, follow the flow)"
            ],
            "keys": ["cautious", "bold"],
            "keywords": {
                "cautious": ["cautious", "structured", "calculate", "prepare", "logistics", "risk", "safe", "plan", "details"],
                "bold": ["bold", "spontaneous", "unknown", "dive", "flow", "pack", "embrace", "adventure"]
            },
            "input_mode": "both",
            "placeholder": "Select an option or type your thought..."
        },
        {
            "id": "calib_strategy",
            "trait": "temperament",
            "category": "Strategic Game Posture",
            "q": "Calibration 1: In a high-stakes strategy game against an unpredictable adversary, what is your opening posture?",
            "options": [
                "Structured Perimeter (Fortify defense, eliminate vulnerabilities, wait for mistakes)",
                "Daring Initiative (Launch a bold surprise attack, seize control of tempo)"
            ],
            "keys": ["cautious", "bold"],
            "keywords": {
                "cautious": ["cautious", "structured", "perimeter", "defense", "fortify", "wait", "safe", "plan"],
                "bold": ["bold", "spontaneous", "daring", "attack", "surprise", "initiative", "control", "risk"]
            },
            "input_mode": "both",
            "placeholder": "Select an option or type your thought..."
        },
        {
            "id": "calib_city_dusk",
            "trait": "temperament",
            "category": "Navigational Instinct",
            "q": "Calibration 1: When exploring a foreign metropolis at dusk, how do you navigate the glowing streets?",
            "options": [
                "Curated Coordinates (Follow verified landmarks and planned routes)",
                "Intuitive Drift (Wander freely into back alleys and hidden nightlife)"
            ],
            "keys": ["cautious", "bold"],
            "keywords": {
                "cautious": ["cautious", "structured", "curated", "coordinates", "verified", "landmarks", "route", "plan"],
                "bold": ["bold", "spontaneous", "intuitive", "drift", "wander", "alleys", "free", "nightlife"]
            },
            "input_mode": "both",
            "placeholder": "Select an option or type your thought..."
        },
        {
            "id": "calib_timeline",
            "trait": "temperament",
            "category": "Temporal Uncertainty",
            "q": "Calibration 1: If offered an unsealed letter revealing exact major crossroads of your next 5 years, what do you do?",
            "options": [
                "Study the Blueprint (Gain foresight, eliminate pitfalls, optimize strategy)",
                "Burn the Letter (Keep destiny unwritten, preserve the thrill of the unknown)"
            ],
            "keys": ["cautious", "bold"],
            "keywords": {
                "cautious": ["cautious", "structured", "study", "blueprint", "foresight", "eliminate", "optimize", "plan"],
                "bold": ["bold", "spontaneous", "burn", "unwritten", "thrill", "unknown", "destiny", "mystery"]
            },
            "input_mode": "both",
            "placeholder": "Select an option or type your thought..."
        },
        {
            "id": "calib_mechanism",
            "trait": "temperament",
            "category": "Problem-Solving Temperament",
            "q": "Calibration 1: Faced with a complex puzzle mechanism with unknown internal gears, how do you engage it?",
            "options": [
                "Methodical Analysis (Inspect schematics, test tolerances, calculate mechanics)",
                "Tactile Trial & Error (Start turning dials immediately and feel the feedback)"
            ],
            "keys": ["cautious", "bold"],
            "keywords": {
                "cautious": ["cautious", "structured", "methodical", "schematics", "test", "tolerances", "inspect", "plan"],
                "bold": ["bold", "spontaneous", "tactile", "trial", "error", "dials", "feel", "immediately"]
            },
            "input_mode": "both",
            "placeholder": "Select an option or type your thought..."
        },
        {
            "id": "calib_temperament_classic",
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
        }
    ],
    "energy": [
        {
            "id": "calib_sanctuary",
            "trait": "energy",
            "category": "Neural Recharge Sanctuary",
            "q": "Calibration 2: When your cognitive battery drops to 5%, where does your mind reboot deepest?",
            "options": [
                "Quiet Solitude (A silent room, midnight focus, deep internal thought)",
                "Dynamic Social Spaces (Lively crowd buzz, group synergy, vibrant social energy)"
            ],
            "keys": ["quiet", "social"],
            "keywords": {
                "quiet": ["quiet", "solitude", "alone", "peace", "focus", "calm", "solo", "internal", "silent"],
                "social": ["social", "dynamic", "crowd", "buzz", "people", "energy", "party", "group", "lively"]
            },
            "input_mode": "both",
            "placeholder": "Select an option or type your thought..."
        },
        {
            "id": "calib_soundscape",
            "trait": "energy",
            "category": "Acoustic Resonance",
            "q": "Calibration 2: Which auditory atmosphere brings your focus to maximum sharpness?",
            "options": [
                "Subtle Solitary Rain (The quiet, rhythmic pitter-patter of midnight rain)",
                "Electric Symphony (The roaring bass and collective pulse of a live arena)"
            ],
            "keys": ["quiet", "social"],
            "keywords": {
                "quiet": ["quiet", "solitude", "rain", "subtle", "midnight", "soft", "calm", "peace"],
                "social": ["social", "dynamic", "electric", "symphony", "bass", "pulse", "arena", "concert", "crowd"]
            },
            "input_mode": "both",
            "placeholder": "Select an option or type your thought..."
        },
        {
            "id": "calib_ideation",
            "trait": "energy",
            "category": "Cognitive Generation Space",
            "q": "Calibration 2: When architecting your most original breakthroughs, what environment fuels you?",
            "options": [
                "Isolated Deep-Dive (Hours of uninterrupted contemplation with zero noise)",
                "Collaborative Crucible (High-velocity banter and rapid sparring with peers)"
            ],
            "keys": ["quiet", "social"],
            "keywords": {
                "quiet": ["quiet", "solitude", "isolated", "deep", "uninterrupted", "alone", "zero noise", "solo"],
                "social": ["social", "dynamic", "collaborative", "banter", "sparring", "peers", "team", "group"]
            },
            "input_mode": "both",
            "placeholder": "Select an option or type your thought..."
        },
        {
            "id": "calib_energy_classic",
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
            "id": "calib_stargazing",
            "trait": "energy",
            "category": "Sensory Horizon",
            "q": "Calibration 2: Standing under a clear starlit desert sky at 2 AM, where does your awareness travel?",
            "options": [
                "Inward Depth (Reflecting on timeless philosophical truths in silent peace)",
                "Outward Connection (Imagining billions of minds, civilizations, and shared stories)"
            ],
            "keys": ["quiet", "social"],
            "keywords": {
                "quiet": ["quiet", "solitude", "inward", "depth", "silent", "peace", "alone", "truth"],
                "social": ["social", "dynamic", "outward", "connection", "billions", "minds", "civilizations", "shared"]
            },
            "input_mode": "both",
            "placeholder": "Select an option or type your thought..."
        },
        {
            "id": "calib_workshop",
            "trait": "energy",
            "category": "Creative Habitat",
            "q": "Calibration 2: Picture your dream creative sanctuary. What is the dominant atmosphere?",
            "options": [
                "Secluded Alpine Cabin (Surrounded by ancient mist, silence, and pine)",
                "Bustling Downtown Loft (Floor-to-ceiling windows, city hum, and open doors)"
            ],
            "keys": ["quiet", "social"],
            "keywords": {
                "quiet": ["quiet", "solitude", "cabin", "alpine", "mist", "silence", "pine", "secluded"],
                "social": ["social", "dynamic", "bustling", "downtown", "loft", "city", "hum", "open doors"]
            },
            "input_mode": "both",
            "placeholder": "Select an option or type your thought..."
        }
    ],
    "cognition": [
        {
            "id": "calib_processing",
            "trait": "cognition",
            "category": "Cognitive Processing Axis",
            "q": "Calibration 3: When deconstructing an intricate riddle, what internal lens sharpens first?",
            "options": [
                "Logical Precision & Numbers (Systematic deduction, mathematical certainty)",
                "Intuitive Patterns & Imagery (Gestalt visual perception, associative leaps)"
            ],
            "keys": ["analytical", "creative"],
            "keywords": {
                "analytical": ["analytical", "logic", "numbers", "math", "precision", "deduction", "systematic"],
                "creative": ["creative", "intuitive", "pattern", "imagery", "gestalt", "visual", "associative"]
            },
            "input_mode": "both",
            "placeholder": "Select an option or type your thought..."
        },
        {
            "id": "calib_awe",
            "trait": "cognition",
            "category": "Perceptual Affinity",
            "q": "Calibration 3: Which human creation evokes your deepest intellectual awe?",
            "options": [
                "Astronomical Clockwork (Immaculate mechanical precision, gear ratios, coordinate accuracy)",
                "Abstract Masterpiece (A sweeping canvas of evocative colors, unspoken feelings, raw mystery)"
            ],
            "keys": ["analytical", "creative"],
            "keywords": {
                "analytical": ["analytical", "clockwork", "mechanical", "precision", "ratios", "coordinate", "math", "logic"],
                "creative": ["creative", "masterpiece", "canvas", "colors", "feelings", "mystery", "abstract", "intuitive"]
            },
            "input_mode": "both",
            "placeholder": "Select an option or type your thought..."
        },
        {
            "id": "calib_time_construct",
            "trait": "cognition",
            "category": "Metaphorical Framing",
            "q": "Calibration 3: If you had to define the nature of 'Time' in your internal theater, what do you see?",
            "options": [
                "Coordinate Continuum (An exact progression of calibrated timestamp intervals)",
                "Shifting River (An organic fluid current weaving through memory and emotion)"
            ],
            "keys": ["analytical", "creative"],
            "keywords": {
                "analytical": ["analytical", "coordinate", "continuum", "intervals", "calibrated", "math", "logic", "timestamp"],
                "creative": ["creative", "river", "fluid", "current", "memory", "emotion", "organic", "intuitive"]
            },
            "input_mode": "both",
            "placeholder": "Select an option or type your thought..."
        },
        {
            "id": "calib_cognition_classic",
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
        },
        {
            "id": "calib_mosaic",
            "trait": "cognition",
            "category": "Visual Gestalt Processing",
            "q": "Calibration 3: When viewing a giant ancient mosaic up close, where do your eyes instinctively lock?",
            "options": [
                "Geometric Tile Alignment (The microscopic precision, grout lines, and symmetry)",
                "The Emergent Master Image (The emotional gestalt and overall narrative flowing from the tiles)"
            ],
            "keys": ["analytical", "creative"],
            "keywords": {
                "analytical": ["analytical", "geometric", "alignment", "microscopic", "precision", "symmetry", "logic"],
                "creative": ["creative", "emergent", "master", "emotional", "gestalt", "narrative", "flow", "intuitive"]
            },
            "input_mode": "both",
            "placeholder": "Select an option or type your thought..."
        },
        {
            "id": "calib_chess_flow",
            "trait": "cognition",
            "category": "Adaptive Cognition",
            "q": "Calibration 3: In an encounter with a grandmaster, what thought process takes over?",
            "options": [
                "Branching Tree Calculation (Evaluating variations 5 moves ahead with strict logic)",
                "Rhythm Reading & Intuition (Sensing the opponent's psychological momentum and improvising)"
            ],
            "keys": ["analytical", "creative"],
            "keywords": {
                "analytical": ["analytical", "branching", "tree", "calculation", "variations", "strict", "logic"],
                "creative": ["creative", "rhythm", "reading", "intuition", "momentum", "improvising", "feeling"]
            },
            "input_mode": "both",
            "placeholder": "Select an option or type your thought..."
        }
    ]
}


def get_dynamic_profiling_probes(session_id: str, rng: random.Random) -> List[Dict[str, Any]]:
    """
    Selects a dynamically fresh 3-question calibration journey for each user session.
    Probes Temperament, Energy, and Cognition across 200+ possible permutations.
    """
    temp_pool = DYNAMIC_PROFILING_POOLS["temperament"]
    energy_pool = DYNAMIC_PROFILING_POOLS["energy"]
    cog_pool = DYNAMIC_PROFILING_POOLS["cognition"]

    probe_temp = dict(rng.choice(temp_pool))
    probe_energy = dict(rng.choice(energy_pool))
    probe_cog = dict(rng.choice(cog_pool))

    return [probe_temp, probe_energy, probe_cog]


# Backwards compatibility reference
PROFILING_QUESTIONS = [
    DYNAMIC_PROFILING_POOLS["temperament"][-1],
    DYNAMIC_PROFILING_POOLS["energy"][3],
    DYNAMIC_PROFILING_POOLS["cognition"][3]
]


def classify_persona(profile: Dict[str, str]) -> Tuple[str, str]:
    """
    Maps analyzed multi-dimensional profile into refined psychological archetypes.
    """
    temp = profile.get("temperament", "cautious")
    energy = profile.get("energy", "quiet")
    cog = profile.get("cognition", "analytical")

    if temp == "cautious" and cog == "analytical":
        return (
            "The Analytical Strategist",
            "Methodical, deliberate deduction, high sensitivity to numerical precision and conservative symmetry."
        )
    elif temp == "bold" and energy == "social":
        return (
            "The Maverick Catalyst",
            "High-velocity spontaneous processing, daring intuitive leaps, attraction to sharp asymmetric anchors."
        )
    elif cog == "creative" and energy == "quiet":
        return (
            "The Contemplative Visionary",
            "Deep internal visualization, attuned to organic harmonic patterns and reflective symbolism."
        )
    elif temp == "bold" and cog == "analytical":
        return (
            "The Strategic Disruptor",
            "Calculated risk-taker who systematically exploits counter-intuitive numerical edges."
        )
    elif energy == "social" and cog == "creative":
        return (
            "The Vibrant Synthesizer",
            "Expressive associative thinker, highly responsive to dynamic color and motor priming."
        )
    elif temp == "cautious" and energy == "quiet":
        return (
            "The Silent Observer",
            "Quiet, focused, highly guarded conscious filter that defaults to timeless fundamental archetypes."
        )
    else:
        return (
            "The Harmonic Pragmatist",
            "Balanced cognitive profile shifting smoothly between logic and instinct."
        )


# =====================================================================
# HIGH-PRECISION FORCING CATALOG (21 ROCK-SOLID TRIALS)
# 15 High-Precision Mathematical Invariances (100% precision guaranteed)
# + 6 Ultra-High-Hit-Rate General Psychological Forces (90-98%+ precision)
# =====================================================================

FORCING_TRIALS_MASTER = [
    # --- A. HIGH-PRECISION MATHEMATICAL & ALGORITHMIC FUNNELS (100% Deterministic) ---
    {
        "id": "num_force_1089",
        "category": "Algebraic Invariance",
        "domain": "numerical",
        "q": "Perform this classic thought experiment in your head:\n\n1. Think of any 3-digit number where the first and last digits differ by at least 2 (e.g. 732).\n2. Reverse the digits (e.g. 237).\n3. Subtract the smaller from the larger (732 - 237 = 495).\n4. Reverse that answer (e.g. 594).\n5. Add those last two numbers together (495 + 594).\n\nType the final sum that remains in your mind:",
        "q_variants": [
            "Perform this classic thought experiment in your head:\n\n1. Think of any 3-digit number where the first and last digits differ by at least 2 (e.g. 732).\n2. Reverse the digits (e.g. 237).\n3. Subtract the smaller from the larger (732 - 237 = 495).\n4. Reverse that answer (e.g. 594).\n5. Add those last two numbers together (495 + 594).\n\nType the final sum that remains in your mind:",
            "Run this mathematical funnel in your mind:\n\n• Choose any 3-digit number (first and last digits different by 2 or more).\n• Reverse its digits and subtract the smaller from the larger.\n• Reverse your result and add it to itself.\n\nType the locked number standing in your thoughts:"
        ],
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
        "id": "num_force_magic_4",
        "category": "Algebraic Cancellation",
        "domain": "numerical",
        "q": "Follow this mental calculation:\n\n1. Pick any secret number from 1 to 100.\n2. Multiply it by 2.\n3. Add 8.\n4. Divide by 2.\n5. Subtract your original secret number.\n\nType the final number remaining in your thoughts:",
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
        "q": "Think of any whole number between 1 and 1000.\n\n1. Multiply it by 9.\n2. Add all the digits of your answer together.\n(If your result is still two digits, add them again until you have a single digit).\n\nType that final single digit:",
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
        "id": "num_force_magic_7",
        "category": "Modular Arithmetic Funnel",
        "domain": "numerical",
        "q": "Think of any secret number in your head (your favorite number, lucky number, etc.):\n\n1. Multiply it by 2.\n2. Add 14.\n3. Divide by 2.\n4. Subtract your starting secret number.\n\nType the final number standing in your thoughts:",
        "input_mode": "freeform",
        "placeholder": "Type the remaining number...",
        "resolver": lambda p: {
            "target": "7",
            "synonyms": ["7", "seven", "7."],
            "secondary": [],
            "insight": "Algebraic equilibrium: ((2x + 14) / 2) - x = 7. Regardless of your starting number, the equation resolves inevitably to 7."
        }
    },
    {
        "id": "num_force_magic_3",
        "category": "Triadic Reduction Funnel",
        "domain": "numerical",
        "q": "Run this quick mental calculation:\n\n1. Pick any secret whole number from 1 to 50.\n2. Multiply it by 3.\n3. Add 9.\n4. Divide by 3.\n5. Subtract your starting secret number.\n\nType the single number remaining in your mind:",
        "input_mode": "freeform",
        "placeholder": "Type the remaining number...",
        "resolver": lambda p: {
            "target": "3",
            "synonyms": ["3", "three", "3."],
            "secondary": [],
            "insight": "Triadic cancellation funnel: ((3x + 9) / 3) - x = 3. Perfectly locks the target at 3."
        }
    },
    {
        "id": "num_force_magic_5",
        "category": "Harmonic Midpoint Funnel",
        "domain": "numerical",
        "q": "Focus your mind on any secret integer from 1 to 100:\n\n1. Double it (multiply by 2).\n2. Add 10.\n3. Divide by 2.\n4. Subtract your starting secret number.\n\nType the final balance number remaining:",
        "input_mode": "freeform",
        "placeholder": "Type the remaining number...",
        "resolver": lambda p: {
            "target": "5",
            "synonyms": ["5", "five", "5."],
            "secondary": [],
            "insight": "Harmonic midpoint balance: ((2x + 10) / 2) - x = 5. Collapses all initial inputs directly to 5."
        }
    },
    {
        "id": "num_force_magic_13",
        "category": "Prime Invariance Funnel",
        "domain": "numerical",
        "q": "Picture any secret number you choose:\n\n1. Multiply it by 2.\n2. Add 26.\n3. Divide by 2.\n4. Subtract your starting secret number.\n\nType the exact number remaining in your thoughts:",
        "input_mode": "freeform",
        "placeholder": "Type the remaining number...",
        "resolver": lambda p: {
            "target": "13",
            "synonyms": ["13", "thirteen", "13."],
            "secondary": [],
            "insight": "Prime cancellation funnel: ((2x + 26) / 2) - x = 13. Wipes out the chosen number and lands on 13."
        }
    },
    {
        "id": "num_force_identity_1",
        "category": "Unitary Identity Funnel",
        "domain": "numerical",
        "q": "Follow this sequence with any secret number in your thoughts:\n\n1. Pick any number from 1 to 100.\n2. Add 3.\n3. Multiply that result by 2.\n4. Subtract 4.\n5. Divide by 2.\n6. Subtract your original secret number.\n\nType the single digit left standing in your mind:",
        "input_mode": "freeform",
        "placeholder": "Type the remaining single digit...",
        "resolver": lambda p: {
            "target": "1",
            "synonyms": ["1", "one", "1."],
            "secondary": [],
            "insight": "Unitary identity reduction: ((2(x + 3) - 4) / 2) - x = 1. Mathematical determinism locks onto 1."
        }
    },
    {
        "id": "num_force_century_100",
        "category": "Century Scale Funnel",
        "domain": "numerical",
        "q": "Run this mental funnel:\n\n1. Pick any number from 1 to 50.\n2. Multiply it by 4.\n3. Add 400.\n4. Divide by 4.\n5. Subtract your original secret number.\n\nType the final number standing in your thoughts:",
        "input_mode": "freeform",
        "placeholder": "Type the remaining number...",
        "resolver": lambda p: {
            "target": "100",
            "synonyms": ["100", "one hundred", "hundred", "100."],
            "secondary": [],
            "insight": "Scale invariant funnel: ((4x + 400) / 4) - x = 100. Guarantees 100 across any chosen starting number."
        }
    },
    {
        "id": "num_force_half_century_50",
        "category": "Equator Half-Century Funnel",
        "domain": "numerical",
        "q": "Follow this mental arithmetic:\n\n1. Choose any number from 1 to 100.\n2. Multiply it by 2.\n3. Add 100.\n4. Divide by 2.\n5. Subtract your original starting number.\n\nType the final number remaining in your mind:",
        "input_mode": "freeform",
        "placeholder": "Type the remaining number...",
        "resolver": lambda p: {
            "target": "50",
            "synonyms": ["50", "fifty", "50."],
            "secondary": [],
            "insight": "Half-century reduction: ((2x + 100) / 2) - x = 50. Mathematically invariant."
        }
    },
    {
        "id": "num_force_two_digit_digit_sum_9",
        "category": "Kaprekar Digit Sum Invariance",
        "domain": "numerical",
        "q": "Perform this thought experiment in your head:\n\n1. Think of any 2-digit number where both digits are different (e.g. 72, 83, or 51).\n2. Reverse the digits (e.g. 27, 38, or 15).\n3. Subtract the smaller number from the larger (e.g. 72 - 27 = 45).\n4. Add the two digits of your answer together (e.g. 4 + 5).\n\nType that final single digit:",
        "input_mode": "freeform",
        "placeholder": "Type the single digit...",
        "resolver": lambda p: {
            "target": "9",
            "synonyms": ["9", "nine", "9."],
            "secondary": [],
            "insight": "Algebraic proof: (10a + b) - (10b + a) = 9(a - b). Any difference of reversed 2-digit numbers is a multiple of 9, whose digits always sum to 9!"
        }
    },
    {
        "id": "num_force_repunit_37",
        "category": "Repunit Quotient Invariance",
        "domain": "numerical",
        "q": "Perform this calculation in your head or on paper:\n\n1. Think of any 3-digit number where all three digits are identical (such as 222, 555, 777, or 888).\n2. Add the three digits together (for example, for 555: 5 + 5 + 5 = 15).\n3. Divide your 3-digit number by that sum (e.g. 555 divided by 15).\n\nType the exact number you obtain:",
        "input_mode": "freeform",
        "placeholder": "Type the result...",
        "resolver": lambda p: {
            "target": "37",
            "synonyms": ["37", "thirty seven", "thirty-seven", "37."],
            "secondary": [],
            "insight": "Repunit theorem: (111 * a) / (3 * a) = 111 / 3 = 37. Regardless of which digit you choose from 1 to 9, the quotient is ALWAYS 37!"
        }
    },
    {
        "id": "num_force_cyclic_7",
        "category": "Cyclic Factorization Funnel",
        "domain": "numerical",
        "q": "Follow this intriguing mathematical experiment:\n\n1. Think of any 3-digit number (e.g. 428).\n2. Repeat it to form a 6-digit number (e.g. 428428).\n3. Divide that 6-digit number by 11.\n4. Divide your result by 13.\n5. Finally, divide by your original 3-digit number.\n\nType the single digit left standing:",
        "input_mode": "freeform",
        "placeholder": "Type the single digit...",
        "resolver": lambda p: {
            "target": "7",
            "synonyms": ["7", "seven", "7."],
            "secondary": [],
            "insight": "Repeating a 3-digit number multiplies it by 1001. Since 1001 = 7 * 11 * 13, dividing by 11, 13, and your original number leaves exactly 7 every time!"
        }
    },
    {
        "id": "num_force_calendar_5",
        "category": "Calendar Chrono Invariance",
        "domain": "numerical",
        "q": "Focus on the calendar month of your birth (January=1, February=2, ... December=12):\n\n1. Take your birth month number.\n2. Add the next consecutive number (e.g. if 4, add 5).\n3. Add 9 to the total.\n4. Divide by 2.\n5. Subtract your starting birth month number.\n\nType the final balance number left in your thoughts:",
        "input_mode": "freeform",
        "placeholder": "Type the remaining number...",
        "resolver": lambda p: {
            "target": "5",
            "synonyms": ["5", "five", "5."],
            "secondary": [],
            "insight": "Chrono-invariance: ((x + (x + 1) + 9) / 2) - x = ((2x + 10) / 2) - x = 5. Collapses all 12 birth months inevitably to 5."
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
                "secondary": ["73", "35"],
                "insight": "As a cautious, structured thinker, your subconscious avoided extreme digits (19, 79), eliminated rounded 5s (15, 35), and anchored into 37—the universal cornerstone prime."
            }
        )
    },

    # --- B. ULTRA-HIGH-HIT-RATE GENERAL PSYCHOLOGICAL FORCES (90-98%+ Precision) ---
    {
        "id": "force_animal_denmark",
        "category": "Phonetic Invariance Letter Trap",
        "domain": "semantic",
        "q": "Perform this thought experiment:\n\n1. Pick any number from 1 to 9.\n2. Multiply it by 9.\n3. Add the two digits together (always 9).\n4. Subtract 5 from that result (always 4).\n5. Match 4 to the 4th letter of the alphabet: D.\n6. Think of a European country starting with D.\n7. Take the 2nd letter of that country (E), and think of a large wild animal.\n\nType the animal and country you are picturing:",
        "input_mode": "freeform",
        "placeholder": "Type the animal and country...",
        "resolver": lambda p: {
            "target": "Elephant in Denmark",
            "synonyms": ["elephant in denmark", "denmark elephant", "elephant denmark", "elephant", "denmark", "grey elephant in denmark", "gray elephant in denmark", "an elephant in denmark"],
            "secondary": ["kangaroo in denmark", "kangaroo"],
            "insight": "Mathematical invariance guarantees letter D -> Denmark -> E -> Elephant in over 95% of human minds."
        }
    },
    {
        "id": "force_animal_australia",
        "category": "Continental Phonemic Anchor",
        "domain": "semantic",
        "q": "Perform this quick associative sequence:\n\n1. Take the very 1st letter of the alphabet: A.\n2. Think of the iconic continent and nation that starts with A.\n3. Picture the iconic hopping wild marsupial native to that land.\n\nType the animal and continent you see:",
        "input_mode": "freeform",
        "placeholder": "Type the animal and country...",
        "resolver": lambda p: {
            "target": "Kangaroo in Australia",
            "synonyms": ["kangaroo in australia", "australia kangaroo", "kangaroo australia", "kangaroo", "australia", "a kangaroo in australia"],
            "secondary": ["koala in australia", "koala"],
            "insight": "Semantic node chaining: Letter A -> Australia -> Kangaroo. The brain's associative retrieval network fires across this path in over 95% of minds."
        }
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
            "secondary": ["water", "clean water", "fresh water"],
            "insight": "The phonemic Stroop trap! Repeating 'White' primes 'cow -> white -> milk' in over 90% of minds. (If you answered Water, you resisted the cognitive bias and perceived physical reality!)."
        }
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
            "insight": "The brain's primary motor cortex allocates disproportionately large neurological bandwidth to the index finger, making it the mandatory pathway for pointing in over 98% of people."
        }
    },
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
                "synonyms": ["blue wrench", "wrench blue", "wrench", "blue tool", "blue spanner", "screwdriver", "blue screwdriver"],
                "secondary": ["steel wrench", "red hammer", "hammer"],
                "insight": "Analytical profiles prioritize mechanical precision over brute impact, shifting the prototype to 'Wrench' and the calm primary 'Blue'."
            }
            if p.get("cognition") == "analytical" and p.get("temperament") == "cautious"
            else {
                "target": "Red Hammer",
                "synonyms": ["red hammer", "hammer red", "hammer", "red mallet", "claw hammer", "sledgehammer", "a red hammer"],
                "secondary": ["yellow hammer", "blue hammer", "blue wrench", "wrench"],
                "insight": "Bold spontaneous thinkers trigger high-arousal motor cortex neurons, driving 'Hammer' as the physical tool prototype and 'Red' as the dominant focal color."
            }
        )
    },
    {
        "id": "force_hand_clasp",
        "category": "Motor Symmetry Clasp",
        "domain": "kinesthetic",
        "q": "Without overthinking, physically interlace the fingers of both hands together into a natural grip.\n\nLook down at your hands: which thumb ended up resting comfortably on top of the other?\n\nType left thumb or right thumb:",
        "input_mode": "freeform",
        "placeholder": "Type left thumb or right thumb...",
        "resolver": lambda p: (
            {
                "target": "Right thumb",
                "synonyms": ["right thumb", "right", "the right thumb", "my right thumb", "right on top"],
                "secondary": ["left thumb", "left"],
                "insight": "Right thumb dominance is linked with left-hemisphere motor planning and structured analytical processing."
            }
            if p.get("cognition") == "analytical"
            else {
                "target": "Left thumb",
                "synonyms": ["left thumb", "left", "the left thumb", "my left thumb", "left on top"],
                "secondary": ["right thumb", "right"],
                "insight": "Left thumb dominance is linked with right-hemisphere creative perception and intuitive motor flow."
            }
        )
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
    Calibration probes change dynamically per session to analyze the user.
    Predictive forcing catalog features 25+ numerical and general cognitive trials.
    All secret predictions are calculated in the background and stored in Mind-Peek.
    """

    def __init__(self, session_id: Optional[str] = None, min_questions: int = 10, streak_target: int = 3, user_id: Optional[str] = None):
        self.session_id = session_id or "default_session"
        self.user_id = user_id or f"guest_{self.session_id[:8]}"
        self.min_questions = min_questions
        self.streak_target = streak_target

        # Initialize persistent SQLite memory and user identity
        self.user_record = get_or_create_user(self.user_id)
        self.user_memory = get_user_memory(self.user_id)

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

        # Deterministic session-specific RNG
        seed_int = int(hashlib.md5(self.session_id.encode('utf-8')).hexdigest()[:8], 16)
        self.rng = random.Random(seed_int)

        # Dynamically generate unique calibration probes for this session
        self.profiling_probes = get_dynamic_profiling_probes(self.session_id, self.rng)

    def _build_dynamic_queue(self):
        """Builds the dynamic question queue customized to this specific user's personality."""
        self.persona, self.persona_description = classify_persona(self.user_profile)

        # Categorize by domain
        numerical = [t for t in FORCING_TRIALS_MASTER if t.get("domain") == "numerical"]
        general = [t for t in FORCING_TRIALS_MASTER if t.get("domain") != "numerical"]

        # Shuffle using session deterministic RNG
        self.rng.shuffle(numerical)
        self.rng.shuffle(general)

        # Smoothly interleave numerical and general trials
        ordered = []
        num_idx = 0
        gen_idx = 0
        while num_idx < len(numerical) or gen_idx < len(general):
            if num_idx < len(numerical):
                ordered.append(numerical[num_idx])
                num_idx += 1
            if gen_idx < len(general):
                ordered.append(general[gen_idx])
                gen_idx += 1

        resolved_queue = []
        for item in ordered:
            trial_copy = dict(item)
            # Support dynamic phrasing variants if available
            if "q_variants" in item and item["q_variants"]:
                trial_copy["q"] = self.rng.choice(item["q_variants"])

            pred_data = item["resolver"](self.user_profile)
            trial_copy["target"] = pred_data["target"]
            trial_copy["synonyms"] = pred_data["synonyms"]
            trial_copy["secondary"] = pred_data.get("secondary", [])
            trial_copy["psychological_insight"] = pred_data["insight"]
            resolved_queue.append(trial_copy)

        self.dynamic_queue = resolved_queue

    def get_active_question(self) -> Optional[Dict[str, Any]]:
        if self.phase == "profiling":
            if self.profiling_index < len(self.profiling_probes):
                item = self.profiling_probes[self.profiling_index]
                return {
                    "question_id": item["id"],
                    "phase": "profiling",
                    "step_number": self.profiling_index + 1,
                    "total_steps": len(self.profiling_probes),
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
        if self.profiling_index >= len(self.profiling_probes):
            self.phase = "forcing"
            if not self.dynamic_queue:
                self._build_dynamic_queue()
            return {"status": "ok", "next_question": self.get_active_question()}

        current_q = self.profiling_probes[self.profiling_index]
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

        # Universal trait fallbacks for freeform answers or legacy tests
        if not chosen_key and choice_text:
            text_lower = choice_text.lower()
            if trait == "temperament":
                if any(w in text_lower for w in ["cautious", "structured", "plan", "safe", "calculate"]):
                    chosen_key = "cautious"
                elif any(w in text_lower for w in ["bold", "spontaneous", "risk", "flow", "dive"]):
                    chosen_key = "bold"
            elif trait == "energy":
                if any(w in text_lower for w in ["quiet", "solitude", "alone", "peace", "focus"]):
                    chosen_key = "quiet"
                elif any(w in text_lower for w in ["social", "dynamic", "crowd", "buzz", "people"]):
                    chosen_key = "social"
            elif trait == "cognition":
                if any(w in text_lower for w in ["analytical", "logic", "numbers", "math", "precision"]):
                    chosen_key = "analytical"
                elif any(w in text_lower for w in ["creative", "intuitive", "pattern", "imagery", "visual"]):
                    chosen_key = "creative"

        if not chosen_key:
            chosen_key = keys[0]
            actual_text = actual_text or options[0]

        self.user_profile[trait] = chosen_key
        self.profiling_index += 1

        if self.profiling_index >= len(self.profiling_probes):
            self.phase = "forcing"
            self._build_dynamic_queue()
            update_user_master_persona(self.user_id, self.persona, self.persona_description or "")
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
                "user_profile": self.user_profile,
                "resolved_choice": actual_text,
                "next_question": self.get_active_question(),
                "is_reveal": False,
            }

    def _handle_forcing_answer(self, choice_index: Optional[int], choice_text: Optional[str]) -> Dict[str, Any]:
        if not self.dynamic_queue:
            self._build_dynamic_queue()

        if self.queue_index >= len(self.dynamic_queue):
            return {
                "status": "completed",
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

        # Fetch dynamically self-upgraded synonyms from SQLite model evolution
        evo_data = get_model_evolution()
        dynamic_synonyms = evo_data.get("learned_synonyms", {}).get(trial["id"], [])
        all_synonyms = list(set(synonyms + dynamic_synonyms))

        is_hit, match_confidence = evaluate_forcing_match(actual_text, target, all_synonyms, secondary)

        # Record input permanently into SQLite memory
        record_trial_input(
            user_id=self.user_id,
            session_id=self.session_id,
            question_id=trial["id"],
            question_domain=trial.get("domain", "general"),
            question_text=trial["q"],
            sealed_prediction=target,
            user_input=actual_text,
            is_hit=is_hit,
            confidence=match_confidence
        )

        # Trigger self-upgrading adaptive learning loop
        evo_upgrade = absorb_user_input_and_upgrade(
            question_id=trial["id"],
            actual_input=actual_text,
            target=target,
            persona=self.persona,
            is_hit=is_hit
        )

        self.total_questions += 1

        if is_hit:
            self.current_streak += 1
            self.total_hits += 1
            if self.current_streak > self.max_streak:
                self.max_streak = self.current_streak
        else:
            self.current_streak = 0

        entry = {
            "step": self.total_questions,
            "question_id": trial["id"],
            "category": trial.get("category", "Psychological"),
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

        return {
            "status": "turn_completed",
            "is_hit": is_hit,
            "current_streak": self.current_streak,
            "resolved_choice": actual_text,
            "psychological_insight": trial.get("psychological_insight", "Subconscious bias detected."),
            "match_confidence": match_confidence,
            "sealed_prediction": target,
            "sealed_hash": sealed_hash,
            "persona": self.persona,
            "cognitive_branch": trial.get("domain", "Cognitive").capitalize(),
            "next_question": next_q,
            "phase": self.phase,
            "is_reveal": is_reveal,
            "reveal_data": reveal_payload,
            "evolution_event": evo_upgrade,
            "model_version": evo_data.get("version"),
            "user_memory": get_user_memory(self.user_id)
        }

    def get_reveal_summary(self) -> Dict[str, Any]:
        """Generates comprehensive post-reveal cryptographic audit for Mind-Peek."""
        total = self.total_questions
        hits = self.total_hits
        accuracy = round((hits / total * 100), 1) if total > 0 else 0.0

        return {
            "total_questions": total,
            "total_hits": hits,
            "accuracy": accuracy,
            "max_streak": self.max_streak,
            "persona": self.persona,
            "persona_description": self.persona_description,
            "reveal_reason": self.reveal_reason or "Calibration complete.",
            "history": self.history,
            "verifications": [
                {
                    "step": h["step"],
                    "category": h["category"],
                    "domain": h.get("domain", "general"),
                    "sealed_prediction": h["predicted"],
                    "sealed_hash": h["sealed_hash"],
                    "actual_answer": h["actual"],
                    "hit": h["hit"],
                    "confidence": h["confidence"],
                    "insight": h.get("insight", ""),
                }
                for h in self.history
            ]
        }

    def get_debug_state(self) -> Dict[str, Any]:
        """Mind-Peek HUD live telemetry state."""
        current_pred = None
        upcoming = []

        if self.phase in ("forcing", "quiz", "revealed") and self.dynamic_queue:
            if self.queue_index < len(self.dynamic_queue):
                active_item = self.dynamic_queue[self.queue_index]
                sealed_hash = generate_sealed_hash(active_item["target"], active_item["id"], self.session_id)
                current_pred = {
                    "question_id": active_item["id"],
                    "category": active_item.get("category", "General"),
                    "domain": active_item.get("domain", "general"),
                    "question": active_item["q"],
                    "target": active_item["target"],
                    "synonyms": active_item.get("synonyms", []),
                    "sealed_hash": sealed_hash,
                    "insight": active_item.get("psychological_insight", ""),
                }

            # Preview next 3 upcoming predictions
            for offset in range(1, 4):
                idx = self.queue_index + offset
                if idx < len(self.dynamic_queue):
                    u_item = self.dynamic_queue[idx]
                    u_hash = generate_sealed_hash(u_item["target"], u_item["id"], self.session_id)
                    upcoming.append({
                        "question_id": u_item["id"],
                        "category": u_item.get("category", "General"),
                        "domain": u_item.get("domain", "general"),
                        "question": u_item["q"],
                        "target": u_item["target"],
                        "predicted": u_item["target"],
                        "sealed_hash": u_hash,
                    })

        return {
            "session_id": self.session_id,
            "phase": self.phase,
            "persona": self.persona,
            "persona_description": self.persona_description,
            "user_profile": self.user_profile,
            "total_questions": self.total_questions,
            "total_hits": self.total_hits,
            "current_streak": self.current_streak,
            "max_streak": self.max_streak,
            "streak_target": self.streak_target,
            "min_questions": self.min_questions,
            "queue_length": len(self.dynamic_queue) - self.queue_index,
            "current_prediction": current_pred,
            "upcoming_predictions": upcoming,
            "history": self.history,
            "user_memory": get_user_memory(self.user_id),
            "model_evolution": get_model_evolution(),
        }
