from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


# Abstract Music Generator
class MusicGenerator(ABC):
    """Abstract base class for music generation"""

    @abstractmethod
    def generate_music(self, prompt: str, **kwargs) -> str:
        """Generate music from prompt, returning ABC notation"""
        pass

    @abstractmethod
    def get_name(self) -> str:
        """Return the name of this generator"""
        pass

    def get_description(self) -> str:
        """Return a description of this generator"""
        return f"{self.get_name()} Music Generator"


# Agentic Workflow Music Generator
class AgenticWorkflowGenerator(MusicGenerator):
    """Music generator using the agentic workflow approach with multiple analysts"""

    def __init__(self):
        from agents.music_composer.main import MusicComposer
        self.composer = MusicComposer()

    def generate_music(self, prompt: str, **kwargs) -> str:
        """Generate music using the agentic workflow approach"""
        max_analysts = kwargs.get('max_analysts', 3)
        human_feedback = kwargs.get('human_analyst_feedback', None)

        abc_notation = self.composer.compose_music(
            topic=prompt,
            max_analysts=max_analysts,
            human_analyst_feedback=human_feedback
        )

        return abc_notation

    def get_name(self) -> str:
        return "Agentic Workflow"


# Original MIDI Generator
class OriginalMIDIGenerator(MusicGenerator):
    """The original MIDI generator implementation"""

    def __init__(self):
        from midi_generator import MidiGenerator
        from openai import OpenAI
        import os
        import base64
        import io
        self.ds_client = OpenAI(api_key=os.getenv("DEEPSEEK_API_KEY"))

    def generate_music(self, prompt: str, **kwargs) -> str:
        """Generate music using the original approach, returning ABC notation"""
        from analysers.orchestrator import Orchestrator
        from analysers.text_analyser import TextAnalyser

        # Use text analyzer to get text analysis
        text_analysis = TextAnalyser().analyse(prompt)

        # Create orchestrator to get parameters
        orchestrator = Orchestrator(self.gpt_client)
        params = orchestrator.orchestrate(text_analysis)

        # Generate MIDI
        from midi_generator import MidiGenerator
        midi_generator = MidiGenerator(params, gpt_client=self.gpt_client)
        midi_bytes = midi_generator.generate()

        # Convert MIDI to ABC notation (simplified)
        # This would need a proper MIDI to ABC converter in a real implementation
        # For demo purposes, we'll return a placeholder ABC
        return f"""X:1
T:{params.get('style', 'Unknown')} piece based on "{prompt}"
M:{params.get('time_signature', [4, 4])[0]}/{params.get('time_signature', [4, 4])[1]}
L:1/8
K:{params.get('primary_key', 'C')}
%%MIDI program {params.get('instruments', [1])[0]}
|: C4 D4 | E4 F4 | G8 | A4 G4 | F4 E4 | D4 C4 | C8 :|"""

    def get_name(self) -> str:
        return "Original MIDI"


# Music Generator Factory
class MusicGeneratorFactory:
    """Factory for creating music generators"""

    _generators: Dict[str, MusicGenerator] = {}
    _default_generator: str = "Original MIDI"

    @classmethod
    def register_generator(cls, generator: MusicGenerator) -> None:
        """Register a music generator"""
        cls._generators[generator.get_name()] = generator

    @classmethod
    def get_generator(cls, name: Optional[str] = None) -> MusicGenerator:
        """Get a music generator by name, or the default if none specified"""
        if name is None:
            name = cls._default_generator

        generator = cls._generators.get(name)
        if not generator:
            raise ValueError(f"Unknown generator: {name}")
        return generator

    @classmethod
    def set_default_generator(cls, name: str) -> None:
        """Set the default generator"""
        if name not in cls._generators:
            raise ValueError(f"Unknown generator: {name}")
        cls._default_generator = name

    @classmethod
    def list_generators(cls) -> Dict[str, str]:
        """List all available generators with their descriptions"""
        return {name: gen.get_description() for name, gen in cls._generators.items()}

    @classmethod
    def create_music(cls, prompt: str, generator_name: Optional[str] = None, **kwargs) -> str:
        """Create music using the specified generator or the default"""
        generator = cls.get_generator(generator_name)
        return generator.generate_music(prompt, **kwargs)


# Register available generators
def initialize_generators():
    """Initialize and register all available generators"""
    # Only import and create generator instances when needed

    try:
        MusicGeneratorFactory.register_generator(OriginalMIDIGenerator())
    except Exception as e:
        print(f"Warning: Could not initialize original generator: {e}")

    try:
        MusicGeneratorFactory.register_generator(AgenticWorkflowGenerator())
    except Exception as e:
        print(f"Warning: Could not initialize Agentic Workflow generator: {e}")