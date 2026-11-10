import json

with open("src/data/mathQuestions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

alg_questions = [q for q in questions if q.get("domain") == "Algebra"]

skills = list(set(q.get("skill") for q in alg_questions))

for skill in skills:
    print(f"================== SKILL: {skill} ==================")
    matches = [q for q in alg_questions if q.get("skill") == skill]
    for q in matches[:2]:
        print(f"ID: {q['id']} | Type: {q['questionType']} | Ans: {q['correctAnswer']}")
        print(f"Prompt: {q['prompt'][:150]}...")
        if q['options']:
            print(f"Options: {[opt['label'] + ': ' + opt['text'] for opt in q['options']]}")
        print(f"Rationale: {q['rationale'][:250]}...\n")
