import json

with open("src/data/mathQuestions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

alg = [q for q in questions if q.get("domain") == "Algebra"]

skills = set(q.get("skill") for q in alg)

for s in skills:
    sample = next(q for q in alg if q.get("skill") == s)
    print(f"==================================================")
    print(f"SKILL: {s} | ID: {sample['id']} | Type: {sample['questionType']} | Ans: {sample['correctAnswer']}")
    print(f"PROMPT: {sample['prompt']}")
    print(f"RATIONALE:\n{sample['rationale']}\n")
