from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, get_buffer_string
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.document_loaders import WikipediaLoader

from .config import get_mistral_llm, QUESTION_INSTRUCTIONS, SEARCH_INSTRUCTIONS, ANSWER_INSTRUCTIONS, \
    SECTION_WRITER_INSTRUCTIONS
from .models import InterviewState, SearchQuery

from langgraph.graph import START, END, StateGraph


def generate_question(state: InterviewState):
    """ Node to generate a question """

    # Get state
    analyst = state["analyst"]
    messages = state["messages"]

    # Get llm
    llm = get_mistral_llm()

    # Generate question
    system_message = QUESTION_INSTRUCTIONS.format(goals=analyst.persona)
    question = llm.invoke([SystemMessage(content=system_message)] + messages)

    # Write messages to state
    return {"messages": [question]}


def search_web(state: InterviewState):
    """ Retrieve docs from web search """
    # Get LLM
    chat_llm = get_mistral_llm()

    # Ensure context exists
    if "context" not in state:
        state["context"] = []

    # Ensure messages exists
    if "messages" not in state:
        return {"messages": [], "context": []}

    # Search query
    structured_llm = chat_llm.with_structured_output(SearchQuery)
    
    # Get the messages from state
    messages = state['messages']
    
    # Ensure the last message is from a user (not an assistant)
    # This is needed because Mistral API requires the last message to be from a user or tool
    filtered_messages = []
    for msg in messages:
        if isinstance(msg, AIMessage) and msg == messages[-1]:
            # Skip if the last message is from an assistant
            continue
        filtered_messages.append(msg)
    
    # Now invoke the LLM with filtered messages
    search_query = structured_llm.invoke([SystemMessage(content=SEARCH_INSTRUCTIONS)] + filtered_messages)

    # Initialize search tool
    tavily_search = TavilySearchResults(max_results=3)

    # Search
    search_docs = tavily_search.invoke(search_query.search_query)

    # Format
    formatted_search_docs = "\n\n---\n\n".join(
        [
            f'<Document href="{doc["url"]}"/>\n{doc["content"]}\n</Document>'
            for doc in search_docs
        ]
    )

    return {"context": [formatted_search_docs]}


def search_wikipedia(state: InterviewState):
    """ Retrieve docs from wikipedia """
    # Get LLM
    chat_llm = get_mistral_llm()

    # Search query
    structured_llm = chat_llm.with_structured_output(SearchQuery)
    
    # Get the messages from state
    messages = state["messages"]
    
    # Ensure the last message is from a user (not an assistant)
    # This is needed because Mistral API requires the last message to be from a user or tool
    filtered_messages = []
    for msg in messages:
        if isinstance(msg, AIMessage) and msg == messages[-1]:
            # Skip if the last message is from an assistant
            continue
        filtered_messages.append(msg)
    
    # Now invoke the LLM with filtered messages
    search_query = structured_llm.invoke([SystemMessage(content=SEARCH_INSTRUCTIONS)] + filtered_messages)

    # Search
    search_docs = WikipediaLoader(query=search_query.search_query, load_max_docs=2).load()

    # Format
    formatted_search_docs = "\n\n---\n\n".join(
        [
            f'<Document source="{doc.metadata["source"]}" page="{doc.metadata.get("page", "")}"/>\n{doc.page_content}\n</Document>'
            for doc in search_docs
        ]
    )

    return {"context": [formatted_search_docs]}


def generate_answer(state: InterviewState):
    """ Node to answer a question """
    # Get state
    analyst = state["analyst"]
    messages = state["messages"]
    context = state["context"]

    # Get LLM
    chat_llm = get_mistral_llm()

    # Answer question
    system_message = ANSWER_INSTRUCTIONS.format(goals=analyst.persona, context=context)
    answer = chat_llm.invoke([SystemMessage(content=system_message)] + messages)

    # Name the message as coming from the expert
    answer.name = "expert"

    # Return as list with single element
    return {"messages": [answer]}


def save_interview(state: InterviewState):
    """ Save interviews """
    # Get messages
    messages = state.get("messages", [])

    # Convert interview to a string
    interview = get_buffer_string(messages)

    # Save to interview key
    return {"interview": interview}


def route_messages(state: InterviewState, name: str = "expert"):
    """ Route between question and answer """
    # Get messages with safe default
    messages = state.get("messages")
    max_num_turns = state.get('max_num_turns', 2)

    # Check the number of expert answers
    num_responses = len(
        [m for m in messages if isinstance(m, AIMessage) and m.name == name]
    )

    # End if expert has answered more than the max turns
    if num_responses >= max_num_turns:
        return 'save_interview'

    # This router is run after each question - answer pair
    # Get the last question asked to check if it signals the end of discussion
    last_question = messages[-2]

    if "Thank you so much for your help" in last_question.content:
        return 'save_interview'
    return "ask_question"


def write_section(state: InterviewState):
    """ Node to answer a question """
    # Get state
    # Join all interview_content items into a single interview text
    interview = state["interview"]
    analyst = state["analyst"]

    # Get LLM
    chat_llm = get_mistral_llm()

    # Write section using either the gathered source docs from interview (context) or the interview itself (interview)
    system_message = SECTION_WRITER_INSTRUCTIONS.format(focus=analyst.description)
    section = chat_llm.invoke([SystemMessage(content=system_message)] + [
        HumanMessage(content=f"Use this source to write your section: {interview}")])

    # Append it to state
    return {"sections": [section.content]}


def create_interview_graph():
    # Add nodes and edges
    interview_builder = StateGraph(InterviewState)
    interview_builder.add_node("ask_question", generate_question)
    interview_builder.add_node("search_web", search_web)
    interview_builder.add_node("search_wikipedia", search_wikipedia)
    interview_builder.add_node("answer_question", generate_answer)
    interview_builder.add_node("save_interview", save_interview)
    interview_builder.add_node("write_section", write_section)

    # Flow
    interview_builder.add_edge(START, "ask_question")
    interview_builder.add_edge("ask_question", "search_web")
    interview_builder.add_edge("ask_question", "search_wikipedia")
    interview_builder.add_edge("search_web", "answer_question")
    interview_builder.add_edge("search_wikipedia", "answer_question")
    interview_builder.add_conditional_edges("answer_question", route_messages, ['ask_question', 'save_interview'])
    interview_builder.add_edge("save_interview", "write_section")
    interview_builder.add_edge("write_section", END)

    # Compile
    memory = MemorySaver()
    interview_graph = interview_builder.compile()

    return interview_graph 