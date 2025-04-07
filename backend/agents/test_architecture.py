import unittest
import inspect
from music_composer.analyst_graph import create_analyst_graph, create_analysts
from music_composer.interview_graph import create_interview_graph
from music_composer.composition_graph import create_composition_graph, initiate_all_interviews


class TestArchitecture(unittest.TestCase):

    def test_function_signatures(self):
        """Test that functions have the expected signatures"""
        # create_analyst_graph should take no arguments
        self.assertEqual(len(inspect.signature(create_analyst_graph).parameters), 0)

        # create_analysts should take a state argument
        self.assertEqual(len(inspect.signature(create_analysts).parameters), 1)

        # create_interview_graph should take no arguments
        self.assertEqual(len(inspect.signature(create_interview_graph).parameters), 1)

        # create_composition_graph should take the interview_graph
        self.assertEqual(len(inspect.signature(create_composition_graph).parameters), 1)

        # initiate_all_interviews should take a state
        self.assertEqual(len(inspect.signature(initiate_all_interviews).parameters), 1)

    def test_graph_construction_flow(self):
        """Test the logical flow of graph construction"""
        # This is a structural test, not functional

        # Interview graph should be created first
        interview_graph = create_interview_graph()
        self.assertIsNotNone(interview_graph)

        # Then the analyst graph
        analyst_graph = create_analyst_graph()
        self.assertIsNotNone(analyst_graph)

        # Finally the composition graph using the interview graph
        composition_graph = create_composition_graph(interview_graph)
        self.assertIsNotNone(composition_graph)


if __name__ == '__main__':
    unittest.main()