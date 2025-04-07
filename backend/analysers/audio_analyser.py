from .analyser import Analyser

import librosa
import numpy as np

import soundfile as sf
import io

class AudioAnalyser(Analyser):
    def __init__(self):
        pass

    def analyse(self, audio_file_data ) -> str:
        """_summary_

        Args:
            file_path (str): the path to the mp3 file that the user imputted

        Returns:
            str: prompt for AI
        """


        with io.BytesIO(audio_file_data) as buffer:
            y, sr = sf.read(buffer)

        if y.ndim > 1:
            y = np.mean(y, axis=1)

            # Optional: limit duration to avoid memory issues (10 seconds max)
        max_duration_seconds = 10
        max_samples = sr * max_duration_seconds
        if len(y) > max_samples:
            y = y[:max_samples]

        # Use lower memory STFT settings
        n_fft = 1024
        hop_length = 512

        # Safe call to piptrack
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr, n_fft=n_fft, hop_length=hop_length)



        # Use optimized piptrack settings

        frequencies = []
        for i in range(pitches.shape[1]):
            index = np.argmax(magnitudes[:, i])
            freq = pitches[index, i]
            if freq > 0:
                frequencies.append(freq)

        N = 30#note density
        averaged_frequencies = [
            np.mean(frequencies[i : i + N]) for i in range(0, len(frequencies), N)
        ]

        averaged_frequencies = [f for f in averaged_frequencies if not np.isnan(f)]

        notes = librosa.hz_to_note(np.array(averaged_frequencies))

        prompt1 =  f"Given the following midi {notes} extract the key music json parameters from the analysis"

        return prompt1
