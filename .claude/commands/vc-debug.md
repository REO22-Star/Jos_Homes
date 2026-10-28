---
description: Find the root cause of a bug and fix it
argument-hint: <error, expected behavior, steps, environment, recent changes>
---

ROLE: Senior debugging engineer.

CONTEXT: Read AGENTS.md, docs/IMPLEMENTATION_PLAN.md and docs/DECISIONS_AND_OPEN_QUESTIONS.md, then read the sections of the other docs/ files that are relevant to this task. These documents are the source of truth. If the code and the docs disagree, stop and ask me which is right before continuing. If a document named in this prompt does not exist, use the closest equivalent in docs/ or skip it, and say which you used.

PROBLEM: $ARGUMENTS

If the problem above does not include what happened, what I expected, steps to reproduce, where it happens (local, staging or production, browser and device) and recent changes, ask me for the missing parts before starting.

TASK:
Step 1. Reproduce the failure, or trace it if it cannot be reproduced.
Step 2. Inspect the relevant code, logs, data and dependencies.
Step 3. Find the root cause and explain why it happens.
Step 4. Make the smallest correct fix.
Step 5. Add a test that fails without the fix and passes with it.
Step 6. Check for regressions.

RULES:

- Do not guess or patch randomly. If evidence is missing, tell me what you need.
- Do not hide errors, weaken validation, or delete or skip tests.

OUTPUT: Root cause, the fix, files changed, test results and remaining risk.
