import json
import re
from test_cleaning_prompts import clean_stem

FILE_PATH = 'src/data/mathQuestions.json'

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    questions = json.load(f)

total_count = len(questions)
print(f"Starting audit on {total_count} questions...")

algebra_updated = 0
prompts_cleaned = 0
slashes_cleaned = 0

for i, q in enumerate(questions):
    if q.get('domain') != 'Algebra':
        continue
    
    algebra_updated += 1
    
    # 1. Clean prompt stem of accessibility/screen-reader text
    orig_prompt = q.get('prompt', '')
    cleaned_prompt = clean_stem(orig_prompt)
    if cleaned_prompt != orig_prompt:
        prompts_cleaned += 1

    # 2. Normalize raw backslashes before $ and %
    cleaned_prompt = re.sub(r'\\+\$', '$', cleaned_prompt)
    cleaned_prompt = re.sub(r'\\+%', '%', cleaned_prompt)
    q['prompt'] = cleaned_prompt

    # 3. Clean rationale
    orig_rat = q.get('rationale', '')
    if orig_rat:
        rat_clean = re.sub(r'\\+\$', '$', orig_rat)
        rat_clean = re.sub(r'\\+%', '%', rat_clean)
        q['rationale'] = rat_clean

    # 4. Clean options
    opts = q.get('options', [])
    for opt in opts:
        if 'text' in opt:
            opt['text'] = re.sub(r'\\+\$', '$', opt['text'])
            opt['text'] = re.sub(r'\\+%', '%', opt['text'])

    # 5. Enforce questionType: 'spr' vs 'mcq'
    if not opts or len(opts) == 0:
        q['questionType'] = 'spr'
        if not q.get('acceptedAnswers') and q.get('correctAnswer'):
            q['acceptedAnswers'] = [str(q['correctAnswer'])]
    else:
        q['questionType'] = 'mcq'

print(f"Audited {algebra_updated} Algebra questions.")
print(f"Cleaned {prompts_cleaned} prompts with screen-reader text.")

# Verify total count is preserved
assert len(questions) == total_count, f"Question count mismatch! {len(questions)} vs {total_count}"

with open(FILE_PATH, 'w', encoding='utf-8') as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print("Saved updated questions to src/data/mathQuestions.json successfully!")
