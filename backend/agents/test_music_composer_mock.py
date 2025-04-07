import unittest
from unittest.mock import MagicMock, patch
from .music_composer import MusicComposer


class TestMusicComposerMock(unittest.TestCase):

    @patch('music_composer.main.create_interview_graph')
    @patch('music_composer.main.create_analyst_graph')
    @patch('music_composer.main.create_composition_graph')
    def test_composer_initialization(self, mock_composition, mock_analyst, mock_interview):
        """Test that MusicComposer initializes correctly with mocked dependencies"""
        # Setup mocks
        mock_interview.return_value = MagicMock()
        mock_analyst.return_value = MagicMock()
        mock_composition.return_value = MagicMock()

        # Initialize composer
        composer = MusicComposer()

        # Verify mocks were called correctly
        mock_interview.assert_called_once()
        mock_analyst.assert_called_once()
        mock_composition.assert_called_once_with(mock_interview.return_value)

        # Verify composer attributes
        self.assertIsNotNone(composer.interview_graph)
        self.assertIsNotNone(composer.analyst_graph)
        self.assertIsNotNone(composer.composition_graph)

    @patch('music_composer.main.create_interview_graph')
    @patch('music_composer.main.create_analyst_graph')
    @patch('music_composer.main.create_composition_graph')
    def test_compose_music_flow(self, mock_composition, mock_analyst, mock_interview):
        """Test the compose_music method with mocked graphs"""
        # Setup mock values
        mock_graph = MagicMock()
        mock_composition.return_value = mock_graph

        # Setup stream mock to return final_music in event
        mock_graph.stream.return_value = [
            {"some_data": "step1"},
            {"some_data": "step2"},
            {"final_music": "ABC notation result"}
        ]

        # Initialize composer
        composer = MusicComposer()

        # Test compose_music
        topic = "Test music topic"
        result = composer.compose_music(topic, max_analysts=2)

        # Verify graph was called with correct parameters
        mock_graph.stream.assert_called_once()

        # Check result
        self.assertEqual(result, "ABC notation result")


if __name__ == '__main__':
    unittest.main()