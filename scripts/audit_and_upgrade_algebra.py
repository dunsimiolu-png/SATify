import json
import re
import os
import shutil

MATH_JSON_PATH = "src/data/mathQuestions.json"
BACKUP_PATH = "src/data/mathQuestions.algebra_backup.json"

def clean_text(s: str) -> str:
    if not s:
        return ""
    s = s.replace("\ufffd", "'").replace("\u2019", "'").replace("\u2018", "'").replace("’", "'")
    s = s.replace("â€™", "'").replace("â€œ", '"').replace("â€\x9d", '"')
    return s.strip()

def extract_target_expression(prompt: str) -> str:
    """Extract requested expression like 'what is the value of 2x + 5'"""
    m = re.search(r'what is the value of\s+([^\?]+)', prompt, re.IGNORECASE)
    if m:
        expr = m.group(1).strip()
        # Clean trailing phrases
        expr = re.sub(r'\,?\s*(?:rounded to|to the nearest|when|where)[\s\S]*$', '', expr, flags=re.IGNORECASE)
        return expr.strip()
    return ""

def build_algebra_explanation(q: dict) -> str:
    skill = q.get("skill", "")
    prompt = clean_text(q.get("prompt", ""))
    rationale = clean_text(q.get("rationale", ""))
    options = q.get("options", [])
    correct_ans = q.get("correctAnswer", "")
    q_type = q.get("questionType", "mcq")

    # Extract algebraic proof from College Board rationale
    # Separate correct choice rationale from distractor rationales
    correct_match = re.search(r'(?:Choice\s+[A-D]\s+is\s+correct\.|The\s+correct\s+answer\s+is\s+[\s\S]+?\.)([\s\S]+?)(?=Choice\s+[A-D]\s+is\s+incorrect|\Z)', rationale, re.IGNORECASE)
    if correct_match:
        algebraic_steps = correct_match.group(1).strip()
    else:
        split_incorrect = re.split(r'Choice\s+[A-D]\s+is\s+incorrect', rationale, flags=re.IGNORECASE)
        algebraic_steps = split_incorrect[0].strip()

    # Remove repetitive leading sentence
    algebraic_steps = re.sub(r'^(?:Choice\s+[A-D]\s+is\s+correct\.\s*|The\s+correct\s+answer\s+is\s+[^\.]+\.\s*)', '', algebraic_steps, flags=re.IGNORECASE).strip()

    # Extract distractor rationales if available
    distractor_notes = []
    for d_match in re.finditer(r'(Choice\s+[A-D]\s+is\s+incorrect[\s\S]+?)(?=Choice\s+[A-D]\s+is\s+incorrect|\Z)', rationale, re.IGNORECASE):
        d_text = d_match.group(1).strip()
        # Keep concise
        if "may result from" not in d_text.lower() and len(d_text) < 180:
            distractor_notes.append(d_text)

    p_lower = prompt.lower()
    r_lower = rationale.lower()
    target_expr = extract_target_expression(prompt)

    core_concept = ""
    desmos_shortcut = ""
    common_trap = ""

    # 1. Linear equations in one variable
    if skill == "Linear equations in one variable":
        if "infinitely many" in p_lower or "no solution" in p_lower or "how many solutions" in p_lower:
            core_concept = "Analyzing linear equations to determine whether they yield a unique solution, no solution, or infinitely many solutions."
            desmos_shortcut = "Graph the left side as $y = \\text{[left expression]}$ and the right side as $y = \\text{[right expression]}$. Parallel lines indicate no solution; intersecting lines indicate exactly one solution; overlapping lines indicate infinitely many solutions."
            common_trap = "Assuming equations with variables on both sides automatically have infinitely many solutions without checking that both slopes and constant terms are identical."
        elif target_expr and target_expr not in ["x", "$x$", "y", "$y$"]:
            core_concept = f"Isolating a variable and evaluating the requested linear expression ({target_expr})."
            desmos_shortcut = f"Type the given equation directly into Desmos line 1. Desmos draws a vertical line at the value of the variable. Click the $x$-intercept to find the variable value, then evaluate {target_expr} on line 2."
            common_trap = f"Solving for the variable itself and mistakenly picking that value instead of calculating the requested expression {target_expr}."
        elif "perimeter" in p_lower or "triangle" in p_lower or "rectangle" in p_lower:
            core_concept = "Translating geometric perimeter relationships into a single-variable linear equation."
            desmos_shortcut = "Enter the perimeter equation directly into Desmos line 1 to immediately locate the value of the unknown side length along the $x$-axis."
            common_trap = "Forgetting to include all sides in the perimeter sum (e.g. including only width and length once for a rectangle instead of $2L + 2W$)."
        else:
            core_concept = "Solving a linear equation in one variable by applying inverse operations to isolate the variable."
            desmos_shortcut = "Type the equation directly into Desmos line 1. Desmos will plot a vertical line at the exact solution; click the gray dot on the $x$-axis to view the coordinate."
            common_trap = "Sign errors when distributing negative numbers or transposing terms across the equals sign."

    # 2. Linear equations in two variables
    elif skill == "Linear equations in two variables":
        if "perpendicular" in p_lower or "perpendicular" in r_lower:
            core_concept = "Finding the slope of perpendicular lines in the coordinate plane using negative reciprocals ($m_1 \\cdot m_2 = -1$)."
            desmos_shortcut = "Graph the given line in Desmos. Identify its slope $m$. The perpendicular slope is $-\\frac{1}{m}$. Graph $y = -\\frac{1}{m}x$ to confirm visually that the lines meet at a $90^\\circ$ angle."
            common_trap = "Using the opposite slope (forgetting to take the reciprocal) or reciprocal slope (forgetting to negate)."
        elif "parallel" in p_lower or "parallel" in r_lower:
            core_concept = "Applying the property that parallel lines have identical slopes ($m_1 = m_2$) and distinct $y$-intercepts."
            desmos_shortcut = "Type the given line into line 1. Enter each choice into line 2 to find which line runs strictly parallel without intersecting."
            common_trap = "Confusing parallel lines (identical slopes) with perpendicular lines (negative reciprocal slopes)."
        elif "intercept" in p_lower or "intercept" in r_lower:
            core_concept = "Determining the $x$-intercept ($y=0$) or $y$-intercept ($x=0$) of a linear equation in two variables."
            desmos_shortcut = "Enter the equation into Desmos line 1. Desmos automatically marks the intercepts with gray dots. Click the dot on the requested axis to inspect the exact coordinates."
            common_trap = "Transposing coordinates (e.g. selecting $(b, 0)$ instead of $(0, b)$ for a $y$-intercept)."
        elif target_expr and target_expr not in ["x", "$x$", "y", "$y$"]:
            core_concept = f"Manipulating a two-variable linear equation to find the value of {target_expr}."
            desmos_shortcut = "Graph the equation in Desmos. Trace the relevant points or evaluate candidate values directly."
            common_trap = f"Solving for an isolated variable instead of evaluating the requested expression {target_expr}."
        else:
            core_concept = "Converting between linear forms ($Ax + By = C$ and $y = mx + b$) and identifying slopes and coordinates."
            desmos_shortcut = "Type the equation into Desmos. You can test each answer choice by graphing them simultaneously to find the matching line."
            common_trap = "Forgetting to divide every term by the coefficient of $y$ when converting to slope-intercept form."

    # 3. Linear functions
    elif skill == "Linear functions":
        if "table" in p_lower or "data" in p_lower:
            core_concept = "Determining a linear function rule $f(x) = mx + b$ from a set of table coordinates."
            desmos_shortcut = "Click '+' and select 'table'. Enter the $(x, y)$ coordinate pairs from the table. In the next line, type $y_1 \\sim m x_1 + b$ to perform instant linear regression and display $m$ and $b$."
            common_trap = "Inverting rise over run when computing slope from table values ($\frac{\\Delta x}{\\Delta y}$ instead of $\frac{\\Delta y}{\\Delta x}$)."
        elif "f(" in prompt or "g(" in prompt or "h(" in prompt:
            core_concept = "Evaluating function notation $f(x)$ for given inputs or solving for internal function constants."
            desmos_shortcut = "Define the function in Desmos line 1 (e.g., $f(x) = \\dots$). On line 2, type the requested evaluation (e.g., $f(k)$) to see the numerical output immediately."
            common_trap = "Confusing input and output—substituting the target value for $f(x)$ instead of $x$, or vice versa."
        elif "maximum" in p_lower or "minimum" in p_lower or "rate of change" in p_lower:
            core_concept = "Interpreting the rate of change (slope) and initial condition in applied linear models."
            desmos_shortcut = "Graph the linear model in Desmos. Use the cursor to inspect key points, intercepts, and boundary constraints."
            common_trap = "Confusing the constant rate of change per unit ($m$) with the initial baseline value ($b$)."
        else:
            core_concept = "Constructing and interpreting linear functions $f(x) = mx + b$ in real-world contexts."
            desmos_shortcut = "Graph the candidate linear functions in Desmos and check which function matches the given initial value and slope conditions."
            common_trap = "Reversing the independent variable ($x$) and dependent variable ($y$) when constructing the model."

    # 4. Systems of two linear equations in two variables
    elif skill == "Systems of two linear equations in two variables":
        if "infinitely many" in p_lower or "no solution" in p_lower:
            core_concept = "Analyzing coefficient ratios in a system of linear equations for conditions of no solution or infinitely many solutions."
            desmos_shortcut = "Graph both equations in Desmos. Add a slider for the unknown coefficient (e.g., $k$). Adjust the slider until the lines become parallel (no solution) or coincide entirely (infinitely many solutions)."
            common_trap = "Remembering that parallel lines (no solution) have equal slopes but different $y$-intercepts, whereas identical lines have equal slopes AND equal $y$-intercepts."
        elif target_expr and target_expr not in ["x", "$x$", "y", "$y$"]:
            core_concept = f"Solving a system of linear equations to determine the value of {target_expr}."
            desmos_shortcut = f"Type Equation 1 on line 1 and Equation 2 on line 2. Click the gray intersection dot to obtain $(x, y)$. In line 3, type {target_expr} with the values substituted to compute the answer."
            common_trap = f"Solving for only $x$ or only $y$ and choosing that distractor instead of evaluating {target_expr}."
        else:
            core_concept = "Solving a system of two linear equations in two variables to determine their intersection point $(x, y)$."
            desmos_shortcut = "Type both equations into Desmos on separate lines. Click the gray dot at the intersection point of the two lines to read the solution $(x, y)$ instantly."
            common_trap = "Sign errors when subtracting equations during elimination or substituting expressions with parentheses."

    # 5. Linear inequalities in one or two variables
    elif skill == "Linear inequalities in one or two variables":
        if "<" in prompt or ">" in prompt or "\\le" in prompt or "\\ge" in prompt or "inequality" in p_lower:
            core_concept = "Determining the feasible solution set of linear inequalities in the coordinate plane."
            desmos_shortcut = "Enter the inequality directly into Desmos (use <= for $\\le$ or >= for $\\ge$). Desmos shades the solution region. Plot each answer choice coordinate $(x, y)$ to see which one falls inside the shaded area."
            common_trap = "Forgetting to flip the inequality sign when dividing or multiplying by a negative quantity, or including points on a dashed boundary line ($<$ or $>$)."
        else:
            core_concept = "Translating verbal constraints into linear inequality expressions involving budgets, minimums, or maximums."
            desmos_shortcut = "Enter the boundary equation into Desmos to identify the cutoff value, then test candidate numbers to verify the inequality holds."
            common_trap = "Confusing 'no more than' ($\\le$) with 'less than' ($<$), or 'at least' ($\\ge$) with 'greater than' ($>$)."

    # Build final structured output
    structured_explanation = f"""**Core Concept:** {core_concept}

**Method 1 (Algebraic Solution):**
{algebraic_steps}

**Method 2 (Desmos Shortcut):**
{desmos_shortcut}

**Common Trap:**
{common_trap}"""

    if distractor_notes:
        structured_explanation += "\n\n" + "\n\n".join(distractor_notes[:2])

    return structured_explanation.strip()

