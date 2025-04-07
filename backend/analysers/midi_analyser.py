from .analyser import Analyser
import pretty_midi
import io

class MidiAnalyser(Analyser):
    """
    Analyzes MIDI files and provides a textual summary, including: -
    - Tempo (BPM)
    - Time in signature
    - Estimated key
    - Number of notes
    - Instruments used
    - Suggested music style
    """

    def __init__(self, midi_file_data):
        """
        Initializes the MIDI analyser with the given file path
        :param midi_file: Path to the MIDI file to be analyzed
        """

        super().__init__()              # calls the parent class constructor
        self.midi_file_data = midi_file_data      # stores the MIDI file path

    def analyse(self) -> str:
        """
        Analyses the provided MIDI file and returns a summary as a string
        :return: A formatted string with analsis results
        """

        try:
            # load the MIDI file
            midi_data = pretty_midi.PrettyMIDI(io.BytesIO(self.midi_file_data))

            # estimate the tempo (BPM)
            tempo = midi_data.estimate_tempo()

            # extract time signature (if available)
            time_signature = midi_data.time_signature_changes
            time_signature = f"{time_signature[0].numerator}/{time_signature[0].denominator}" if time_signature else "Unknown"

            # estimate the musical key (basic approximation using chroma features)
            chroma = midi_data.get_chroma()
            estimated_key = chroma.argmax(axis = 0).mean()          # rough key estimation

            # count the total number of notes (excluding drums)
            note_count = sum(len(instr.notes) for instr in midi_data.instruments if not instr.is_drum)

            # extract instrument names (convert program numbers to human-readable names)
            instrument_names = set(pretty_midi.program_to_instrument_name(instr.program)
                                   for instr in midi_data.instruments if not instr.is_drum)
            
            # determine the music style based on tempo
            if tempo < 80:
                music_style = "Ambient"
            elif 80 <= tempo < 120:
                music_style = "Jazz"
            elif 120 <= tempo < 160:
                music_style = "Pop"
            else:
                music_style = "Electronic"

            # format the instrument list
            instrument_text = ", ".join(instrument_names) if instrument_names else "Unknown Instruments"

            # final output
            return (f"MIDI analysis suggests: {music_style}. The file has a tempo of {tempo:.2f} BPM, "
                    f"a {time_signature} time signature, and an estimated key of {estimated_key:.0f}."
                    f"It contains {note_count} notes played by {instrument_text}.")
        
        except Exception as e:
            # Handle errors gracefully and return a message
            return f"Error processing MIDI file: {str(e)}"

def main():
    print("MIDI Analyzer")
main()