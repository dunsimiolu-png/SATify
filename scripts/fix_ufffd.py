import json

with open("src/data/mathQuestions.json", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("\ufffd", " - ")

with open("src/data/mathQuestions.json", "w", encoding="utf-8") as f:
    f.write(text)

print("Cleaned \\ufffd in mathQuestions.json.")
