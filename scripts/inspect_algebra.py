import json
from collections import Counter

with open("src/data/mathQuestions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

alg_questions = [q for q in questions if q.get("domain") == "Algebra"]
print(f"Total questions: {len(questions)}")
print(f"Total Algebra questions: {len(alg_questions)}")

skills = Counter(q.get("skill") for q in alg_questions)
for skill, count in skills.most_common():
    print(f"  - {skill}: {count}")

print("\n--- Sample Question 1 ---")
sample = alg_questions[0]
print(f"ID: {sample.get('id')}")
print(f"Skill: {sample.get('skill')}")
print(f"Prompt: {sample.get('prompt')}")
print(f"Options: {sample.get('options')}")
print(f"Correct Answer: {sample.get('correctAnswer')}")
print(f"Rationale:\n{sample.get('rationale')}")