def run_audit_and_upgrade():
    # 1. Load data
    with open(MATH_JSON_PATH, "r", encoding="utf-8") as f:
        questions = json.load(f)

    # 2. Backup if not already backed up
    if not os.path.exists(BACKUP_PATH):
        shutil.copyfile(MATH_JSON_PATH, BACKUP_PATH)
        print(f"Created safety backup at {BACKUP_PATH}")

    total_count = len(questions)
    algebra_indices = [i for i, q in enumerate(questions) if q.get("domain") == "Algebra"]
    algebra_count = len(algebra_indices)

    print(f"Total questions in bank: {total_count}")
    print(f"Total Algebra questions to audit: {algebra_count}")

    # Process in sequential batches of 15
    batch_size = 15
    num_batches = (algebra_count + batch_size - 1) // batch_size

    print(f"Processing in {num_batches} sequential batches...")

    for batch_idx in range(num_batches):
        start = batch_idx * batch_size
        end = min(start + batch_size, algebra_count)
        batch_indices = algebra_indices[start:end]

        for idx in batch_indices:
            q = questions[idx]

            # 1. Math & SAT validity check
            ans = q.get("correctAnswer")
            if not ans:
                raise ValueError(f"Question {q.get('id')} has missing correctAnswer!")

            # Clean encoding artifacts in stem & options
            q["prompt"] = clean_text(q.get("prompt", ""))
            for opt in q.get("options", []):
                opt["text"] = clean_text(opt.get("text", ""))

            # 2. Build structured 4-part explanation
            new_rationale = build_algebra_explanation(q)
            q["rationale"] = new_rationale

        print(f"  Batch {batch_idx + 1}/{num_batches} completed (Questions {start+1} to {end} of {algebra_count})")

    # Save upgraded dataset
    with open(MATH_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"\nSuccessfully upgraded all {algebra_count} Algebra questions in {MATH_JSON_PATH}!")

if __name__ == "__main__":
    run_audit_and_upgrade()
