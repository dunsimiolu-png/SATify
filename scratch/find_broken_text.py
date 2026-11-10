import json
import re

with open(r"C:\Users\dunsi\OneDrive\Documents\SATify\src\data\mathQuestions.json", "r", encoding="utf-8") as f:
    qs = json.load(f)

for q in qs:
    texts = [q.get("prompt", "")] + [o.get("text", "") for o in q.get("options", [])]
    for t in texts:
        if "\\text{$}" in t:
            print(f"Found \\text{{$}} in {q['id']} ({q['domain']})")
        if "\\text{" in t:
            # check for unclosed or nested $
            matches = re.findall(r"\$([^\$\n]+)\$", t)
            for m in matches:
                if "\\text{" in m and "}" not in m:
                    print(f"Broken \\text in {q['id']} ({q['domain']}): {m}")
