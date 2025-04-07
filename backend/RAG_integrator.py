import os
import pickle
import numpy as np
import pandas as pd
# Simplified dependencies, removed sentence_transformers
# from sentence_transformers import SentenceTransformer

# Simple text similarity search class
class SimilaritySearch:
    def __init__(self, texts: list):
        self.style = ""
        self.mood = ""
        self.primary_key = ""
        self.tempo = 0
        self.sections = 0
        self.duration_beats = 0
        self.duration_minutes = 0.0
        self.time_signature = []
        self.instruments = []
        self.texts = texts

    def perform_similarity_search(self, k: int = 5) -> str:
        # Simplified search function, no vector embeddings
        query_text = (
            f"Style: {self.style}, Mood: {self.mood}, Key: {self.primary_key}, "
            f"Tempo: {self.tempo} BPM, Sections: {self.sections}, "
            f"Duration: {self.duration_beats} beats, {self.duration_minutes} minutes, "
            f"Time Signature: {'/'.join(map(str, self.time_signature))}, "
            f"Instruments: {', '.join(self.instruments)}."
        )
        
        # Simple keyword matching
        scores = []
        for i, text in enumerate(self.texts):
            score = 0
            for term in [self.style, self.mood, self.primary_key] + self.instruments:
                if term and term.lower() in text.lower():
                    score += 1
            scores.append((i, score))
        
        # Select top k with highest scores
        top_k = sorted(scores, key=lambda x: x[1], reverse=True)[:k]
        
        output_lines = ["Top similar entries:"]
        for rank, (idx, score) in enumerate(top_k, start=1):
            entry_text = self.texts[idx] if idx < len(self.texts) else "Unknown Entry"
            output_lines.append(f"{rank}. (Score: {score}) {entry_text}")
        return "\n".join(output_lines)


def create_similarity_searcher(base_path: str) -> SimilaritySearch:
    # Define file paths
    csv_file = os.path.join(base_path, "high_popularity_spotify_data.csv")
    pickle_file = os.path.join(base_path, "spotify_texts.pkl")

    # Try loading preprocessed text, create from CSV if doesn't exist
    if os.path.exists(pickle_file):
        try:
            with open(pickle_file, "rb") as f:
                texts = pickle.load(f)
                return SimilaritySearch(texts)
        except Exception as e:
            print(f"Error loading pickled data: {e}")
    
    # If CSV file exists, process it
    if os.path.exists(csv_file):
        try:
            text_columns = [
                "track_name", "track_artist", "track_album_name",
                "playlist_name", "playlist_genre", "playlist_subgenre"
            ]
            num_columns = [
                "track_popularity", "tempo", "danceability", "energy",
                "loudness", "valence", "instrumentalness", "speechiness", "acousticness"
            ]

            df = pd.read_csv(csv_file)
            df[text_columns] = df[text_columns].fillna("")
            df[num_columns] = df[num_columns].fillna(0)

            texts = df.apply(lambda row: (
                f"Track: {row['track_name']} by {row['track_artist']}. "
                f"Album: {row['track_album_name']}. "
                f"Playlist: {row['playlist_name']} ({row['playlist_genre']} - {row['playlist_subgenre']}). "
                f"Popularity: {row['track_popularity']}, Tempo: {row['tempo']} BPM, "
                f"Danceability: {row['danceability']}, Energy: {row['energy']}, "
                f"Loudness: {row['loudness']} dB, Valence: {row['valence']}, "
                f"Instrumentalness: {row['instrumentalness']}, Speechiness: {row['speechiness']}, "
                f"Acousticness: {row['acousticness']}."
            ), axis=1).tolist()

            # Save to pickle file for future use
            with open(pickle_file, "wb") as f:
                pickle.dump(texts, f)
                
            return SimilaritySearch(texts)
        except Exception as e:
            print(f"Error processing CSV: {e}")
    
    # If no data available, return searcher with sample data
    print("Using fallback sample texts")
    sample_texts = [
        "Track: Sample Rock Song by Rock Band. Album: Rock Album. Playlist: Rock Hits (Rock - Hard Rock). Popularity: 80, Tempo: 120 BPM.",
        "Track: Sample Pop Song by Pop Artist. Album: Pop Album. Playlist: Pop Hits (Pop - Mainstream). Popularity: 90, Tempo: 100 BPM.",
        "Track: Sample Jazz Song by Jazz Band. Album: Jazz Album. Playlist: Jazz Classics (Jazz - Swing). Popularity: 70, Tempo: 90 BPM.",
        "Track: Sample Classical Piece by Classical Composer. Album: Classical Album. Playlist: Classical Masterpieces (Classical - Symphony). Popularity: 75, Tempo: 80 BPM.",
        "Track: Sample Electronic Song by DJ. Album: Electronic Album. Playlist: Electronic Beats (Electronic - EDM). Popularity: 85, Tempo: 140 BPM."
    ]
    return SimilaritySearch(sample_texts)

# Get script base directory
base_path = os.path.dirname(os.path.abspath(__file__))

try:
    # Create searcher instance
    searcher = create_similarity_searcher(base_path)

    # Set sample search parameters
    searcher.style = "metal"
    searcher.mood = "aggressive"
    searcher.primary_key = "C minor"
    searcher.tempo = 160
    searcher.sections = 8
    searcher.duration_beats = 480
    searcher.duration_minutes = 5.5
    searcher.time_signature = [4, 4]
    searcher.instruments = ["Distorted Guitar", "Double Bass Drum", "Bass Guitar"]

    # Perform similarity search and print results
    if __name__ == "__main__":  # Only execute example when file is run directly
        result_text = searcher.perform_similarity_search(k=5)
        print(result_text)
except Exception as e:
    print(f"Error initializing similarity search: {e}")
    # Provide a simple alternative searcher
    def create_similarity_searcher(base_path: str):
        return SimpleSearchStub()
    
    class SimpleSearchStub:
        def __init__(self):
            self.style = ""
            self.mood = ""
            self.primary_key = ""
            self.tempo = 0
            self.sections = 0
            self.duration_beats = 0
            self.duration_minutes = 0.0
            self.time_signature = []
            self.instruments = []
        
        def perform_similarity_search(self, k: int = 5) -> str:
            return "Simplified search result - no vector search available"