import sys
import os
from pathlib import Path

from music_composer.main import str_to_abc


def test_str_to_abc():
    # Test case 1: ABC notation wrapped in markdown code blocks
    markdown_abc = """
# Generated Music

Here's the ABC notation for "A playful jazz melody":

```abc
X:1
T:Montgomery's Playful Paradox
C:After Tatum/Monk/Gershwin, Prof. Chen, Dr. Sophie Laurent
M:4/4
L:1/8
Q:180
R:Jazz
%%MIDI program 1  % Acoustic Grand Piano
K:C

V:melody
%%MIDI program 1
(3GAB (3cde | (3fed (3cBA | G2 F2 E2 D2 | C4 z2 |
```

Let me know what you think!
"""

    # Test case 2: Pure ABC notation with extra blank lines
    pure_abc_with_blanks = """
X:1
T:Montgomery's Playful Paradox

C:After Tatum/Monk/Gershwin, Prof. Chen, Dr. Sophie Laurent

M:4/4
L:1/8
Q:180

R:Jazz
%%MIDI program 1  % Acoustic Grand Piano
K:C

V:melody
%%MIDI program 1
(3GAB (3cde | (3fed (3cBA | G2 F2 E2 D2 | C4 z2 |
"""

    # Expected result for both test cases
    expected = """X:1
T:Montgomery's Playful Paradox
C:After Tatum/Monk/Gershwin, Prof. Chen, Dr. Sophie Laurent
M:4/4
L:1/8
Q:180
R:Jazz
%%MIDI program 1  % Acoustic Grand Piano
K:C
V:melody
%%MIDI program 1
(3GAB (3cde | (3fed (3cBA | G2 F2 E2 D2 | C4 z2 |"""

    # Test with markdown
    result1 = str_to_abc(markdown_abc)
    print("Test case 1 (Markdown ABC):")
    print(result1)
    print("Passed:", result1.strip() == expected.strip())

    # Test with pure ABC that has blank lines
    result2 = str_to_abc(pure_abc_with_blanks)
    print("\nTest case 2 (Pure ABC with blank lines):")
    print(result2)
    print("Passed:", result2.strip() == expected.strip())

    # Test with the actual file
    try:
        with open("backend/A playful jazz melody with syncopated rhythms.abc", "r") as f:
            abc_content = f.read()

        # Simulate markdown wrapping
        markdown_wrapped = f"```abc\n{abc_content}\n```"

        result3 = str_to_abc(markdown_wrapped)
        print("\nTest case 3 (File content wrapped in markdown):")
        print(f"Input length: {len(markdown_wrapped)}")
        print(f"Output length: {len(result3)}")
        print("Passed:", len(result3.strip()) > 0 and "```" not in result3)

    except FileNotFoundError:
        print("\nTest case 3 skipped: File not found")


if __name__ == "__main__":
    test_str_to_abc()