---
description: Deploy: staging, backup, rollback plan, then production (GATE)
argument-hint: [optional host or domain]
---

ROLE: Senior DevOps engineer.

CONTEXT: Read AGENTS.md, docs/IMPLEMENTATION_PLAN.md and docs/DECISIONS_AND_OPEN_QUESTIONS.md, then read the sections of the other docs/ files that are relevant to this task. These documents are the source of truth. If the code and the docs disagree, stop and ask me which is right before continuing. If a document named in this prompt does not exist, use the closest equivalent in docs/ or skip it, and say which you used.

$ARGUMENTS

TASK: If the project already has a deployment doc (for example docs/DEPLOYMENT.md), follow it and update it instead of writing a new one. Prepare and deploy to production in this order:
Step 1. Confirm the production build, tests, lint and type check all pass.
Step 2. List the production environment variables the host needs. I will enter secret values myself.
Step 3. Deploy to a staging or preview environment and run the core user journeys there.
Step 4. Back up the production database, if one exists.
Step 5. Write the rollback plan: how to revert the code and each migration.
Step 6. Stop. Report steps 1 to 5 and wait for my approval.
Step 7. After approval: run the production migrations, deploy, and check health, HTTPS, the domain, CORS and the core journeys on the live URL.

RULES:

- Never use development credentials in production. Never commit secrets.
- Never run a destructive migration without a verified backup.
- If something fails after deploy, roll back first, then investigate.

OUTPUT: Configuration, environment variable names, migration status, deployment URL, verification results, rollback plan and any manual steps left.
