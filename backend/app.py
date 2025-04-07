from flask import Flask, jsonify, request
from flask_cors import CORS
from middleware.auth import require_auth

import logging
import io
import json
import os
import base64

import sys
from dotenv import load_dotenv

from agents.music_composer.main import MusicComposer

# Import the factory
from music_generation_factory import MusicGeneratorFactory, initialize_generators


# Comment out AudioAnalyser import
# from analysers.audio_analyser import AudioAnalyser
from analysers.text_analyser import TextAnalyser
from analysers.image_analyser import ImageAnalyser
from analysers.midi_analyser import MidiAnalyser
from analysers.orchestrator import Orchestrator
from carbonTracker import CarbonTracker

from midiutil import MIDIFile
from openai import OpenAI
from dotenv import load_dotenv
import numpy as np
# AI-wise imports
#from langchain.chains import RetrievalQA
from config import MusicConfig
from music_analysis import MusicAnalyzer
from midi_generator import MidiGenerator
from agents.base_agent import BaseAgent
import random
import TestFiles
from mido import MidiFile


# Load environment variables
load_dotenv()
gpt_client = OpenAI()
gpt_client.api_key = os.getenv('OPENAI_API_KEY')

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
    }
})

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Simple message storage (replace with database in production)
chat_history = []

# Initialize agents
#analyst = MusicAnalyst()
#composer = MelodyComposer()
#critic = MusicCritic()

# Initialize Pinecone
# pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))

# Check/create index

# Then initialize services
analyzer = MusicAnalyzer(gpt_client)

# Initialize after vector_index

# Before all routes
class APIError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.status_code = status_code

@app.route('/protected-route')
@require_auth
def protected_route():
    # Access the authenticated user from the request context
    user = request.user
    return jsonify({"message": "This is a protected route", "user": user}), 200

@app.errorhandler(APIError)
def handle_api_error(e):
    return jsonify(error=str(e)), e.status_code

@app.route('/api/test', methods=['GET'])
def test_route():
    app.logger.debug('Test route accessed')
    response = jsonify({"message": "Hello from Flask!"})
    return response
"""
@app.route('/api/midi_analyse/test', methods=['GET'])
def midi_test():
    app.logger.debug('Midi Analyser Test route accessed')
    trial = MidiAnalyser("TestFiles/PirateMusic.mid")
    data = trial.analyse()
    response = jsonify({"Data": data})
    return response
"""

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            raise APIError("Invalid request format", 400)
            
        logger.debug(f"Received message: {data}")
        
        user_message = data['message']
        chat_history.append({"role": "user", "content": user_message})
        
        # Get detailed analysis from the analyser
        # Analysis is returned as a dictionary
        text_analysis = TextAnalyser().analyse(user_message)
        #image_analysis = ImageAnalyser().analyse()
        # Comment out AudioAnalyser usage
        #audio_analysis = AudioAnalyser().analyse()
        multimodal_summary = text_analysis #+ image_analysis + audio_analysis

        orchestrator = Orchestrator(gpt_client)
        analysis = orchestrator.orchestrate(multimodal_summary)
        logger.debug(f"Now we have an analysis in chat() :" + str(analysis))

        # Generate MIDI according to the analysis
        midi_bytes = generate_midi_internal(analysis)
        # Encode binary MIDI data to base64 string
        midi_response = base64.b64encode(midi_bytes).decode('utf-8')

        # Generate a brief explanation by AI
        response_prompt = f"""User request: {user_message}
        Analysis results: {str(analysis)}
        Create a friendly, musical response explaining how you'll approach this composition."""
        
        ai_response = BaseAgent().client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a music composition assistant. Create a natural response "
                                              "explaining your compositional approach based on the analysis."},
                {"role": "user", "content": response_prompt}
            ],
            temperature=0.8
        ).choices[0].message.content

        chat_history.append({"role": "assistant", "content": ai_response})
        
        return jsonify({
            "response": ai_response,
            "parameters": analysis,
            "midi_data": midi_response,
        })
    except APIError as e:
        return handle_api_error(e)
    except Exception as e:
        logger.error(f"Error in chat processing: {str(e)}")
        return jsonify({"error": str(e)}), 500

def generate_midi_internal(params):
    with CarbonTracker(output_file="emissions.csv", country_iso_code="USA") as carbon_tracker:
       midi_generator = MidiGenerator(params, gpt_client=gpt_client)
       midi_bytes = midi_generator.generate()
    return midi_bytes

@app.route('/api/chat/history', methods=['GET'])
def get_history():
    return jsonify({"history": chat_history})

