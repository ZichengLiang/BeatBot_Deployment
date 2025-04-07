import unittest
from .music_composer.main import abc_to_midi, str_to_abc

class TestABC2MIDI(unittest.TestCase):
    def test_abc2midi_with_verified_abc(self):
        test_src = "/Users/liangzicheng/Desktop/College/CSU22013_SwEng/sweng25_group10_ibmmusicai/backend/agents/test_src/"
        test_abc = test_src + "test_abc.abc"
        test_midi = test_src + "test_midi.mid"
        abc = open(test_abc, "r")
        midi_output = abc_to_midi(abc.read(), test_midi)

        self.assertEqual(midi_output is not None, True)

    def test_abc2midi_with_llm_output(self):
        test_src = "/Users/liangzicheng/Desktop/College/CSU22013_SwEng/sweng25_group10_ibmmusicai/backend/agents/test_src/"
        test_abc = test_src + "test_llm.txt"
        test_midi = test_src + "test_llm_midi.mid"

        abc = str_to_abc(open(test_abc, "r").read())
        parsed = """
        X:1
T:Saltwater Horizons
C:Dr. Elena Carter / Inspired by The Pixies, Radiohead
M:5/4 7/8
L:1/8
Q:110
R:Alternative Surf Rock
K:D lydian
%%MIDI program 30 (distortion guitar)
%%MIDI program 91 (pad synth)
%%MIDI program 123 (seagull sounds)
%%staves (Guitar1 Guitar2 Bass Vocals Synth Effects Drums)
V:Guitar1
%%MIDI chordprog 30
[K:D lydian]
"Dsus4"z3 D2 FD AD|"Eadd9"z3 E2 GE B2|"C#m7"z3 C#2 E G B|"B5"z3 B2 F#B|
"Dsus4"z3 D2 FD AD|"Eadd9"z3 E2 GE B2|"C#m7"z3 C#2 E G B|"B5"z3 B2 F#B|
w:Tremolo picking, detuned low D drone
[K:D]
|:"D"D2 FD (3FGA | "A7"E2 GE (3GAB | "G"G2 DG (3DEF | "D"F4 z2 :|
| "D"d2 fd af | "G"g2 eg be | "A7"a4- a2 gf | "D"d6 ||
| "D"d2 fd af | "G"g2 eg ^be | "A7"a4- a2 =gf | "D"d6 ||
[K:Dm]
"Dm" (3DEF G2 | "A7" A4- A2 (3Bcd | "Dm" d4 dc (3BAG | "C" F4 z2 (3EFG |
"A7" A2 AA ABcd | "G" G4 z (3GFE | "Dm" D4 (3DDD ^C | "A7" A6 z2 |]
V:Guitar2
[K:D lydian]
%%MIDI program 26 (steel guitar)
x8|x8|x8|x8|
x8|x8|x8|x8|
[K:D]
|:x4 x4 |x4 x4 |x4 x4 |x4 x4 :|
|x4 x4 |x4 x4 |x4 x4 |x4 x4 |
|x4 x4 |x4 x4 |x4 x4 |x4 x4 ||
[K:Dm]
x4 x4 |x4 x4 |x4 x4 |x4 x4 |
x4 x4 |x4 x4 |x4 x4 |x4 x4 |]
V:Bass
[K:D lydian clef=perc]
!5!D2 D D z2|!7!D3 D D z|!5!D2 D D z2|!7!D3 D D z|
[K:D]
D,2A, D2A, | A,2E A,2E | D,2A, D2A, | F,2C F,2C |
| D,2A, D2A, | A,2E A,2E | D,2A, D2A, | F,2C F,2C |]
V:Vocals
[K:D lydian]
"D"d2 "E"e2 "F#"^f2|"G"g2 "A"a2 "B"b2|"C#"c'2 "D"d2 z2|"E"e2 "F#"^f2 "G"g2|
[K:D]
| "D"D2 F2 A2 | "G"G2 B2 d2 | "A7"c4- c2 BA | "D"D6 ||
[K:Dm]
| "Dm"Waves crash, "C"plastic shines, | "Bb"sand slips through "A7"our hands... |]
V:Synth
[K:D lydian]
%%MIDI program 91
"Dsus4"[DF#A]2 z [DF#A]2 z|"Eadd9"[EGB]2 z [EGB]2 z|"C#m7"[C#EGB]2 z [C#EGB]2 z|"B5"[BF#]2 z [BF#]2 z|
[K:D]
[DF#A]2 z [DF#A]2 z|[EGB]2 z [EGB]2 z|[C#EGB]2 z [C#EGB]2 z|[BF#]2 z [BF#]2 z|]
V:Effects
[K:D lydian]
%%MIDI program 123
!seagull!z8|!waves!z8|!boat!z8|!wind!z8|
[K:D]
z8|z4 D2 z2|z4 G2 z2|A2 z6|]
V:Drums
[K:D lydian]
%%MIDI drummap
z8|z8|z8|z8|
[K:D]
!rock! z4 d2d2 | z4 g2g2 | z4 d3d | z6 ||
z4 d2d2 | z4 g2g2 | z4 d3d | z6 |]"""
        midi_output = abc_to_midi(abc, test_midi)

        self.assertEqual(midi_output is not None, True)


if __name__ == '__main__':
    unittest.main()
