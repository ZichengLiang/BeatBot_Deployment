import unittest
from typing import List, Annotated, TypedDict, Optional
import operator
from langgraph.graph import StateGraph, START, END
from langgraph.constants import Send
from langgraph.checkpoint.memory import MemorySaver
from pydantic import BaseModel, Field
import uuid


# First define our models that will be used in tests
class Analyst(BaseModel):
    affiliation: str = Field(description="Primary affiliation of the analyst.")
    name: str = Field(description="Name of the analyst.")
    role: str = Field(description="Role of the analyst.")
    description: str = Field(description="Description of the analyst.")

    @property
    def persona(self) -> str:
        return f"Name: {self.name}\nRole: {self.role}\nAffiliation: {self.affiliation}\nDescription: {self.description}\n"


class MusicComposerState(TypedDict):
    topic: str
    max_analysts: int
    human_analyst_feedback: Optional[str]
    analysts: List[Analyst]
    interviews: Annotated[list, operator.add]
    sections: Annotated[list, operator.add]
    final_music: Optional[str]


class InterviewState(TypedDict):
    topic: str
    analyst: Analyst
    interview_content: str


class CombinedInterviewState(TypedDict):
    topic: str
    max_analysts: int
    analysts: List[Analyst]
    interviews: Annotated[list, operator.add]  # For collecting parallel results
    sections: Annotated[list, operator.add]
    final_music: Optional[str]


