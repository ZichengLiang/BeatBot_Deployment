from langchain_core.messages import SystemMessage, HumanMessage

from .config import get_mistral_llm, ANALYST_INSTRUCTIONS
from .models import GenerateAnalystsState, Perspectives
from langgraph.graph import START, END, StateGraph
from langgraph.checkpoint.memory import MemorySaver


def create_analysts(state: GenerateAnalystsState):
    """ Create analysts """
    topic = state['topic']
    max_analysts = state['max_analysts']
    human_analyst_feedback = state.get('human_analyst_feedback', '')

    # Get LLM
    chat_llm = get_mistral_llm()

    # Enforce structured output
    structured_llm = chat_llm.with_structured_output(Perspectives)

    # System message
    system_message = ANALYST_INSTRUCTIONS.format(
        topic=topic,
        human_analyst_feedback=human_analyst_feedback,
        max_analysts=max_analysts
    )

    # Generate question
    analysts = structured_llm.invoke(
        [SystemMessage(content=system_message)] + [HumanMessage(content="Generate the set of analysts.")])

    # Write the list of analysis to state
    return {"analysts": analysts.analysts}


def human_feedback(state: GenerateAnalystsState):
    """ No-op node that should be interrupted on """
    pass


def should_continue(state: GenerateAnalystsState):
    """ Return the next node to execute """
    # Check if human feedback
    human_analyst_feedback = state.get('human_analyst_feedback', None)
    if human_analyst_feedback:
        return "create_analysts"

    # Otherwise end
    return END


def create_analyst_graph():
    # Add nodes and edges
    builder = StateGraph(GenerateAnalystsState)
    builder.add_node("create_analysts", create_analysts)
    builder.add_node("human_feedback", human_feedback)
    builder.add_edge(START, "create_analysts")
    # builder.add_edge("create_analysts", "human_feedback")
    # builder.add_conditional_edges("human_feedback", should_continue, ["create_analysts", END])
    builder.add_edge("create_analysts", END)

    # Compile
    memory = MemorySaver()
    # graph = builder.compile(interrupt_before=['human_feedback'], checkpointer=memory)
    graph = builder.compile(checkpointer=memory)

    return graph