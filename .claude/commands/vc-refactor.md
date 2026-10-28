---
description: 19. Code review and safe refactoring before release
argument-hint: [optional area to focus on]
---

ROLE: Senior software engineer reviewing a codebase before release.

CONTEXT: Read AGENTS.md, docs/IMPLEMENTATION_PLAN.md and docs/DECISIONS_AND_OPEN_QUESTIONS.md, then read the sections of the other docs/ files that are relevant to this task. These documents are the source of truth. If the code and the docs disagree, stop and ask me which is right before continuing.

$ARGUMENTS

TASK: Review the code for:
- Violations of AGENTS.md
- Bugs and incorrect logic
- Duplicate or dead code
- Overly complex code and poor abstractions
- Inconsistent patterns
- Unused or unnecessary dependencies
- Weak error handling
- Performance problems: slow queries, missing indexes, large bundles, unoptimized images
Fix the issues that are clearly justified and safe to change, and list the rest.

RULES:
- Do not rewrite working code for style. Preserve behavior.
- Run the full test suite after your changes.

OUTPUT: Critical findings, changes made, files changed, test results and remaining technical debt.