@app.route('/api/upload-midi', methods=['POST'])
def upload_midi():
    try:
        midi_data = request.get_data()
        if not midi_data:
            return jsonify({"error": "No MIDI data received"}), 400
            
        # Parse MIDI with mido
        midi_file = MidiFile(file=io.BytesIO(midi_data))
        notes = []
        tempo = 120000000  # Default tempo (120 BPM)
        
        for track in midi_file.tracks:
            absolute_time = 0
            for msg in track:
                absolute_time += msg.time
                
                if msg.type == 'set_tempo':
                    tempo = msg.tempo
                    
                if msg.type == 'note_on' and msg.velocity > 0:
                    notes.append({
                        "pitch": msg.note,
                        "time": absolute_time / midi_file.ticks_per_beat,
                        "duration": 0.5,  # Default duration, will calculate below
                        "velocity": msg.velocity / 127
                    })
                    
                if msg.type == 'note_off' or (msg.type == 'note_on' and msg.velocity == 0):
                    # Find matching note_on and calculate duration
                    for note in notes:
                        if note['pitch'] == msg.note and note['duration'] == 0.5:
                            note['duration'] = (absolute_time / midi_file.ticks_per_beat) - note['time']
                            break

        # Convert tempo from microseconds per beat to BPM
        bpm = round(60000000 / tempo)
        
        return jsonify({
            "message": "File uploaded successfully",
            "notes": notes,
            "tempo": bpm
        })
        
    except Exception as e:
        return jsonify({"error": f"MIDI processing error: {str(e)}"}), 500

@app.after_request
def after_request(response):
    app.logger.debug(f'Response Headers: {dict(response.headers)}')
    return response

@app.route('/api/midi-file-load', methods=['POST'])
def midi_file_upload():
    midi_data = request.get_data()
    if not midi_data:
        return jsonify({"error": "No MIDI data received"}), 400

    MidLoad = MidiAnalyser(midi_data)
    data = MidLoad.analyse()
    response = jsonify({"Data": data})
    return response

# Comment out audio-file-load route
"""
@app.route('/api/audio-file-load', methods=['POST'])
def audio_file_upload():
    audio_data = request.get_data()
    if not audio_data:
        return jsonify({"error": "No Audio data received"}), 400

    AudLoad = AudioAnalyser()
    data = AudLoad.analyse(audio_data)
    response = jsonify({"Data": data})
    return response
"""

@app.route('/api/image-file-load', methods=['POST'])
def image_file_upload():
    image_data = request.get_data()
    if not image_data:
        return jsonify({"error": "No Image data received"}), 400

    ImgLoad = ImageAnalyser()
    data = ImgLoad.analyse(image_data)
    response = jsonify({"Data": data})
    return response


@app.route('/api/abc-chat', methods=['POST'])
def abc_chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            raise APIError("Invalid request format", 400)

        logger.debug(f"Received message: {data}")

        user_message = data['message']
        chat_history.append({"role": "user", "content": user_message})

        # Get detailed analysis from the analyser
        # Analysis is returned as a dictionary
        text_analysis = TextAnalyser().analyse(user_message)
        multimodal_summary = text_analysis

        orchestrator = Orchestrator(gpt_client)
        analysis = orchestrator.orchestrate(multimodal_summary)
        logger.debug(f"Now we have an analysis in chat() :" + str(analysis))

        # Generate a brief explanation by AI
        response_prompt = f"""User request: {user_message}
                Analysis results: {str(analysis)}
                Create a friendly, musical response explaining how you'll approach this composition."""

        ai_response = BaseAgent().client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a music composition assistant. Create a natural response "
                                              "explaining your compositional approach based on the analysis."},
                {"role": "user", "content": response_prompt}
            ],
            temperature=0.8
        ).choices[0].message.content

        chat_history.append({"role": "assistant", "content": ai_response})

        # Setup LangSmith tracing
        load_dotenv()
        os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGCHAIN_API_KEY")
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_PROJECT"] = "agentic-music-composition"

        # Create composer instance
        composer = MusicComposer()

        # Generate music
        try:
            abc_notation = composer.compose_music(
                topic=user_message,
                max_analysts=3,
                human_analyst_feedback=None
            )

            print("\n--- GENERATED ABC NOTATION ---")
            #print(abc_notation)

            # Save to file
            #with open(f"newMusic.abc", "w") as f:
             #   f.write(abc_notation)
            #print(f"\nSaved to newMusic.abc")

        except Exception as e:
            print(f"Error generating music: {e}")
            raise

        return jsonify({
            "response": ai_response,
            "ABC_notes": abc_notation,
            #"ABCfile": f"newMusic.abc",
        })


    except APIError as e:
        return handle_api_error(e)
    except Exception as e:
        logger.error(f"Error in chat processing: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Run the Flask application')
    parser.add_argument('--port', type=int, default=5001, help='Port to run the server on')
    args = parser.parse_args()
    
    # Initialize music generators
    initialize_generators()
    # Run the application
    app.run(port=args.port) 
