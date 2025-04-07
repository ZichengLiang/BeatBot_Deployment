from typing import List, TypedDict, Optional
from pydantic import BaseModel, Field
from typing import Annotated
import operator
from langgraph.graph import MessagesState

class Analyst(BaseModel):
    affiliation: str = Field(
        description="Primary affiliation of the analyst.",
    )
    name: str = Field(
        description="Name of the analyst."
    )
    role: str = Field(
        description="Role of the analyst in the context of the topic.",
    )
    description: str = Field(
        description="Description of the analyst focus, concerns, and motives.",
    )
    @property
    def persona(self) -> str:
        return f"Name: {self.name}\nRole: {self.role}\nAffiliation: {self.affiliation}\nDescription: {self.description}\n"

class Perspectives(BaseModel):
    analysts: List[Analyst] = Field(
        description="Comprehensive list of analysts with their roles and affiliations.",
    )

class GenerateAnalystsState(TypedDict):
    topic: str  # Research topic
    max_analysts: int  # Number of analysts
    human_analyst_feedback: str  # Human feedback
    analysts: List[Analyst]  # Analyst asking questions

class MusicComposerState(TypedDict):
    topic: str
    max_analysts: int
    human_analyst_feedback: Optional[str]
    analysts: List[Analyst]
    interviews: Annotated[list, operator.add]
    sections: Annotated[list, operator.add]
    final_music: Optional[str]

class InterviewState(MessagesState):
    topic: str  # Topic for the interview
    analyst: Analyst  # The analyst persona
    context: Annotated[list, operator.add]  # Research context (missing in original)
    max_num_turns: int  # Maximum conversation turns (missing in original)
    interview: str  # Final interview transcript
    sections: Annotated[list, operator.add]  # For collecting results

class SearchQuery(BaseModel):
    search_query: str = Field(None, description="Search query for retrieval.")

class ResearchGraphState(TypedDict):
    topic: str  # Music topic
    max_analysts: int  # Number of analysts
    human_analyst_feedback: str  # Human feedback
    analysts: List[Analyst]  # Analyst asking questions
    sections: Annotated[list, operator.add]  # Send() API key for parallelization
    intro: str  # intro for the final music
    content: str  # Content for the final music
    outro: str  # outro for the final music
    final_music: str  # Final music