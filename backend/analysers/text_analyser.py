from .analyser import Analyser

class TextAnalyser(Analyser):
    """_summary_

    Args:
        Analyser (_type_): _description_
    """

    def __init__(self):
        pass

    def analyse(self, prompt:str) -> str:
        """_summary_

        Args:
            prompt (str): _description_

        Returns:
            str: _description_
        """
        #TODO: parse the prompt into musical terms
        return prompt