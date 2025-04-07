import json


class MusicConfig:
    """
    It serves as a schema for later composition.
    Some parameters are directly assigned by the user,  the rest will be inferred by AI model.
    """

    # Default settings
    # Global schema
    DEFAULT_STYLE: str = "Classical"
    DEFAULT_MOOD: str = "Neutral"
    DEFAULT_KEY: str = "C major"
    DEFAULT_TEMPO: int = 100
    DEFAULT_SECTIONS: int = 3
    DEFAULT_DURATION_SECONDS:int = 120
    DEFAULT_DURATION_BEATS: int = 200
    DEFAULT_TIME_SIGNATURE: tuple[int, int] = (4, 4)
    DEFAULT_INSTRUMENTS: list[str] = ["Acoustic Grand Piano"]
    # Error messages
    ERROR_DEFAULT: str = "Using default parameters: {reason}"
    ERROR_INVALID_JSON: str = "Invalid JSON response from AI model"
    ERROR_MIDI_GENERATION: str = "MIDI generation failed: {error}"

    # Add instrument mapping
    PIANO_MAP: dict[str, int] = {
        'Acoustic Grand Piano': 1,
        'Bright Acoustic Piano': 2,
        'Electric Grand Piano': 3,
        'Honky-tonk Piano': 4,
        'Electric Piano 1 (usually a Rhodes or Wurlitzer piano)': 5,
        'Electric Piano 2 (usually an FM piano patch, often chorused)': 6,
        'Harpsichord': 7,
        'Clavinet': 8
    }

    CHROMATIC_PERC_MAP: dict[str, int] = {
        'Celesta': 9,
        'Glockenspiel': 10,
        'Music Box': 11,
        'Vibraphone': 12,
        'Marimba': 13,
        'Xylophone': 14,
        'Tubular Bells': 15,
        'Dulcimer': 16
    }

    ORGAN_MAP: dict[str, int] = {
        'Drawbar Organ': 17,
        'Percussive Organ': 18,
        'Rock Organ': 19,
        'Church Organ': 20,
        'Reed Organ': 21,
        'Accordion': 22,
        'Harmonica': 23,
        'Tango Accordion': 24,
        'Bandoneon': 24
    }

    GUITAR_MAP: dict[str, int] = {
        'Acoustic Guitar (nylon)': 25,
        'Acoustic Guitar (steel)': 26,
        'Electric Guitar (jazz)': 27,
        'Electric Guitar (clean, chorused)': 28,
        'Electric Guitar (muted)': 29,
        'Electric Guitar (overdrive)': 30,
        'Electric Guitar (distortion)': 31,
        'Electric Guitar (harmonics)': 32
    }

    BASS_MAP: dict[str, int] = {
        'Acoustic Bass': 33,
        'Electric Bass (finger)': 34,
        'Electric Bass (picked)': 35,
        'Electric Bass (fretless)': 36,
        'Slap Bass 1': 37,
        'Slap Bass 2': 38,
        'Synth Bass 1': 39,
        'Synth Bass 2': 40
    }

    STRING_MAP: dict[str, int] = {
        'Violin': 41,
        'Viola': 42,
        'Cello': 43,
        'Contrabass': 44,
        'Tremolo Strings': 45,
        'Pizzicato Strings': 46,
        'Orchestral Harp': 47,
        'Timpani': 48
    }

    BRASS_MAP: dict[str, int] = {
        "Trumpet": 57,
        "Trombone": 58,
        "Tuba": 59,
        "Muted Trumpet": 60,
        "French Horn": 61,
        "Brass Section": 62,
        "Synth Brass 1": 63,
        "Synth Brass 2": 64,
    }

    REED_MAP: dict[str, int] = {
        'Soprano Sax': 65,
        'Alto Sax': 66,
        'Tenor Sax': 67,
        'Baritone Sax': 68,
        'Oboe': 69,
        'English Horne': 70,
        'Bassoon': 71,
        'Clarinet': 72
    }

    PIPE_MAP: dict[str, int] = {
        'Piccolo': 73,
        'Flute': 74,
        'Recorder': 75,
        'Pan Flute': 76,
        'Blown bottle': 77,
        'Shakuhachi': 78,
        'Whistle': 79,
        'Ocarina': 80
    }

    PERCUSSIVE_MAP: dict[str, int] = {
        'Tinkle Bell': 113,
        'Cowbell': 114,
        'Steel Drum': 115,
        'WoodBlock': 116,
        'Taiko Drum': 117,
        'Melodic Drum': 118,
        'Synth Drum': 119,
        'Reverse Cymbal': 120,
    }

    INSTRUMENT_MAP: dict[str, dict[str, int]] = {
        'Piano': PIANO_MAP,
        'Chromatic': CHROMATIC_PERC_MAP,
        'Organ': ORGAN_MAP,
        'Guitar': GUITAR_MAP,
        'Bass': BASS_MAP,
        'String': STRING_MAP,
        'Brass': BRASS_MAP,
        'Reed': REED_MAP,
        'Pipe': PIPE_MAP,
        'Percussive': PERCUSSIVE_MAP
    }

    KEYS: list[str] = {
        "C major", "A minor",
        "G major", "E minor", "D major", "B minor", "A major", "F# minor", "E major", "C# minor",
        "B major", "G# minor", "F# major", "D# minor", "C# major", "A# minor",
        "F major", "D minor", "Bb major", "G minor", "Eb major", "C minor", "Ab major", "F minor",
        "Db major", "Bb minor", "Gb major", "Eb minor", "Cb major", "Ab minor"
    }

