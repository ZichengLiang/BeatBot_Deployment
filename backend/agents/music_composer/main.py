from typing import Optional
import uuid
from langgraph.graph import StateGraph, START, END
from langgraph.constants import Send
from langgraph.checkpoint.memory import MemorySaver
from dotenv import load_dotenv
import os

from . import config
from .config import get_chat_llm 
from .models import MusicComposerState, Analyst, InterviewState, Perspectives
from langchain_deepseek import ChatDeepSeek
from langchain.schema import SystemMessage, HumanMessage
import io

from .interview_graph import \
    create_interview_graph


class MusicComposer:
    def __init__(self):
        # Create the workflow graph
        self.workflow = StateGraph(MusicComposerState)

        # Add nodes
        self.workflow.add_node("create_analysts", self._create_analysts)
        self.workflow.add_node("interview", self._conduct_interview)
        self.workflow.add_node("compose_sections", self._compose_sections)
        self.workflow.add_node("compose_final_music", self._compose_final_music)

        # Add edges
        self.workflow.add_edge(START, "create_analysts")
        self.workflow.add_conditional_edges("create_analysts", self._map_interviews, ["interview"])
        self.workflow.add_edge("interview", "compose_sections")
        self.workflow.add_edge("compose_sections", "compose_final_music")
        self.workflow.add_edge("compose_final_music", END)

        # Add memory
        memory = MemorySaver()
        self.app = self.workflow.compile(checkpointer=memory)

    def _create_analysts(self, state: MusicComposerState):
        """Create analyst personas based on the topic"""
        # Replace mock implementation with actual LLM call
        chat_llm = get_chat_llm()
        structured_llm = chat_llm.with_structured_output(Perspectives)

        system_message = config.ANALYST_INSTRUCTIONS.format(
            topic=state["topic"],
            human_analyst_feedback=state.get("human_analyst_feedback", ""),
            max_analysts=state["max_analysts"]
        )

        analysts = structured_llm.invoke([
            SystemMessage(content=system_message),
            HumanMessage(content="Generate the set of analysts.")
        ])

        # Add current step to state
        state["current_step"] = "create_analysts"
        state["step_description"] = "Creating music analysts..."

        return {"analysts": analysts.analysts, "current_step": "create_analysts"}

    def _map_interviews(self, state: MusicComposerState):
        """Map out parallel interview tasks"""
        return [
            Send(
                "interview",
                {
                    "topic": state["topic"],
                    "analyst": analyst,
                    "interview_content": ""
                }
            )
            for analyst in state["analysts"]
        ]

    def _conduct_interview(self, state: InterviewState):
        """Conduct interview with a single analyst"""
        # Initialize with the first message
        if not state.get("messages"):
            state["messages"] = [
                HumanMessage(content=f"So you said you were composing a piece of music on {state['topic']}?")
            ]

        # Set up the interview context
        state["context"] = []
        state["max_num_turns"] = 3
        state["current_step"] = "interview"
        state["step_description"] = f"Interviewing analyst {state['analyst'].name}..."

        # Create and run the interview graph
        interview_graph = create_interview_graph()
        result = interview_graph.invoke(state)

        return {"interviews": [result["interview"]], "current_step": "interview"}

    def _compose_sections(self, state: MusicComposerState):
        """Compose music sections based on interviews"""
        sections = []
        for idx, interview in enumerate(state["interviews"]):
            # Get the analyst for this interview
            analyst = state["analysts"][min(idx, len(state["analysts"]) - 1)]

            chat_llm = get_chat_llm()
            # Write a section based on the interview
            system_message = config.SECTION_WRITER_INSTRUCTIONS.format(focus=analyst.description)
            section = chat_llm.invoke([
                SystemMessage(content=system_message),
                HumanMessage(content=f"Use this interview to write your section: {interview}")
            ])

            sections.append(section.content)

        state["current_step"] = "compose_sections"
        state["step_description"] = "Composing music sections..."

        return {"sections": sections, "current_step": "compose_sections"}

    def _compose_final_music(self, state: MusicComposerState):
        """Compose final ABC notation"""
        # Get the sections and topic
        sections = state["sections"]
        topic = state["topic"]

        # Create intro, content, and outro
        chat_llm = get_chat_llm()

        # Format all sections
        formatted_sections = "\n\n".join([f"{section}" for section in sections])

        # Generate the final ABC notation
        system_message = config.FINALIZE_INSTRUCTION.format(topic=topic)
        final_music = chat_llm.invoke([
            SystemMessage(content=system_message),
            HumanMessage(content=f"Create a complete ABC notation music piece based on: {formatted_sections}")
        ])

        state["current_step"] = "compose_final_music"
        state["step_description"] = "Finalizing composition..."

        return {"final_music": final_music.content, "current_step": "compose_final_music"}

    def compose_music(self, topic: str, max_analysts: int = 3, human_analyst_feedback: Optional[str] = None) -> str:
        """Compose music in ABC notation based on a topic"""
        if not topic:
            raise ValueError("Topic cannot be empty")
        if max_analysts < 1:
            raise ValueError("max_analysts must be at least 1")

        # Create config with unique thread ID for this composition
        gen_config = {"configurable": {"thread_id": str(uuid.uuid4())}}

        # Initialize state
        initial_state = {
            "topic": topic,
            "max_analysts": max_analysts,
            "human_analyst_feedback": human_analyst_feedback,
            "analysts": [],
            "interviews": [],
            "sections": [],
            "final_music": None
        }

        # Run the graph
        load_dotenv()
        os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGCHAIN_API_KEY")
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_PROJECT"] = "agentic-music-composition"

        # Run the workflow
        result = self.app.invoke(input=initial_state, config=gen_config)
        
        # Check if final_music exists and is not None
        if not result or "final_music" not in result or result["final_music"] is None:
            # Return a default ABC notation string when generation fails
            return """X:1
T:Default Melody
C:AI Music Assistant
M:4/4
L:1/8
K:C
|CDEF GABc|"""
            
        return str_to_abc(result["final_music"])


