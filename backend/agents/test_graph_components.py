import unittest
from langgraph.graph import StateGraph, START, END
from music_composer.analyst_graph import create_analyst_graph
from music_composer.interview_graph import create_interview_graph
from music_composer.models import GenerateAnalystsState, InterviewState, ResearchGraphState


class TestGraphComponents(unittest.TestCase):

    def test_analyst_graph_creation(self):
        """Test that create_analyst_graph returns a valid graph object"""
        graph = create_analyst_graph()
        self.assertIsNotNone(graph)
        # Check it's a compiled StateGraph
        self.assertTrue(hasattr(graph, 'invoke'))

    def test_interview_graph_creation(self):
        """Test that create_interview_graph returns a valid graph object"""
        graph = create_interview_graph()
        self.assertIsNotNone(graph)
        self.assertTrue(hasattr(graph, 'invoke'))

    def test_graph_node_execution(self):
        """Test how nodes are executed in a LangGraph StateGraph"""

        # Create a simple test graph
        def process_state(state):
            return {"processed": True}

        builder = StateGraph(dict)
        # This is correct - process_state expects a state argument
        builder.add_node("process", process_state)
        builder.add_edge(START, "process")
        builder.add_edge("process", END)
        graph = builder.compile()

        # This should work
        result = graph.invoke({"initial": True})
        self.assertTrue(result.get("processed", False))

    def test_nested_graph_execution(self):
        """Test that a compiled graph can be used as a node in another graph"""

        # First graph
        def inner_process(state):
            return {"inner_processed": True}

        inner_builder = StateGraph(dict)
        inner_builder.add_node("process", inner_process)
        inner_builder.add_edge(START, "process")
        inner_builder.add_edge("process", END)
        inner_graph = inner_builder.compile()

        # Second graph using the first as a node
        outer_builder = StateGraph(dict)
        # This is the pattern we need to use - pass the compiled graph
        outer_builder.add_node("inner", inner_graph)
        outer_builder.add_edge(START, "inner")
        outer_builder.add_edge("inner", END)
        outer_graph = outer_builder.compile()

        # This should work
        result = outer_graph.invoke({"initial": True})
        self.assertTrue(result.get("inner_processed", False))


if __name__ == '__main__':
    unittest.main()