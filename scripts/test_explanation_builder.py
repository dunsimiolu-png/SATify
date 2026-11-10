import json
import re

def clean_text(s: str) -> str:
    if not s:
        return ""
    s = s.replace("\ufffd", "'").replace("\u2019", "'").replace("\u2018", "'").replace("’", "'")
    s = s.replace("â€™", "'").replace("â€œ", '"').replace("â€\x9d", '"')
    return s.strip()

def build_structured_algebra_explanation(q: dict) -> str:
    skill = q.get("skill", "")
    prompt = clean_text(q.get("prompt", ""))
    rationale = clean_text(q.get("rationale", ""))
    options = q.get("options", [])
    correct_ans = q.get("correctAnswer", "")
    q_type = q.get("questionType", "mcq")

    # Separate correct rationale from distractor rationales if present
    # In College Board rationales: "Choice X is correct. ... Choice Y is incorrect ..."
    correct_match = re.search(r'(?:Choice\s+[A-D]\s+is\s+correct\.|The\s+correct\s+answer\s+is\s+[\s\S]+?\.)([\s\S]+?)(?=Choice\s+[A-D]\s+is\s+incorrect|\Z)', rationale, re.IGNORECASE)
    if correct_match:
        algebraic_steps = correct_match.group(1).strip()
    else:
        split_incorrect = re.split(r'Choice\s+[A-D]\s+is\s+incorrect', rationale, flags=re.IGNORECASE)
        algebraic_steps = split_incorrect[0].strip()

    # Clean up repetitive leading sentences in algebraic steps
    algebraic_steps = re.sub(r'^(?:Choice\s+[A-D]\s+is\s+correct\.\s*|The\s+correct\s+answer\s+is\s+[^\.]+\.\s*)', '', algebraic_steps, flags=re.IGNORECASE).strip()

    # Determine Core Concept based on skill and prompt
    core_concept = ""
    desmos_shortcut = ""
    common_trap = ""

    p_lower = prompt.lower()
    r_lower = rationale.lower()

    if skill == "Linear equations in one variable":
        if "infinitely many" in p_lower or "no solution" in p_lower or "how many solutions" in p_lower:
            core_concept = "Analyzing the conditions for the number of solutions (zero, one, or infinitely many) of a linear equation."
            desmos_shortcut = "Enter the left-hand side as $y = \\text{[left expression]}$ in line 1 and the right-hand side as $y = \\text{[right expression]}$ in line 2. If the lines intersect at one point, there is exactly one solution. If the lines are parallel, there are no solutions. If the lines coincide completely, there are infinitely many solutions."
            common_trap = "Assuming an equation with variables on both sides automatically has infinitely many solutions without checking if the constant terms or coefficients are identical."
        elif re.search(r'what is the value of\s+([^\?]+)', prompt, re.IGNORECASE):
            target_expr = re.search(r'what is the value of\s+([^\?]+)', prompt, re.IGNORECASE).group(1).strip()
            core_concept = f"Isolating a variable or linear expression ({target_expr}) using standard algebraic operations."
            desmos_shortcut = "Enter the entire equation directly into Desmos line 1. Desmos will plot a vertical line at the value of the variable. Read the $x$-value from the $x$-axis or intersection, then substitute it into the requested expression."
            common_trap = f"Solving for the individual variable and selecting that value without evaluating the requested expression ({target_expr})."
        else:
            core_concept = "Solving a linear equation in one variable by applying inverse operations to isolate the variable."
            desmos_shortcut = "Type the given equation directly into Desmos line 1. Desmos displays a vertical line at the solution; click the $x$-intercept to read the value."
            common_trap = "Sign errors when applying the distributive property or moving terms across the equals sign."

    elif skill == "Linear equations in two variables":
        if "perpendicular" in p_lower or "perpendicular" in r_lower:
            core_concept = "Finding the slope and equation of perpendicular lines using negative reciprocal slopes ($m_1 \\cdot m_2 = -1$)."
            desmos_shortcut = "Graph the given line in Desmos. Remember that perpendicular slopes multiply to $-1$, so if the given slope is $m$, the perpendicular slope is $-\\frac{1}{m}$. You can plot the perpendicular line to visually verify the $90^\\circ$ angle."
            common_trap = "Using the opposite slope (negating without reciprocating) or the reciprocal slope (reciprocating without negating)."
        elif "parallel" in p_lower or "parallel" in r_lower:
            core_concept = "Applying the geometric property that parallel lines have identical slopes and different $y$-intercepts."
            desmos_shortcut = "Graph the given equation in Desmos. Parallel lines must have the exact same slope. Enter the candidate lines from the choices into Desmos to see which line runs parallel to the given line."
            common_trap = "Confusing parallel lines (equal slopes) with perpendicular lines (negative reciprocal slopes)."
        elif "intercept" in p_lower or "intercept" in r_lower:
            core_concept = "Determining the $x$-intercept (where $y = 0$) or $y$-intercept (where $x = 0$) of a linear equation."
            desmos_shortcut = "Type the equation into Desmos line 1. Desmos highlights the axis intercepts with gray clickable dots. Click the dot on the requested axis to view its exact coordinates $(x, y)$."
            common_trap = "Swapping the $x$-coordinate and $y$-coordinate when writing or reading an intercept (e.g., $(0, b)$ vs $(a, 0)$)."
        else:
            core_concept = "Manipulating linear equations in standard form ($Ax + By = C$) and slope-intercept form ($y = mx + b$)."
            desmos_shortcut = "Enter the given equation in Desmos. To test points or choices, enter them directly or create a table to verify which choice satisfies the equation."
            common_trap = "Failing to change signs when dividing by a negative coefficient while converting from standard form to slope-intercept form."

    elif skill == "Linear functions":
        if "f(" in prompt or "g(" in prompt or "h(" in prompt:
            core_concept = "Evaluating linear function notation $f(x)$ for specific domain inputs or solving for function parameters."
            desmos_shortcut = "Type the function definition (e.g., $f(x) = \\dots$) into line 1 in Desmos. On line 2, type the requested evaluation (e.g., $f(k)$) to instantly calculate the numerical answer."
            common_trap = "Confusing $f(a) = b$ (input is $a$, output is $b$) with multiplying $f$ by $a$."
        elif "table" in p_lower or "for each" in p_lower or "per" in p_lower:
            core_concept = "Modeling real-world linear relationships where slope represents the rate of change and the constant represents the initial value."
            desmos_shortcut = "Click the '+' icon in Desmos and add a Table with the given data points $(x_1, y_1)$. In the next line, type $y_1 \\sim m x_1 + b$ to perform instant linear regression and find $m$ and $b$."
            common_trap = "Reversing the rate of change ($m$) and initial value ($b$) in the linear function equation $f(x) = mx + b$."
        else:
            core_concept = "Analyzing linear functions, calculating rates of change, and determining function values."
            desmos_shortcut = "Enter the function in Desmos. Use the graph paper to trace points or evaluate expressions directly by typing them into the input bar."
            common_trap = "Calculating slope as $\\frac{\\Delta x}{\\Delta y}$ (run over rise) instead of the correct formula $\\frac{\\Delta y}{\\Delta x}$ (rise over run)."

    elif skill == "Systems of two linear equations in two variables":
        if "infinitely many" in p_lower or "no solution" in p_lower:
            core_concept = "Determining conditions on coefficients for a system of linear equations to have infinitely many solutions or no solution."
            desmos_shortcut = "Graph both equations in Desmos. For infinitely many solutions, the two lines must lie exactly on top of each other. Use a slider for the unknown constant (e.g., $k$) and adjust it until the two lines coincide."
            common_trap = "Equating slopes but forgetting that no solution requires different $y$-intercepts, whereas infinitely many solutions requires identical $y$-intercepts."
        elif re.search(r'what is the value of\s+([^\?]+)', prompt, re.IGNORECASE):
            target_expr = re.search(r'what is the value of\s+([^\?]+)', prompt, re.IGNORECASE).group(1).strip()
            core_concept = f"Solving a system of linear equations for a specific expression ({target_expr}) using substitution or elimination."
            desmos_shortcut = "Type Equation 1 into Desmos line 1 and Equation 2 into line 2. Click the gray dot at their intersection point to instantly find $(x, y)$. Then calculate the requested expression on line 3."
            common_trap = f"Solving for only $x$ or only $y$ instead of calculating the requested combined expression ({target_expr})."
        else:
            core_concept = "Solving a system of two linear equations simultaneously to find the unique intersection point $(x, y)$."
            desmos_shortcut = "Type both equations into Desmos on separate lines. Click the gray intersection dot where the lines cross to immediately see the solution $(x, y)$."
            common_trap = "Sign errors when subtracting one equation from another in the elimination method."

    elif skill == "Linear inequalities in one or two variables":
        if "<" in prompt or ">" in prompt or "\\le" in prompt or "\\ge" in prompt or "inequality" in p_lower:
            core_concept = "Solving and graphing linear inequalities, determining boundary lines, and identifying valid solutions in the half-plane."
            desmos_shortcut = "Type the inequality directly into Desmos (using <= for $\\le$ or >= for $\\ge$). Desmos will automatically shade the solution region. Plot candidate points $(x, y)$ to see which point lies inside the shaded region."
            common_trap = "Forgetting to reverse the inequality sign when multiplying or dividing both sides by a negative number, or including a point on a dashed boundary line ($<$ or $>$)."
        else:
            core_concept = "Formulating and interpreting linear inequalities to model real-world budget, capacity, or constraint scenarios."
            desmos_shortcut = "Enter the inequality expression into Desmos. You can test each option value directly to see which choice satisfies the constraint."
            common_trap = "Confusing 'at least' ($\\ge$) with 'at most' ($\\le$)."

    # Format into standard 4-part structure
    structured_explanation = f"""**Core Concept:** {core_concept}

**Method 1 (Algebraic Solution):**
{algebraic_steps}

**Method 2 (Desmos Shortcut):**
{desmos_shortcut}

**Common Trap:**
{common_trap}"""

    return structured_explanation.strip()

with open("src/data/mathQuestions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

alg = [q for q in questions if q.get("domain") == "Algebra"]
for i in range(3):
    q = alg[i]
    print(f"=== Question {i+1}: {q['id']} ({q['skill']}) ===")
    print(f"Prompt: {q['prompt']}")
    print(f"Ans: {q['correctAnswer']}")
    print("Structured Explanation:")
    print(build_structured_algebra_explanation(q))
    print()