class TestMusicComposerWorkflow(unittest.TestCase):

    def setUp(self):
        """Setup common test components"""
        self.topic = "An impressive piano concerto chapter II in A minor"
        self.max_analysts = 2
        self.config = {"configurable": {"thread_id": str(uuid.uuid4())}}

    def get_initial_state(self):
        """Get a complete initial state"""
        return {
            "topic": self.topic,
            "max_analysts": self.max_analysts,
            "human_analyst_feedback": None,
            "analysts": [],
            "interviews": [],  # This will collect parallel results
            "sections": [],  # This will collect parallel results
            "final_music": None
        }

    def test_analyst_generation(self):
        """Test the analyst generation phase of the workflow"""

        def create_analysts(state: MusicComposerState):
            """Mock analyst creation"""
            analysts = [
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
            return {"analysts": analysts}

        workflow = StateGraph(MusicComposerState)
        workflow.add_node("create_analysts", create_analysts)
        workflow.add_edge(START, "create_analysts")
        workflow.add_edge("create_analysts", END)

        app = workflow.compile()

        result = app.invoke(self.get_initial_state())

        self.assertEqual(len(result["analysts"]), 2)
        self.assertEqual(result["analysts"][0].name, "Dr. Classical")

    def test_interview_process(self):
        """Test the interview process with analysts"""

        def conduct_interview(state: InterviewState):
            """Mock interview process for a single analyst"""
            interview_content = f"Interview with {state['analyst'].name}: Discussion about {state['topic']}"
            return {"interviews": [interview_content]}  # Return as list for operator.add

        def map_interviews(state: CombinedInterviewState):
            """Map interviews to parallel processing"""
            return [
                Send("interview", {
                    "topic": state["topic"],
                    "analyst": analyst,
                    "interview_content": ""
                })
                for analyst in state["analysts"]
            ]

        # Setup initial analysts
        initial_analysts = [
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

        # Create the workflow
        workflow = StateGraph(CombinedInterviewState)

        # Add nodes - remove the combine node
        workflow.add_node("interview", conduct_interview)

        # Add edges - simplify to just map and end
        workflow.add_conditional_edges(START, map_interviews, ["interview"])
        workflow.add_edge("interview", END)  # Go directly to END after interviews

        # Compile with memory
        memory = MemorySaver()
        app = workflow.compile(checkpointer=memory)

        # Run the workflow
        initial_state = self.get_initial_state()
        initial_state["analysts"] = initial_analysts

        result = app.invoke(initial_state, config=self.config)

        # Verify results
        self.assertEqual(len(result["interviews"]), 2)
        self.assertTrue(any("Dr. Classical" in interview for interview in result["interviews"]))
        self.assertTrue(any("Prof. Theory" in interview for interview in result["interviews"]))

    def test_music_composition(self):
        """Test the full music composition workflow"""

        def create_analysts(state: MusicComposerState):
            """Mock analyst creation"""
            analysts = [
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
            return {"analysts": analysts}

        def conduct_interviews(state: MusicComposerState):
            """Mock interview process"""
            return {
                "interviews": [
                    f"Interview with {analyst.name}: Discussion about {self.topic}"
                    for analyst in state["analysts"]
                ]
            }

        def compose_sections(state: MusicComposerState):
            """Mock section composition"""
            return {
                "sections": [
                    f"Music section based on {interview}"
                    for interview in state["interviews"]
                ]
            }

        def compose_final_music(state: MusicComposerState):
            """Mock final music composition with complete ABC notation"""
            abc_notation = """X:1
T:Piano Concerto Chapter II in A minor
C:AI Composer
M:4/4
L:1/8
K:Am
%%score (Piano1 Piano2)
V:Piano1 clef=treble name="Piano I"
%%MIDI program 1
|: A,2 C2 E2 A2 | G,2 B,2 D2 G2 | "Am"A4 "Em"E4 | "Dm"D4 "E7"E4 :|
V:Piano2 clef=bass name="Piano II"
%%MIDI program 1
|: A,,2 E,2 A,2 C2 | G,,2 D,2 G,2 B,2 | "Am"A,4 "Em"E,4 | "Dm"D,4 "E7"E,4 :|
"""
            return {"final_music": abc_notation}

        # Create the workflow
        workflow = StateGraph(MusicComposerState)

        # Add nodes
        workflow.add_node("create_analysts", create_analysts)
        workflow.add_node("conduct_interviews", conduct_interviews)
        workflow.add_node("compose_sections", compose_sections)
        workflow.add_node("compose_final_music", compose_final_music)

        # Add edges
        workflow.add_edge(START, "create_analysts")
        workflow.add_edge("create_analysts", "conduct_interviews")
        workflow.add_edge("conduct_interviews", "compose_sections")
        workflow.add_edge("compose_sections", "compose_final_music")
        workflow.add_edge("compose_final_music", END)

        # Compile with memory
        memory = MemorySaver()
        app = workflow.compile(checkpointer=memory)

        # Run the workflow
        result = app.invoke(
            self.get_initial_state(),
            config=self.config
        )

        # Verify results
        self.assertIsNotNone(result["analysts"])
        self.assertIsNotNone(result["interviews"])
        self.assertIsNotNone(result["sections"])
        self.assertIsNotNone(result["final_music"])

        # Verify ABC notation structure
        abc_notation = result["final_music"]
        self.assertIn("X:1", abc_notation)  # Reference number
        self.assertIn("T:", abc_notation)  # Title
        self.assertIn("C:", abc_notation)  # Composer
        self.assertIn("M:4/4", abc_notation)  # Meter
        self.assertIn("K:", abc_notation)  # Key
        self.assertIn("V:", abc_notation)  # Voice
        self.assertIn("%%MIDI program", abc_notation)  # MIDI instrument
        self.assertIn('"Am"', abc_notation)  # Chord symbols

    def test_human_feedback_handling(self):
        """Test handling of human feedback in the workflow"""

        def process_feedback(state: MusicComposerState):
            """Mock feedback processing"""
            if state["human_analyst_feedback"]:
                return {"analysts": [
                    Analyst(
                        name="Feedback Expert",
                        role="Specialist",
                        affiliation="Feedback Institute",
                        description=state["human_analyst_feedback"]
                    )
                ]}
            return {"analysts": []}

        workflow = StateGraph(MusicComposerState)
        workflow.add_node("process_feedback", process_feedback)
        workflow.add_edge(START, "process_feedback")
        workflow.add_edge("process_feedback", END)

        app = workflow.compile()

        # Test with feedback
        initial_state = self.get_initial_state()
        initial_state["human_analyst_feedback"] = "Focus on romantic style"

        result_with_feedback = app.invoke(initial_state)

        self.assertEqual(len(result_with_feedback["analysts"]), 1)
        self.assertEqual(
            result_with_feedback["analysts"][0].description,
            "Focus on romantic style"
        )

        # Test without feedback
        initial_state["human_analyst_feedback"] = None
        result_without_feedback = app.invoke(initial_state)

        self.assertEqual(len(result_without_feedback["analysts"]), 0)


if __name__ == '__main__':
    unittest.main()