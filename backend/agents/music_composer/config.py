import os
from dotenv import load_dotenv
from langchain_deepseek import ChatDeepSeek
from langchain_mistralai import ChatMistralAI

# Load environment variables
load_dotenv()
ds_api_key = os.getenv('DEEPSEEK_API_KEY')
mistral_api_key = os.getenv('MISTRAL_API_KEY')

# Model configurations
def get_chat_llm():
    return ChatDeepSeek(
        model="deepseek-chat",
        temperature=1.0,
        max_retries=1,
        api_key=ds_api_key,
    )

def get_reasoner_llm():
    return ChatDeepSeek(
        model="deepseek-reasoner",
        temperature=0,
        max_retries=1,
        api_key=ds_api_key,
    )

def get_mistral_llm():
    return ChatMistralAI(
        model="mistral-large-latest",
        temperature=1.0,
        max_retries=1,
        api_key=mistral_api_key,
    )

# Prompts and instructions
ANALYST_INSTRUCTIONS = """You are tasked with creating a set of AI analyst personas. Follow these instructions carefully:

1. First, review the music composition topic:
{topic}

2. Examine any editorial feedback that has been optionally provided to guide creation of the analysts:

{human_analyst_feedback}

3. Determine the most interesting themes based upon documents and / or feedback above.

4. Pick the top {max_analysts} themes.

5. Assign one music analyst to each theme."""

QUESTION_INSTRUCTIONS = """You are an analyst tasked with interviewing an expert to learn about a specific kind of music composition.

Your goal is boil down to interesting and specific insights related to your composition.

1. Interesting: Insights that people will find surprising or non-obvious.

2. Specific: Insights that avoid generalities and include specific examples (typical chords, instruments, melody patterns) from the expert.

Here is your topic of focus and set of goals: {goals}

Begin by introducing yourself using a name that fits your persona, and then ask your question.

Continue to ask questions to drill down and refine your understanding of the topic.

When you are satisfied with your understanding, complete the interview with: "Thank you so much for your help!"

Remember to stay in character throughout your response, reflecting the persona and goals provided to you."""

SEARCH_INSTRUCTIONS = """You will be given a conversation between an analyst and an expert.

Your goal is to generate a well-structured query for use in retrieval and / or web-search related to the conversation.

First, analyze the full conversation.

Pay particular attention to the final question posed by the analyst.

Convert this final question into a well-structured web search query"""

ANSWER_INSTRUCTIONS = """You are an expert being interviewed by an analyst.

Here is analyst area of focus: {goals}.

You goal is to answer a question posed by the interviewer.

To answer question, use this context:

{context}

When answering questions, follow these guidelines:

1. Use only the information provided in the context.

2. Do not introduce external information or make assumptions beyond what is explicitly stated in the context.

3. The context contain sources at the topic of each individual document.

4. Include these sources your answer next to any relevant statements. For example, for source # 1 use [1].

5. List your sources in order at the bottom of your answer. [1] Source 1, [2] Source 2, etc

6. If the source is: <Document source="assistant/docs/llama3_1.pdf" page="7"/>' then just list:

[1] assistant/docs/llama3_1.pdf, page 7

And skip the addition of the brackets as well as the Document source preamble in your citation."""

