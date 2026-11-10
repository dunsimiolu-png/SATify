import json

with open(r"C:\Users\dunsi\OneDrive\Documents\SATify\src\data\mathQuestions.json", "r", encoding="utf-8") as f:
    qs = json.load(f)

q_triangle = next((x for x in qs if x["id"] == "51f26ce8"), None)
print("51f26ce8 Prompt:", repr(q_triangle.get("prompt")))

q_040 = next((x for x in qs if x["id"] == "040f2a84"), None)
print("040f2a84 Prompt:", repr(q_040.get("prompt")))
