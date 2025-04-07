import json
import logging
from io import BytesIO
from midiutil import MIDIFile
from config import MusicConfig
from pydantic import BaseModel
import random
from RAG_integrator import create_similarity_searcher
import os

logger = logging.getLogger(__name__)


class section(BaseModel):
    startBeat: int
    endBeat: int
    chordProgression: list[str]
    dynamicMarkers: list[int]
    sectionName: str


class sections(BaseModel):
    sections: list[section]


class MidiGenerator:
    """
    A class for generating MIDI files based on global musical parameters and GPT-scheduled sections.
    """

    def __init__(self, params, gpt_client, music_config=MusicConfig):
        """
        Initialize the MidiGenerator with global musical parameters.

        :param params: Dictionary containing global parameters:
            - style (str)
            - mood (str)
            - primary_key (str) e.g., "C major"
            - tempo (int) [60, 180]
            - sections (int)
            - duration_beats (int)
            - duration_minutes (float)
            - time_signature (tuple/list of two ints)
            - instruments (list of instrument names as strings)
        :param gpt_client: An instance for making GPT API calls.
        :param music_config: A configuration object containing attributes such as SECTION_JSON and INSTRUMENT_MAP.
        """
        self.params = params
        self.gpt_client = gpt_client
        self.music_config = music_config

        # extract global musical parameters
        self.tempo = params.get("tempo", 120)
        self.key_signature = params.get("primary_key", "C major")
        self.time_signature = params.get("time_signature", (4, 4))
        self.style = params.get("style", "default")
        self.mood = params.get("mood", "neutral")
        self.duration_beats = params.get("duration_beats", self.tempo * params.get("duration_minutes", 1))
        self.duration_minutes = params.get("duration_minutes", 1.0)
        self.sections_count = params.get("sections", 1)

        # Resolve instrument names to dictionaries with MIDI program numbers using music_config.INSTRUMENT_MAP.
        self.instruments = self.resolve_instruments(params.get("instruments", []))

        # List of sections (to be generated via GPT scheduling)
        self.sections: sections = sections(sections=[])

        # The MIDIFile object that will be generated
        self.midi = None

    def resolve_instruments(self, instrument_names):
        """
        Convert a list of instrument names into a list of dictionaries containing the instrument name and its MIDI program number.
        Searches through music_config.INSTRUMENT_MAP. If not found, defaults to Acoustic Grand Piano (program 1).

        :param instrument_names: List of instrument names as strings.
        :return: List of dictionaries, e.g., [{"name": "Acoustic Grand Piano", "program": 1}, ...]
        """
        resolved = []
        for name in instrument_names:
            program = None
            # Iterate over each instrument category in the INSTRUMENT_MAP
            for category, mapping in self.music_config.INSTRUMENT_MAP.items():
                if name in mapping.keys():
                    program = mapping[name]
                    resolved.append({"name": name, "program": program})
                    break
            if program is None:
                logger.warning(f"Instrument '{name}' not found in INSTRUMENT_MAP. Defaulting to Acoustic Grand Piano.")
                resolved.append({"name": "Acoustic Grand Piano", "program": 1})  # Default to Acoustic Grand Piano
        logger.debug(f"\nResolved instruments: {resolved}\n")
        return resolved

    def schedule_sections(self):
        """
        Schedule sections using GPT response.
        Adds error handling and debugging for JSON parsing issues.
        """

        try:
            # Get the base directory of the script dynamically
            base_path = os.path.dirname(os.path.abspath(__file__))

            # Use simplified search functionality, catch potential errors
            similarity_results = "No similarity search available - using fallback"
            try:
                # Create the searcher instance
                searcher = create_similarity_searcher(base_path)

                # Set query parameters
                searcher.style = self.style
                searcher.mood = self.mood
                searcher.primary_key = self.key_signature
                searcher.tempo = self.tempo
                searcher.sections = self.sections
                searcher.duration_beats = self.duration_beats
                searcher.duration_minutes = self.duration_minutes
                searcher.time_signature = self.time_signature
                searcher.instruments = ["Electric Guitar", "Drums"]

                # Perform similarity search
                similarity_results = searcher.perform_similarity_search(k=5)
            except Exception as e:
                logger.warning(f"Similarity search failed: {e}. Using default results.")

            completion = self.gpt_client.beta.chat.completions.parse(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system",
                     "content": "You are an expert composer that schedules sections for a MIDI file."},
                    {"role": "user", "content": f"""
                     Here are some similar compositions based on the parameters:
                      {similarity_results} 
                      Now please schedule sections for a composition with these parameters: {str(self.params)}"""}

                ],
                temperature=1.0,
                response_format=sections,
            )

            self.sections = completion.choices[0].message.parsed

            # Validate and fix section timings
            if hasattr(self.sections, 'sections'):
                current_beat = 0
                for section in self.sections.sections:
                    # Ensure sections are continuous
                    section.startBeat = current_beat
                    # Make sure each section has a minimum duration
                    section_duration = max(4, section.endBeat - section.startBeat)
                    section.endBeat = current_beat + section_duration
                    current_beat = section.endBeat

                    # Ensure there are enough chords for the section duration
                    min_chords_needed = max(2, int(section_duration / 4))  # At least one chord every 4 beats
                    if len(section.chordProgression) < min_chords_needed:
                        # Repeat the chord progression to fill the section
                        original_progression = section.chordProgression.copy()
                        while len(section.chordProgression) < min_chords_needed:
                            section.chordProgression.extend(original_progression)

                logger.debug(f"Sections scheduled: {len(self.sections.sections)} sections")
                logger.debug(f"Total duration: {current_beat} beats")

            return self.sections

        except Exception as e:
            logger.error(f"Error scheduling sections: {str(e)}")
            # Create simple default sections as fallback
            fallback_sections = []
            # Create 4 simple sections
            total_beats = self.duration_beats or 64  # Default 64 beats
            beats_per_section = total_beats / 4
            
            chords = ["C", "Am", "F", "G"]  # Simple chord progression
            
            for i in range(4):
                start_beat = int(i * beats_per_section)
                end_beat = int((i + 1) * beats_per_section)
                # Copy chords based on section length
                chord_count = max(2, int(beats_per_section / 4))
                chord_progression = []
                for _ in range(chord_count):
                    chord_progression.append(chords[i % len(chords)])
                
                fallback_sections.append(
                    section(
                        startBeat=start_beat,
                        endBeat=end_beat,
                        chordProgression=chord_progression,
                        dynamicMarkers=[64, 64],  # Medium volume
                        sectionName=f"Section {i+1}"
                    )
                )
            
            self.sections = sections(sections=fallback_sections)
            return self.sections

    @staticmethod
    def chord_to_notes(chord, base_octave=4):
        """
        Convert a chord string into a list of MIDI note numbers.
        Supports major, minor, 7th, major 7th, minor 7th chords.
        Example: "Cmaj7" returns [60, 64, 67, 71] assuming C4 is 60.

        :param chord: Chord string (e.g., "Cmaj7", "Am7", "G7").
        :param base_octave: Base octave for the chord (default is 4).
        :return: List of MIDI note numbers.
        """
        note_map = {
            'C': 0, 'C#': 1, 'Db': 1,
            'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4,
            'F': 5, 'F#': 6, 'Gb': 6,
            'G': 7, 'G#': 8, 'Ab': 8,
            'A': 9, 'A#': 10, 'Bb': 10,
            'B': 11
        }

        # Define intervals for common chord types
        chord_intervals = {
            'maj': [0, 4, 7],  # Major triad
            'min': [0, 3, 7],  # Minor triad
            'm': [0, 3, 7],  # Minor triad (shorthand)
            '7': [0, 4, 7, 10],  # Dominant seventh
            'maj7': [0, 4, 7, 11],  # Major seventh
            'm7': [0, 3, 7, 10],  # Minor seventh
            'min7': [0, 3, 7, 10],  # Minor seventh
            'dim': [0, 3, 6],  # Diminished triad
            'aug': [0, 4, 8],  # Augmented triad
            'sus4': [0, 5, 7],  # Suspended fourth
            '6': [0, 4, 7, 9],  # Major sixth
            'm6': [0, 3, 7, 9]  # Minor sixth
        }

        # Parse the chord
        chord = chord.strip()

        # Handle root note with accidentals
        if len(chord) >= 2 and chord[1] in ['#', 'b']:
            root = chord[:2]
            quality = chord[2:] if len(chord) > 2 else 'maj'
        else:
            root = chord[0]
            quality = chord[1:] if len(chord) > 1 else 'maj'

        # Get MIDI pitch for root note
        root_offset = note_map.get(root, 0)
        midi_root = 12 * (base_octave + 1) + root_offset

        # Get intervals for the chord quality
        intervals = chord_intervals.get(quality, chord_intervals['maj'])

        # Generate all notes for the chord
        notes = [midi_root + interval for interval in intervals]
        return notes

    def generate_midi_file(self):
        """
        Generate a MIDI file using the scheduled sections and global parameters.
        """
        num_tracks = len(self.instruments)
        midi = MIDIFile(numTracks=num_tracks, adjust_origin=True)

        # Set basic parameters for each instrument track
        for i, inst in enumerate(self.instruments):
            track_name = inst.get("name", f"Track {i}")
            program = inst.get("program", 1)
            midi.addTrackName(track=i, time=0, trackName=track_name)
            midi.addTempo(track=i, time=0, tempo=self.tempo)
            midi.addProgramChange(tracknum=i, channel=i, time=0, program=program)

        logger.debug(f"CHECKPOINT 1: Instrument tracks added to the MIDI file")

        sections_data = self.sections.sections if hasattr(self.sections, 'sections') else self.sections

        # Ensure we have valid sections
        if not sections_data:
            logger.error("No sections data available")
            return

        # Calculate total duration for validation
        total_duration = sum(section.endBeat - section.startBeat for section in sections_data)
        logger.debug(f"Total music duration: {total_duration} beats")

        # Process each section
        for idx, section in enumerate(sections_data):
            start_beat = section.startBeat
            end_beat = section.endBeat
            chord_progression = section.chordProgression
            dynamic = section.dynamicMarkers[0] if section.dynamicMarkers else 100

            section_duration = end_beat - start_beat
            # Ensure we have at least one beat per chord
            chord_duration = min(section_duration / max(len(chord_progression), 1), 4.0)

            logger.debug(f"Processing section {idx}: {start_beat}-{end_beat} ({section_duration} beats)")
            logger.debug(f"Chord progression: {chord_progression}")

            # Process each chord in the progression
            for chord_idx, chord in enumerate(chord_progression):
                chord_start = start_beat + (chord_idx * chord_duration)
                # Ensure we don't exceed section boundaries
                if chord_start >= end_beat:
                    break

                chord_notes = self.chord_to_notes(chord)

                # Add notes for each instrument with different rhythmic patterns
                for track, instrument in enumerate(self.instruments):
                    instrument_name = instrument.get("name", "").lower()

                    if "bass" in instrument_name:
                        # Bass pattern with rhythmic variation
                        bass_patterns = [
                            [(0, 1.0), (0.5, 0.5), (1.5, 1.0), (3, 0.5)],  # Pattern 1
                            [(0, 1.5), (2, 1.0), (3.5, 0.5)],  # Pattern 2
                            [(0, 2.0), (2.5, 1.0), (3.5, 0.5)]  # Pattern 3
                        ]
                        pattern = bass_patterns[chord_idx % len(bass_patterns)]

                        for offset, duration in pattern:
                            velocity = dynamic - random.randint(0, 10)  # Slight velocity variation
                            midi.addNote(
                                track=track,
                                channel=track,
                                pitch=chord_notes[0] - 12,  # Root note one octave down
                                time=chord_start + offset,
                                duration=duration,
                                volume=velocity
                            )

                    elif "piano" in instrument_name:
                        # Piano pattern with chord voicing variations
                        piano_patterns = [
                            [(0, 1.0), (1.0, 0.5), (2.0, 1.0), (3.0, 0.5)],  # Pattern 1
                            [(0, 2.0), (2.5, 1.0), (3.5, 0.5)],  # Pattern 2
                            [(0.5, 0.5), (1.5, 0.5), (2.5, 0.5), (3.5, 0.5)]  # Pattern 3
                        ]
                        pattern = piano_patterns[chord_idx % len(piano_patterns)]

                        for offset, duration in pattern:
                            velocity = dynamic - random.randint(0, 15)  # More velocity variation for piano
                            # Add slight timing variation
                            time_variation = random.uniform(-0.02, 0.02)
                            for note in chord_notes:
                                midi.addNote(
                                    track=track,
                                    channel=track,
                                    pitch=note,
                                    time=chord_start + offset + time_variation,
                                    duration=duration,
                                    volume=velocity
                                )

                    else:
                        # Other instruments get simpler patterns with some variation
                        base_pattern = [(0, 1.0), (1.0, 1.0), (2.0, 1.0), (3.0, 1.0)]

                        for offset, duration in base_pattern:
                            if random.random() > 0.2:  # 80% chance to play each note
                                velocity = dynamic - random.randint(0, 20)
                                time_variation = random.uniform(-0.05, 0.05)
                                for note in chord_notes:
                                    midi.addNote(
                                        track=track,
                                        channel=track,
                                        pitch=note,
                                        time=chord_start + offset + time_variation,
                                        duration=duration * random.uniform(0.8, 1.0),
                                        volume=velocity
                                    )

        self.midi = midi

        # Add a final check
        if self.midi is None:
            logger.error("Failed to generate MIDI file")
            return

        logger.info(f"Successfully generated MIDI file with {len(sections_data)} sections")

    def get_midi_bytes(self):
        """
        Write the generated MIDIFile object to a BytesIO stream and return the byte data.

        :return: Byte string of the MIDI file.
        """
        output = BytesIO()
        self.midi.writeFile(output)
        output.seek(0)
        return output.read()

    def debug_midi_info(self):
        """
        Print debug information about the generated MIDI file.
        Should be called after generate_midi_file().
        """
        if not hasattr(self, 'midi'):
            logger.warning("No MIDI file has been generated yet!")
            return

        # Basic MIDI info
        logger.info("=== MIDI File Information ===")
        logger.info(f"Configuration:")
        logger.info(f"- Number of tracks: {len(self.instruments)}")
        logger.info(f"- Tempo: {self.tempo} BPM")
        logger.info(f"- Time signature: {self.time_signature}")
        logger.info(f"- Key signature: {self.key_signature}")

        # Track details
        logger.info("\nTrack Details:")
        for i, inst in enumerate(self.instruments):
            logger.info(f"Track {i}:")
            logger.info(f"- Name: {inst.get('name', f'Track {i}')}")
            logger.info(f"- Program: {inst.get('program', 1)}")

        # Section analysis
        logger.info("\nSection Analysis:")
        total_beats = 0
        for i, section in enumerate(self.sections.sections):
            start_beat = section.startBeat
            end_beat = section.endBeat
            duration = end_beat - start_beat
            total_beats = max(total_beats, end_beat)

            logger.info(f"Section {i}:")
            logger.info(f"- Time: {start_beat}-{end_beat} (duration: {duration} beats)")
            logger.info(f"- Chords: {section.chordProgression}")
            logger.info(f"- Dynamic: {section.dynamicMarkers[0] if section.dynamicMarkers else 100}")

        # Overall statistics
        minutes = (total_beats * 60) / self.tempo
        logger.info("\nOverall Statistics:")
        logger.info(f"- Total duration: {total_beats} beats ({minutes:.2f} minutes)")
        logger.info(f"- Number of sections: {len(self.sections.sections)}")
        logger.info("===========================")

    def generate(self):
        """
        Main method to generate the MIDI file.
        Added more error handling and validation.

        :return: Byte string of the generated MIDI file or None if there's an error.
        """
        logger.info("Starting MIDI generation process...")

        # Schedule sections with validation
        sections = self.schedule_sections()
        if not sections:
            logger.error("Failed to schedule sections - invalid or empty response")
            return None

        if not self.sections:
            logger.error("No sections were scheduled!")
            return None

        try:
            self.generate_midi_file()
            self.debug_midi_info()

            midi_bytes = self.get_midi_bytes()
            if not midi_bytes:
                logger.error("Failed to generate MIDI bytes")
                return None

            logger.info(f"MIDI generation complete. Generated {len(midi_bytes)} bytes")
            return midi_bytes

        except Exception as e:
            logger.error(f"Error during MIDI generation: {str(e)}")
            return None