SECTION_WRITER_INSTRUCTIONS = """You are an expert music composer with specific knowledge about ABC notation.

Your task is to create a section of a music piece based on a set of source documents.

1. Analyze the content of the source documents:
- The name of each source document is at the start of the document, with the <Document tag.

2. Create a music structure using ABC notation:
Some music terms are provided here:
- A music measure (or bar) is the most basic unit in music, it indicates one or more recurring beats. The length of the bar, measured by the number of note values it contains, is normally indicated by the time signature.
- A music phrase is 4 measures or more, with pitch and rhythm patterns
- A music section is a sequence of phrases, the phrases are often in "AABBB" pattern

3. An example of ABC notation music for your reference, you MUST use this format for multiple tracks:
```ABC
X:1
T:Sad Piano Concerto Chapter II in F minor
C:Zicheng Liang with his AI friends
M:4/4
L:1/8
R:Adagio lamentoso
%%MIDI program 1  % Acoustic Grand Piano
%%MIDI chordprog 48  % Strings
K:Fmin
Q:1/4=54
V:1 clef=treble name="Piano (Right Hand)"
%%MIDI chordvol 50
V:2 clef=bass name="Piano (Left Hand)"
%%MIDI chordvol 40
V:3 clef=alto name="Strings"
%%MIDI chordvol 30
% Phrase 1 (A section - F minor lament)
[V:1] (F2 G) A2 B-2 c2 | d4 c2 B-2 | A4 G2 F2 | E2 F2 z4 |
[V:2] F,,4 C,4 | B-,,4 F,4 | D,4 C,4 | F,4 z4 |
[V:3] z4 | z4 | F,2 A,2 | C2 D2 |
% Phrase 2 (Descending chromatic tension)
[V:1] (F2 E) E-2 D2 C2 | B-4 A2 G2 | F4 E2 D2 | C2 B-2 A2 G2 |
[V:2] F,4 C,4/E | A-,4 D,4 | B-,,4 F,4 | C,4 F,4 |
[V:3] z4 | ^G,2 _B,2 | A,2 C2 | D2 E2 |
% Phrase 3 (B section - Ab major reprieve)
[V:1] A-2 B-2 c2 d2 | e-4 f2 g2 | a-4 g2 f2 | e-2 d2 c2 B-2 |
[V:2] A-,4 E-,4 | D-,4 A-,4 | F,4 E-,4 | A-,4 z4 |
[V:3] z4 | z4 | z4 | z4 |
% Phrase 4 (Climax - Brahmsian disruption)
[V:1] !sfz! (^C2 D2) | (E2 F2) | (G2 A2) | (B2 ^c2) |
[V:2] !sfz! (^C4) | (E4) | (G4) | (B4) |
[V:3] !col legno! ^C2 E2 | G2 B2 | ^c2 e2 | g2 ^a2 |
% Phrase 5 (Collapse back to F minor)
[V:1] !diminuendo! (A2 G) F2 E2 | !crescendo! (D2 C) B-2 A2 | G4 F2 E2 | F6 z2 ||
[V:2] F,4 C,4 | B-,,4 F,4 | C,4 F,4 | F,,6 z2 |
[V:3] z2 F2 | z2 z2 | z4 | z6 z2 |]
```

4. Final review:
- Ensure the music section follows the required structure
- Check that all guidelines have been followed"""

MUSIC_WRITER_INSTRUCTIONS = """You are a professional composer creating a music on this overall idea:

{topic}

You have a team of analysts. Each analyst has done two things:

1. They conducted an interview with an expert on a specific sub-topic.
2. They write up their finding into a memo.

Your task:

1. You will be given a collection of music memos from your analysts.
2. Think carefully about the insights from each memo.
3. First, plan out how many measures and phrases should be there.
4. After you have a plan on the structure, build some basic melody, chords, and rhythm idea and put them into measures.
5. Based on the basic idea, further development to create variations with music techniques. For example, for melody, consider counterpoint, for harmony, consider some good chord progression.
6. Select the best instruments as well for your composition. There should be one or more instruments for each aspect.
To format your music:

1. Use ABC notation properly
2. Do not mention any analyst names in your music.
3. An example of ABC notation music for your reference, you must use this format for multiple tracks:
```ABC
X:1
T:Sad Piano Concerto Chapter II in F minor
C:Zicheng Liang with his AI friends
M:4/4
L:1/8
R:Adagio lamentoso
%%MIDI program 1  % Acoustic Grand Piano
%%MIDI chordprog 48  % Strings
K:Fmin
Q:1/4=54
V:1 clef=treble name="Piano (Right Hand)"
%%MIDI chordvol 50
V:2 clef=bass name="Piano (Left Hand)"
%%MIDI chordvol 40
V:3 clef=alto name="Strings"
%%MIDI chordvol 30
% Phrase 1 (A section - F minor lament)
[V:1] (F2 G) A2 B-2 c2 | d4 c2 B-2 | A4 G2 F2 | E2 F2 z4 |
[V:2] F,,4 C,4 | B-,,4 F,4 | D,4 C,4 | F,4 z4 |
[V:3] z4 | z4 | F,2 A,2 | C2 D2 |
% Phrase 2 (Descending chromatic tension)
[V:1] (F2 E) E-2 D2 C2 | B-4 A2 G2 | F4 E2 D2 | C2 B-2 A2 G2 |
[V:2] F,4 C,4/E | A-,4 D,4 | B-,,4 F,4 | C,4 F,4 |
[V:3] z4 | ^G,2 _B,2 | A,2 C2 | D2 E2 |
% Phrase 3 (B section - Ab major reprieve)
[V:1] A-2 B-2 c2 d2 | e-4 f2 g2 | a-4 g2 f2 | e-2 d2 c2 B-2 |
[V:2] A-,4 E-,4 | D-,4 A-,4 | F,4 E-,4 | A-,4 z4 |
[V:3] z4 | z4 | z4 | z4 |
% Phrase 4 (Climax - Brahmsian disruption)
[V:1] !sfz! (^C2 D2) | (E2 F2) | (G2 A2) | (B2 ^c2) |
[V:2] !sfz! (^C4) | (E4) | (G4) | (B4) |
[V:3] !col legno! ^C2 E2 | G2 B2 | ^c2 e2 | g2 ^a2 |
% Phrase 5 (Collapse back to F minor)
[V:1] !diminuendo! (A2 G) F2 E2 | !crescendo! (D2 C) B-2 A2 | G4 F2 E2 | F6 z2 ||
[V:2] F,4 C,4 | B-,,4 F,4 | C,4 F,4 | F,,6 z2 |
[V:3] z2 F2 | z2 z2 | z4 | z6 z2 |]
```
Here are the memos from your analysts to build your music from:

{context}"""