# Musical parameters
# Optimized Global Music Analysis Prompt
    MUSIC_ANALYSIS_PROMPT = """Analyze the given prompt and extract the following information as a JSON string (no extra formatting):
    There should be at least 3 sections, 4 instruments, if less, add more sections and instruments by your inference on the style, mood and key.
    {
    "style": "<string>",
    "mood": "<string>",
    "primary_key": "<string>",  // Allowed keys: "C major", "A minor", "G major", "E minor", "D major", "B minor", "A major", "F# minor", "E major", "C# minor", "B major", "G# minor", "F# major", "D# minor", "C# major", "A# minor", "F major", "D minor", "B♭ major", "G minor", "E♭ major", "C minor", "A♭ major", "F minor", "D♭ major", "B♭ minor", "G♭ major", "E♭ minor", "C♭ major", "A♭ minor"
    "tempo": <int>,           // Range: 60 - 180
    "sections": <int>,
    "duration_beats": <int>,    // Should equal duration_minutes * tempo; if inconsistent, use the user's input.
    "duration_minutes": <float>,
    "time_signature": [<int>, <int>],
    "instruments": ["<instrument_name>", ...]  // Each instrument must be one of the predefined instruments.
    }

    Predefined instruments with their MIDI program numbers:

    Piano: {"Acoustic Grand Piano": 1, "Bright Acoustic Piano": 2, "Electric Grand Piano": 3, "Honky-tonk Piano": 4, "Electric Piano 1": 5, "Electric Piano 2": 6, "Harpsichord": 7, "Clavinet": 8}

    Chromatic Percussion: {"Celesta": 9, "Glockenspiel": 10, "Music Box": 11, "Vibraphone": 12, "Marimba": 13, "Xylophone": 14, "Tubular Bells": 15, "Dulcimer": 16}

    Organ: {"Drawbar Organ": 17, "Percussive Organ": 18, "Rock Organ": 19, "Church Organ": 20, "Reed Organ": 21, "Accordion": 22, "Harmonica": 23, "Tango Accordion": 24, "Bandoneon": 24}

    Guitar: {"Acoustic Guitar (nylon)": 25, "Acoustic Guitar (steel)": 26, "Electric Guitar (jazz)": 27, "Electric Guitar (clean, chorused)": 28, "Electric Guitar (muted)": 29, "Electric Guitar (overdrive)": 30, "Electric Guitar (distortion)": 31, "Electric Guitar (harmonics)": 32}

    Bass: {"Acoustic Bass": 33, "Electric Bass (finger)": 34, "Electric Bass (picked)": 35, "Electric Bass (fretless)": 36, "Slap Bass 1": 37, "Slap Bass 2": 38, "Synth Bass 1": 39, "Synth Bass 2": 40}

    String: {"Violin": 41, "Viola": 42, "Cello": 43, "Contrabass": 44, "Tremolo Strings": 45, "Pizzicato Strings": 46, "Orchestral Harp": 47, "Timpani": 48}

    Brass: {"Trumpet": 57, "Trombone": 58, "Tuba": 59, "Muted Trumpet": 60, "French Horn": 61, "Brass Section": 62, "Synth Brass 1": 63, "Synth Brass 2": 64}

    Reed: {"Soprano Sax": 65, "Alto Sax": 66, "Tenor Sax": 67, "Baritone Sax": 68, "Oboe": 69, "English Horn": 70, "Bassoon": 71, "Clarinet": 72}

    Pipe: {"Piccolo": 73, "Flute": 74, "Recorder": 75, "Pan Flute": 76, "Blown bottle": 77, "Shakuhachi": 78, "Whistle": 79, "Ocarina": 80}

    Percussive: {"Tinkle Bell": 113, "Cowbell": 114, "Steel Drum": 115, "WoodBlock": 116, "Taiko Drum": 117, "Melodic Drum": 118, "Synth Drum": 119, "Reverse Cymbal": 120}

    IMPORTANT: Return the response as a simple JSON string with no additional formatting.
    """

    # Section parameters
    SECTION_JSON: str = """
    { "sections": 
    [{
        "sectionName": "Intro",
        "startBeat": 0,
        "endBeat": 30,
        "chordProgression": ["C", "C/E", "F", "G"],
        "dynamicMarkers": "mf",
        },
        {
        "sectionName": "Verse",
        "startBeat": 30,
        "endBeat": 90,
        "chordProgression": ["C", "G", "Am", "F"],
        "dynamicMarkers": "mf",
        }]
    }
    """
