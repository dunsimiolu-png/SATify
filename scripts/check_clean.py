import json
import re

def clean_text(s: str) -> str:
    if not s:
        return ""
    s = s.replace("\ufffd", "'").replace("\u2019", "'").replace("\u2018", "'").replace("’", "'")
    s = s.replace("â€™", "'").replace("â€œ", '"').replace("â€\x9d", '"')
    return s.strip()

with open("src/data/mathQuestions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

q = questions[0]
print("Cleaned:")
print(clean_text(q['rationale'])[:150])