def generate_abc_from_prompt(prompt: str) -> str:
    """Generate ABC notation music from a user prompt"""
    # Create an instance of the composer
    composer = MusicComposer()

    # Generate music from the prompt
    abc_notation = composer.compose_music(
        topic=prompt,
        max_analysts=3
    )

    return abc_notation


def str_to_abc(raw: str) -> str:
    """Convert generated string to ABC notation"""
    """The generated string is returned in markdown format, with unnecessary blank lines. This function will format the string into standard ABC notation."""

    # Handle None or empty input
    if not raw:
        return """X:1
T:Default Melody
C:AI Music Assistant
M:4/4
L:1/8
K:C
|CDEF GABc|"""

    # Step 1: trim the parts other than ABC
    # Check if string is wrapped in markdown code blocks
    if "```" in raw:
        # Extract content between markdown code blocks
        parts = raw.split("```")
        # When split by ``` we get:
        # parts[0]: text before first ```
        # parts[1]: typically language identifier "abc"
        # parts[2]: the actual ABC content
        # parts[3]: text after closing ```
        if len(parts) >= 3:
            # If parts[1] is just the language identifier, then parts[2] is the content
            if parts[1].strip().lower() in ["abc", "", "abc:"]:
                raw = parts[2].strip()
            # Otherwise, try to find the part that has ABC notation
            else:
                for i in range(1, len(parts)):
                    if "X:" in parts[i] or "T:" in parts[i]:
                        raw = parts[i].strip()
                        break

    # Step 2: remove unnecessary blank lines and language identifier
    lines = raw.splitlines()
    formatted_lines = []

    # Skip language identifier line if present
    start_idx = 0
    if lines and lines[0].strip().lower() in ["abc", "abc:"]:
        start_idx = 1

    for i in range(start_idx, len(lines)):
        line = lines[i]
        # Skip markdown formatting artifacts and unnecessary blank lines between content
        if line.strip() and not line.strip().startswith('`'):
            formatted_lines.append(line)

    # Join lines back together with proper newlines
    formatted_abc = "\n".join(formatted_lines)

    return formatted_abc