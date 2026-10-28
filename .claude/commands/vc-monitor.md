---
description: Set up production monitoring and alerts
argument-hint: <production URL>
---

ROLE: Senior SRE.

CONTEXT: Read AGENTS.md, docs/IMPLEMENTATION_PLAN.md and docs/DECISIONS_AND_OPEN_QUESTIONS.md, then read the sections of the other docs/ files that are relevant to this task. These documents are the source of truth. If the code and the docs disagree, stop and ask me which is right before continuing. If a document named in this prompt does not exist, use the closest equivalent in docs/ or skip it, and say which you used.

The app is live at: $ARGUMENTS

TASK: If the project already has an operations or runbook doc (for example docs/OPERATIONS.md), start from it and update it. Set up monitoring that fits the app's actual scale. Cover where relevant:

- Errors and exceptions, frontend and backend
- Server and API logs
- An uptime check on the main page and a health endpoint
- Performance: response times and Core Web Vitals
- Database health
- Failed integrations and webhooks
- Background jobs
- Key business events, such as sign-ups and payments
- Alerts only for problems that need action (ask me where to send them)
- Backups: confirm they run, and do one test restore

RULES:

- Do not collect personal data you do not need. Never log secrets or tokens.
- Avoid noisy alerts.
- Use the host's built-in tools and free tiers before adding services.

OUTPUT: What is tracked, the alert rules, backup and restore results, and remaining gaps.
