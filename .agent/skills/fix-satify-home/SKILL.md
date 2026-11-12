---
name: fix-satify-home
description: Audits and fixes all UI, layout, truncation, date-picker, and data-binding bugs on the SATIFY Home/Dashboard page.
---

# SATIFY Home / Dashboard Fixer

Scope your changes strictly to the Home / Dashboard page and Sidebar footer. Do not break other routes.

## 1. Fix the "NEXT SAT" Card & Edit State
- Remove the duplicate dual-input layout (where both a `<select>` dropdown and `<input type="date">` render at the same time).
- Show a single compact `<select>` dropdown with upcoming SAT dates (`Dec 5, 2026`, `Mar 14, 2027`, `May 2, 2027`, `Jun 6, 2027`, and `"Custom Date..."`) formatted short enough that text never clips inside the card.
- Only show the `<input type="date">` if `"Custom Date..."` is selected.
- Hide the top-right pencil icon while `isEditing` is active, and keep `Save` / `Cancel` compact (`px-3 py-1 text-xs`).
- If the target date is in the past (`daysRemaining < 0`), auto-advance to the next upcoming SAT date or display `"Set Date"`.

## 2. Fix "STREAK" Card Grammar & 7-Day Persistence
- Fix pluralization: `${streak} ${streak === 1 ? 'day' : 'days'}`.
- Make the subtitle dynamic: if `todayQuestions === 0`, show `"Solve 1 question to keep your streak!"`; otherwise show `"Study streak on fire!"`.
- Ensure daily activity keys use local `YYYY-MM-DD` dates instead of UTC `.toISOString().slice(0, 10)` so previous days (like Nov 11) never vanish across timezones.

## 3. Fix "START PRACTICING" Banner & Mid-Word Truncation
- Change `START PRACTICING` header to Title Case (`Start Practicing`) with a leading icon (`Play` or `BookOpen`) to match `Daily Questions` and `Your Progress`.
- Fix question preview truncation so it never cuts off mid-word without an ellipsis (e.g., `"What is the va"`). Truncate on clean word boundaries with `...` or use CSS `line-clamp-2`, and render inline math (`$a$`, `$b$`, `$k$`) via KaTeX.

## 4. Polish "Daily Questions" Card
- Change `"Reveals in ..."` to `"Resets in ..."`.
- Rename `"Daily Quantitative Challenge"` to `"Daily Math Challenge"` and `"Daily Verbal Reasoning"` to `"Daily Reading & Writing"`.
- Replace `"Click for more"` with `"Start Challenge →"`.
- Adjust the right-side decorative worksheet graphic (`pointer-events-none opacity-40 right-10`) so it does not overlap the circular `>` button.

## 5. Wire Real Data & Bar Widths in "Your Progress"
- Rename `7-DAY ACCURACY` to `7-DAY ACTIVITY` and add hover tooltips showing `X Correct, Y Incorrect (Z% Accuracy)`.
- Replace the hardcoded `STRONGEST SKILLS` and `WEAKEST SKILLS` arrays with dynamic calculations from the user's real skill accuracy data (minimum 3 attempted questions per skill).
- Bind each mini progress bar's width dynamically (`style={{ width: `${skill.accuracy}%` }}`) so `75%` bars aren't stuck at ~45% width.

## 6. Sidebar Footer & `index.html`
- Set the sidebar footer copyright to `© SATIFY ${new Date().getFullYear()}`.
- Change relative `./favicon...` and `./satify-icon.svg` paths in `index.html` to root-relative `/`.
