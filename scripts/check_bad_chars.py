import json

with open("src/data/mathQuestions.json", "r", encoding="utf-8") as f:
    text = f.read()

count_ufffd = text.count("\ufffd")
print(f"Total \\ufffd in mathQuestions.json: {count_ufffd}")

# Check other non-ascii or odd characters
import re
odd_chars = set(re.findall(r'[^\x00-\x7F]', text))
# Filter out common math symbols and Greek letters
known_ok = set('αβγδεθλμπστφωΔΩ°±×÷≤≥≠≈√∞—–’‘“”…½¼¾⅓⅔⅛⅜⅝⅞')
suspicious = odd_chars - known_ok
print("Suspicious characters:", suspicious)
