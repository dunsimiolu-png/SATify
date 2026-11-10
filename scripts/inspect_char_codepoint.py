import json

with open("src/data/mathQuestions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

q = next(q for q in questions if q['id'] == '042aa429')
rat = q['rationale']
idx = rat.find("Confusing input and output")
sub = rat[idx:idx+40]
for char in sub:
    print(f"'{char}': U+{ord(char):04X}")
