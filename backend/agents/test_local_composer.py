import os
import sys
from dotenv import load_dotenv
from music_composer.main import MusicComposer


def test_music_composer():
    """
    Test the MusicComposer locally and monitor with LangSmith
    Run this from the backend directory with: python -m agents.test_local_composer
    """
    # Setup LangSmith tracing
    load_dotenv()
    os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGCHAIN_API_KEY")
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_PROJECT"] = "agentic-music-composition"

    # Get topic from command line args or use default
    topic = sys.argv[1] if len(sys.argv) > 1 else "A playful jazz melody with syncopated rhythms"

    print(f"Generating music for topic: {topic}")

    # Create composer instance
    composer = MusicComposer()

    # Generate music
    try:
        abc_notation = composer.compose_music(
            topic=topic,
            max_analysts=3,
            human_analyst_feedback=None
        )

        print("\n--- GENERATED ABC NOTATION ---")
        print(abc_notation)

        # Save to file
        with open(f"{topic}.abc", "w") as f:
            f.write(abc_notation)
        print(f"\nSaved to {topic}.abc")

    except Exception as e:
        print(f"Error generating music: {e}")
        raise


if __name__ == "__main__":
    test_music_composer()