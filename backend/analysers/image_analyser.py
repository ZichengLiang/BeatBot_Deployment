from .analyser import Analyser
import ollama
import base64
import os

class ImageAnalyser(Analyser):
    """
    Analysing images, return text outputs
    """

    def __init__(self):
        pass

    def analyse(self, image_file_data=None, prompt= "Describe the image") -> str:
        if not image_file_data:
            return "Image analysis suggests...."

        try:
            analysis = self.analyse_with_llava(image_file_data, prompt)
            return f"Image analysis suggests {analysis}"

        except Exception as e:
            return f"Image analysis suggests that there was an error processing the image: {str(e)}"


    def analyse_with_llava(self, image_file_data, prompt):
        """
        Helper function to perform the actual LlaVa analysis
        """

        '''if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found at {image_path}")'''

        # with open(image_path, "rb") as f:
        image_data = base64.b64encode(image_file_data).decode("utf-8")

        # Generate response
        response = ollama.generate(
            model = "llava",
            prompt = prompt,
            images = [image_data],
        )

        return response["response"]


if __name__ == "__main__":
    analyser = ImageAnalyser()
    result = analyser.analyse("C:\\Users\\nihar\\Downloads\\beach.jpg", "Describe the image")
    print(result)
