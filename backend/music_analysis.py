import json

from config import MusicConfig
from flask import jsonify
import logging

logger = logging.getLogger(__name__)

class MusicAnalyzer:
    #--------------------#
    style:            str
    mood:             str
    #--------------------#
    key:              str
    tempo:            int
    sections:         int
    duration_seconds: int
    duration_beats:   int
    time_signature:   tuple[int, int]
    instruments:      list[str]
    #--------------------#

    def __init__(self, ai_client):
        self.ai_client = ai_client

    def analyze_prompt(self, prompt: str) -> dict:
        """ Respond with a dict with all parameters in config.py"""
        try:
            response = self.ai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": MusicConfig.MUSIC_ANALYSIS_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            logger.debug("MusicAnalyzer: analysis " + response.choices[0].message.content)
            return self._parse_response(response.choices[0].message.content)
        except Exception as e:
            return self._default_parameters(str(e))

    def _default_parameters(self, reason):
        print("Ooooooops, something went wrong with analyzing prompt, now return default parameters")
        return {
            "key": MusicConfig.DEFAULT_KEY,
            "tempo": MusicConfig.DEFAULT_TEMPO,
            "style": MusicConfig.DEFAULT_STYLE,
            "mood": MusicConfig.DEFAULT_MOOD,
            "sections": MusicConfig.DEFAULT_SECTIONS,
            "duration_seconds": MusicConfig.DEFAULT_DURATION_SECONDS,
            "duration_beats": MusicConfig.DEFAULT_DURATION_BEATS,
            "time_signature": MusicConfig.DEFAULT_TIME_SIGNATURE,
            "instruments": MusicConfig.DEFAULT_INSTRUMENTS,
            "error": MusicConfig.ERROR_DEFAULT.format(reason=reason)
        }

    def _parse_response(self, response_text):
        try:
            result = json.loads(response_text)
            return result
        except json.JSONDecodeError:
            return self._default_parameters(MusicConfig.ERROR_INVALID_JSON)