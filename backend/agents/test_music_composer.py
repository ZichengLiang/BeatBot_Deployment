import unittest
from unittest.mock import Mock
from .music_composer.main import MusicComposer
from .music_composer.models import Analyst, MusicComposerState, InterviewState
from langgraph.constants import Send


class TestMusicComposer(unittest.TestCase):
    def setUp(self):
        """Setup test environment before each test"""
        self.composer = MusicComposer()
        self.topic = "An impressive piano concerto chapter II in A minor"
        self.max_analysts = 2
        self.sample_analysts = [
            Analyst(
                name="Dr. Classical",
                role="Piano Expert",
                affiliation="Conservatory",
                description="Classical music specialist"
            ),
            Analyst(
                name="Prof. Theory",
                role="Music Theorist",
                affiliation="University",
                description="Harmony expert"
            )
        ]

    def get_initial_state(self):
        """Get a complete initial state"""
        return {
            "topic": self.topic,
            "max_analysts": self.max_analysts,
            "human_analyst_feedback": None,
            "analysts": [],
            "interviews": [],
            "sections": [],
            "final_music": None
        }

    def test_create_analysts(self):
        """Test analyst creation step"""
        result = self.composer._create_analysts(self.get_initial_state())

        self.assertIn("analysts", result)
        self.assertIsInstance(result["analysts"], list)
        self.assertLessEqual(len(result["analysts"]), self.max_analysts)

        for analyst in result["analysts"]:
            self.assertIsInstance(analyst, Analyst)
            self.assertTrue(all(hasattr(analyst, attr) for attr in ["name", "role", "affiliation", "description"]))

    def test_map_interviews(self):
        """Test interview mapping logic"""
        state = self.get_initial_state()
        state["analysts"] = self.sample_analysts

        sends = self.composer._map_interviews(state)

        self.assertEqual(len(sends), len(self.sample_analysts))
        for send in sends:
            # Test Send object structure
            self.assertIsInstance(send, Send)
            self.assertEqual(send.node, "interview")
            # Test state contents
            self.assertEqual(send.arg["topic"], self.topic)
            self.assertIsInstance(send.arg["analyst"], Analyst)
            self.assertEqual(send.arg["interview_content"], "")

    def test_conduct_interview(self):
        """Test single interview execution"""
        state = {
            "topic": self.topic,
            "analyst": self.sample_analysts[0],
            "interview_content": ""
        }

        result = self.composer._conduct_interview(state)

        self.assertIn("interviews", result)
        self.assertIsInstance(result["interviews"], list)
        self.assertEqual(len(result["interviews"]), 1)
        self.assertIn(state["analyst"].name, result["interviews"][0])
        self.assertIn(state["topic"], result["interviews"][0])

    def test_compose_sections(self):
        """Test music section composition"""
        state = self.get_initial_state()
        state["interviews"] = [
            f"Interview with {analyst.name}: Discussion about {self.topic}"
            for analyst in self.sample_analysts
        ]

        result = self.composer._compose_sections(state)

        self.assertIn("sections", result)
        self.assertIsInstance(result["sections"], list)
        self.assertEqual(len(result["sections"]), len(state["interviews"]))
        for section in result["sections"]:
            self.assertIn("Music section based on", section)

    def test_compose_final_music(self):
        """Test final ABC notation composition"""
        state = self.get_initial_state()
        state["sections"] = ["Section 1", "Section 2"]

        result = self.composer._compose_final_music(state)

        self.assertIn("final_music", result)
        abc_notation = result["final_music"]

        # Verify ABC notation structure
        self.assertIn("X:1", abc_notation)  # Reference number
        self.assertIn("T:", abc_notation)  # Title
        self.assertIn("C:", abc_notation)  # Composer
        self.assertIn("M:4/4", abc_notation)  # Meter
        self.assertIn("K:", abc_notation)  # Key
        self.assertIn("V:", abc_notation)  # Voice
        self.assertIn("%%MIDI program", abc_notation)  # MIDI instrument
        self.assertIn('"Am"', abc_notation)  # Chord symbols
        self.assertIn("Piano II", abc_notation)  # Second piano voice

    def test_full_composition_workflow(self):
        """Test the entire composition workflow"""
        # Mock the internal methods to avoid actual LLM calls
        self.composer._create_analysts = Mock(return_value={"analysts": self.sample_analysts})
        self.composer._conduct_interview = Mock(return_value={
            "interviews": ["Mock interview content"]
        })
        self.composer._compose_sections = Mock(return_value={
            "sections": ["Mock section content"]
        })
        self.composer._compose_final_music = Mock(return_value={
            "final_music": "X:1\nT:Test\nM:4/4\nK:C\n|CDEF|"
        })

        # Run the composition
        result = self.composer.compose_music(
            topic=self.topic,
            max_analysts=self.max_analysts
        )

        # Verify the workflow
        self.assertIsNotNone(result)
        self.assertIsInstance(result, str)
        self.assertIn("X:1", result)  # Basic ABC notation check

    def test_error_handling(self):
        """Test error handling in the workflow"""
        # Test with invalid max_analysts
        with self.assertRaises(ValueError):
            self.composer.compose_music(self.topic, max_analysts=0)

        # Test with empty topic
        with self.assertRaises(ValueError):
            self.composer.compose_music("")

    def test_parallel_interview_workflow(self):
        """Test the parallel processing of interviews"""
        # Setup initial state
        state = self.get_initial_state()
        state["analysts"] = self.sample_analysts

        # Test mapping
        sends = self.composer._map_interviews(state)
        self.assertEqual(len(sends), len(self.sample_analysts))

        # Test parallel execution
        all_interviews = []
        for send in sends:
            result = self.composer._conduct_interview(send.arg)
            all_interviews.extend(result["interviews"])

        # Verify results
        self.assertEqual(len(all_interviews), len(self.sample_analysts))
        for analyst, interview in zip(self.sample_analysts, all_interviews):
            self.assertIn(analyst.name, interview)
            self.assertIn(self.topic, interview)


if __name__ == '__main__':
    unittest.main()