from openai import OpenAI
import os


class BaseAgent:
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            # Explicitly disable proxy if not needed
            http_client=None,
            # Or configure proxy properly if required:
            # http_client=httpx.Client(proxies="YOUR_PROXY_URL")
        )

    def analyze(self, prompt, system_message):
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content