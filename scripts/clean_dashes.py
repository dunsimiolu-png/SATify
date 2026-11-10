import json

with open("src/data/mathQuestions.json", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("\u2014", " - ")
text = text.replace("\u2013", "-")

with open("src/data/mathQuestions.json", "w", encoding="utf-8") as f:
    f.write(text)

print("Standardized em-dashes to ' - ' in mathQuestions.json.")