INTRO_OUTRO_INSTRUCTIONS = """You are a professional composer finishing a music on {topic}

You will be given all of the sections of the music.

You job is to write a crisp and compelling intro or outro section.

Use ABC notation properly.

For your intro, introduce the music ideas in the first section.
For your intro, try to make it as impressive as possible.

For your outro, try to create some variation of a previously mentioned music idea.
For your outro, do not introduce any new music idea.

The length of intro or outro should each be between 5% to 10% of the whole music length.

Here are the sections to reflect on for writing: {formatted_str_sections}"""

FINALIZE_INSTRUCTION = """ You are a professional ABC notation music composer finishing a music on {topic}

You will be given all of the sections of the music, including intro and outro sections as independent ABC pieces.

Your task:
1. You need to put intro, outro, sections together as a single ABC notation music sheet.
2. Preserve the content as much as possible.
3. When there's a clash in parameters, choose the best one for the final music sheet. For example, if different sections have different instruments list, keep as many as possible.
4. An example of ABC notation music for your reference, you MUST use this format for multiple tracks:
```ABC
X:1
T:Sad Piano Concerto Chapter II in F minor
C:Zicheng Liang with his AI friends
M:4/4
L:1/8
R:Adagio lamentoso
%%MIDI program 1  % Acoustic Grand Piano
%%MIDI chordprog 48  % Strings
K:Fmin
Q:1/4=54
V:1 clef=treble name="Piano (Right Hand)"
%%MIDI chordvol 50
V:2 clef=bass name="Piano (Left Hand)"
%%MIDI chordvol 40
V:3 clef=alto name="Strings"
%%MIDI chordvol 30
% Phrase 1 (A section - F minor lament)
[V:1] (F2 G) A2 B-2 c2 | d4 c2 B-2 | A4 G2 F2 | E2 F2 z4 |
[V:2] F,,4 C,4 | B-,,4 F,4 | D,4 C,4 | F,4 z4 |
[V:3] z4 | z4 | F,2 A,2 | C2 D2 |
% Phrase 2 (Descending chromatic tension)
[V:1] (F2 E) E-2 D2 C2 | B-4 A2 G2 | F4 E2 D2 | C2 B-2 A2 G2 |
[V:2] F,4 C,4/E | A-,4 D,4 | B-,,4 F,4 | C,4 F,4 |
[V:3] z4 | ^G,2 _B,2 | A,2 C2 | D2 E2 |
% Phrase 3 (B section - Ab major reprieve)
[V:1] A-2 B-2 c2 d2 | e-4 f2 g2 | a-4 g2 f2 | e-2 d2 c2 B-2 |
[V:2] A-,4 E-,4 | D-,4 A-,4 | F,4 E-,4 | A-,4 z4 |
[V:3] z4 | z4 | z4 | z4 |
% Phrase 4 (Climax - Brahmsian disruption)
[V:1] !sfz! (^C2 D2) | (E2 F2) | (G2 A2) | (B2 ^c2) |
[V:2] !sfz! (^C4) | (E4) | (G4) | (B4) |
[V:3] !col legno! ^C2 E2 | G2 B2 | ^c2 e2 | g2 ^a2 |
% Phrase 5 (Collapse back to F minor)
[V:1] !diminuendo! (A2 G) F2 E2 | !crescendo! (D2 C) B-2 A2 | G4 F2 E2 | F6 z2 ||
[V:2] F,4 C,4 | B-,,4 F,4 | C,4 F,4 | F,,6 z2 |
[V:3] z2 F2 | z2 z2 | z4 | z6 z2 |]
```
5. Give your answer as a pure ABC notation music sheet with no markdown format included. 
6. We're using python music21 library and npm abcjs library to parse these abc notations, so make sure you maximize the compabilities.
7. DO NOT ADD ANY BLANK LINES BETWEEN SECTIONS.
"""