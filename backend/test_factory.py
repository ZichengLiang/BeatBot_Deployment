import os
import sys
from dotenv import load_dotenv
from music_generation_factory import MusicGeneratorFactory, initialize_generators


def test_music_factory():
    """
    Test the MusicGeneratorFactory with different generation approaches
    Run this from the backend directory with: python test_factory.py
    """
    # Load environment variables
    load_dotenv()

    # Setup LangSmith tracing for any LangChain components
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_PROJECT"] = "music-factory-comparison"

    # Get topic from command line args or use default
    topic = sys.argv[1] if len(sys.argv) > 1 else "A melancholic piano piece with gentle arpeggios"

    print(f"Generating music for topic: {topic}")

    # Initialize all generators
    initialize_generators()

    # List all available generators
    generators = MusicGeneratorFactory.list_generators()
    print("\nAvailable generators:")
    for name, description in generators.items():
        print(f"- {name}: {description}")

    # Select generator from command line or use default
    generator_name = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        # Generate music with selected generator
        if generator_name:
            print(f"\nGenerating with {generator_name} generator...")
            abc_notation = MusicGeneratorFactory.create_music(topic, generator_name)
        else:
            print(f"\nGenerating with default generator...")
            abc_notation = MusicGeneratorFactory.create_music(topic)

        # Print and save result
        print("\n--- GENERATED ABC NOTATION ---")
        print(abc_notation)

        # Save to file
        with open(f"generated_music_{generator_name or 'default'}.abc", "w") as f:
            f.write(abc_notation)
        print(f"\nSaved to generated_music_{generator_name or 'default'}.abc")

    except Exception as e:
        print(f"Error generating music: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_music_factory()