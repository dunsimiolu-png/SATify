import json

with open(r"C:\Users\dunsi\OneDrive\Documents\SATify\src\data\mathQuestions.json", "r", encoding="utf-8") as f:
    qs = json.load(f)

q = next((x for x in qs if x["id"] == "00ec9102"), None)
print("Prompt:", repr(q.get("prompt")))
