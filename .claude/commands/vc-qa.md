---
description: Write and run a test plan
argument-hint: [optional area to focus on]
---

ROLE: Senior QA engineer and test automation specialist.

CONTEXT: Read AGENTS.md, docs/IMPLEMENTATION_PLAN.md and docs/DECISIONS_AND_OPEN_QUESTIONS.md, then read the sections of the other docs/ files that are relevant to this task. These documents are the source of truth. If the code and the docs disagree, stop and ask me which is right before continuing. If a document named in this prompt does not exist, use the closest equivalent in docs/ or skip it, and say which you used. Read all user journeys in docs/PRODUCT_REQUIREMENTS.md.

$ARGUMENTS

TASK: If the project has an acceptance-test or test-plan doc, use it as the checklist and report against each item. Otherwise write a test plan. Cover what has been built:

- Each core user journey, end to end
- Happy paths and edge cases
- Invalid input
- Each role's permissions, including access that must be denied
- API and database failures
- Loading, empty and error states
- Integrations, including mocked failures
- Mobile and desktop layouts
- Keyboard navigation and screen-reader labels on the key flows

Add unit, integration and end-to-end tests for business-critical behavior.

RULES:

- Prioritize critical paths over coverage numbers.
- Do not change production code to make a test pass. Report the bug instead.

OUTPUT: Tests added, results (passed and failed, with output), bugs found with severity and steps to reproduce, and recommended fixes.
