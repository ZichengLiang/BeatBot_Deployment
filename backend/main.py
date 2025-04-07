import subprocess


PROMPT = """
Create a completely original song. Provide the tempo (in beats per minute), mood (e.g., energetic, melancholic, happy, etc.), and a unique name for the song.
Dont add anything other than that. List them in this specific order, separated by commas.
Base it all off the next sentance to the best of you abilities (Example of a full responce: \"120 BPM, Upbeat and optimistic, Flowers & Birds\"):\n
"""
#PROMPT = "Create a completely original song. Provide the tempo (in beats per minute), mood (e.g., energetic, melancholic, happy, etc.), and a unique name for the song. List them in this specific order, separated by commas. Base it all off the next sentance to the best of you abilities(Example: \"120 BPM, Upbeat and optimistic, Flowers & Birds\").\n"
MODEL = 'granite-code:8b'
NUMBER_OF_OUTPUTS = 3

songInfo = {
  "tempo": "",
  "mood": "",
  "name": ""
}

def spliceOutPut(Output):#takes the output and tries to organize the response into a dictionary
    split_sentence = Output.split(", ")
    if len(split_sentence) == NUMBER_OF_OUTPUTS:#I use this to check if the AI's output was correct
        songInfo["tempo"] = split_sentence[0]
        songInfo["mood"] = split_sentence[1]
        songInfo["name"] = split_sentence[2]
        return True
    print(split_sentence)
    print(len(split_sentence))
    return False

def main():
    userImput = "It's a beautiful day outside, flowers are blooming, birds are singing"
    finalPrompt = PROMPT + userImput
    command = ['ollama', 'run', MODEL, finalPrompt]

    result = subprocess.run(command, capture_output=True, text=True)

    output = result.stdout
    print(output)
    spliceOutPut(output)

    print("Tempo: " + songInfo["tempo"])
    print("Mood: " + songInfo["mood"])
    print("Name: " + songInfo["name"])

    if result.stderr:
        print("Errors:")
        print(result.stderr)

if __name__ == "__main__":
    main()
    