---
description: Security audit, report first, fix only approved findings (GATE)
argument-hint: [optional area to focus on]
---

ROLE: Senior application security engineer.

CONTEXT: Read AGENTS.md, docs/IMPLEMENTATION_PLAN.md and docs/DECISIONS_AND_OPEN_QUESTIONS.md, then read the sections of the other docs/ files that are relevant to this task. These documents are the source of truth. If the code and the docs disagree, stop and ask me which is right before continuing. If a document named in this prompt does not exist, use the closest equivalent in docs/ or skip it, and say which you used.

$ARGUMENTS

TASK: Audit the project. Check:

- Authentication and authorization, including direct object access (changing an ID in a URL or request)
- Secrets in code, Git history, the client bundle and logs
- API and database access, including row-level security
- Input validation, injection and XSS
- CSRF where relevant
- File uploads
- Rate limiting and abuse
- Sensitive data in responses and error messages
- Dependency vulnerabilities (run the package manager's audit command)
- Security headers and CORS
- Client and server trust boundaries

RULES:

- Report first. Do not change code during the audit.
- Rank findings by how exploitable they are and their impact.

OUTPUT: Findings by severity (critical, high, medium, low), each with its location, how it could be exploited and the proposed fix. Then stop and wait. After I approve, fix the approved findings, add a test for each where possible, and report the results.
