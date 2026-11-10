import json

with open("src/data/mathQuestions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

q = next(q for q in questions if q['id'] == '042aa429')
print(repr(q['rationale']))
