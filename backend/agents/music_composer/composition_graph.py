from langgraph.constants import Send
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.graph import START, END, StateGraph

from .config import get_chat_llm, MUSIC_WRITER_INSTRUCTIONS, INTRO_OUTRO_INSTRUCTIONS, FINALIZE_INSTRUCTION
from .models import ResearchGraphState
from .analyst_graph import create_analyst_graph, human_feedback
from .interview_graph import create_interview_graph


def initiate_all_interviews(state: ResearchGraphState):
    """ This is the "map" step where we run each interview sub-graph using Send API """
    # Check if human feedback
    human_analyst_feedback = state.get('human_analyst_feedback')
    if human_analyst_feedback:
        # Return to create_analysts
        return "create_analysts"

    # Otherwise kick off interviews in parallel via Send() API
    else:
        topic = state["topic"]
        return [Send("conduct_interview", {"analyst": analyst,
                                           "messages": [HumanMessage(
                                               content=f"So you said you were composing a piece of music on {topic}?"
                                           )
                                           ]}) for analyst in state["analysts"]]


def write_music(state: ResearchGraphState):
    # Full set of sections
    sections = state["sections"]
    topic = state["topic"]

    # Get LLM
    chat_llm = get_chat_llm()
    # Concat all sections together
    formatted_str_sections = "\n\n".join([f"{section}" for section in sections])

    # Summarize the sections into a final music
    system_message = MUSIC_WRITER_INSTRUCTIONS.format(topic=topic, context=formatted_str_sections)
    music = chat_llm.invoke(
        [SystemMessage(content=system_message)] + [HumanMessage(content=f"Write a music based upon these memos.")])
    return {"content": music.content}


def write_intro(state: ResearchGraphState):
    # Full set of sections
    sections = state["sections"]
    topic = state["topic"]

    # Get LLM
    chat_llm = get_chat_llm()

    # Concat all sections together
    formatted_str_sections = "\n\n".join([f"{section}" for section in sections])

    # Summarize the sections into a final music
    instructions = INTRO_OUTRO_INSTRUCTIONS.format(topic=topic, formatted_str_sections=formatted_str_sections)
    intro = chat_llm.invoke([SystemMessage(content=instructions)] + [HumanMessage(content=f"Write the music intro")])
    return {"intro": intro.content}


def write_outro(state: ResearchGraphState):
    # Full set of sections
    sections = state["sections"]
    topic = state["topic"]

    # Get LLM
    chat_llm = get_chat_llm()

    # Concat all sections together
    formatted_str_sections = "\n\n".join([f"{section}" for section in sections])

    # Summarize the sections into a final music
    instructions = INTRO_OUTRO_INSTRUCTIONS.format(topic=topic, formatted_str_sections=formatted_str_sections)
    outro = chat_llm.invoke([SystemMessage(content=instructions)] + [HumanMessage(content=f"Compose the outro")])
    return {"outro": outro.content}


def finalize_music(state: ResearchGraphState):
    """ The is the "reduce" step where we gather all the sections, combine them, and reflect on them to write the intro/outro """
    # Save full final music
    # Get LLM
    chat_llm = get_chat_llm()

    content = state["content"]
    topic = state.get("topic", "")
    intro = state.get("intro", "")
    outro = state.get("outro", "")

    final_music = chat_llm.invoke(
        SystemMessage(content=FINALIZE_INSTRUCTION.format(topic=topic)),
        HumanMessage(
            content=f"Combine these sections into a complete music piece:\n\nINTRO:\n{intro}\n\nCONTENT:\n{content}\n\nOUTRO:\n{outro}")
    )

    return {"final_music": final_music.content}  # Return content as string instead of the message object


def create_composition_graph():
    # Create sub-graphs
    analyst_graph = create_analyst_graph()
    interview_graph = create_interview_graph()

    # Add nodes and edges
    builder = StateGraph(ResearchGraphState)
    builder.add_node("create_analysts", analyst_graph)
    builder.add_node("human_feedback", human_feedback)
    builder.add_node("conduct_interview", interview_graph)
    builder.add_node("write_music", write_music)
    builder.add_node("write_intro", write_intro)
    builder.add_node("write_outro", write_outro)
    builder.add_node("finalize_music", finalize_music)

    # Logic
    builder.add_edge(START, "create_analysts")
    builder.add_edge("create_analysts", "human_feedback")
    builder.add_conditional_edges("human_feedback", initiate_all_interviews, ["create_analysts", "conduct_interview"])
    builder.add_edge("conduct_interview", "write_music")
    builder.add_edge("conduct_interview", "write_intro")
    builder.add_edge("conduct_interview", "write_outro")
    builder.add_edge(["write_outro", "write_music", "write_intro"], "finalize_music")
    builder.add_edge("finalize_music", END)

    # Compile
    memory = MemorySaver()
    graph = builder.compile(interrupt_before=['human_feedback'], checkpointer=memory)

    return graph