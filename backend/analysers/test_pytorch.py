from transformers import AutoProcessor, LlavaForConditionalGeneration
import torch
from PIL import Image

# Load model
model_path = "llava-hf/llava-1.5-7b"
processor = AutoProcessor.from_pretrained(model_path)
model = LlavaForConditionalGeneration.from_pretrained(model_path, torch_dtype=torch.float16, device_map="auto")

# Load an image (Replace with your own image)
image = Image.open("example.jpg")  # Ensure "example.jpg" exists

# Prepare input
inputs = processor(text="Describe this image", images=image, return_tensors="pt").to("cuda" if torch.cuda.is_available() else "cpu")

# Generate output
with torch.no_grad():
    output = model.generate(**inputs)

response = processor.batch_decode(output, skip_special_tokens=True)
print("LLaVA Output:", response[0])