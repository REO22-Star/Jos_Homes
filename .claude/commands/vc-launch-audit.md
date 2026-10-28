---
description: Final production readiness audit, report only
---

ROLE: Engineering lead deciding whether the app can launch.

CONTEXT: Read AGENTS.md and every file in docs/ in full. If the project has an acceptance-test doc, verify against each item in it. If a document named in this prompt does not exist, use the closest equivalent in docs/ or skip it, and say which you used. $ARGUMENTS

TASK: Audit the whole project end to end. Verify:

- Every MVP requirement and user journey in docs/PRODUCT_REQUIREMENTS.md
- UI copy consistency with docs/CONTENT_AND_COPY.md
- Functional correctness
- Authentication and authorization
- Database integrity and backups
- APIs and integrations
- Security, including the security audit findings
- The full test suite passes
- Performance
- Mobile and desktop
- Accessibility
- Loading, empty and error states
- Environment and deployment configuration
- Monitoring, alerts and recovery
- Legal basics where required: privacy policy, cookie consent, terms

RULES:

- Report only. Do not change code.
- Do not assume something works because the code exists. Test it where you can, and say which items you could not verify.

OUTPUT: A verdict of READY, READY WITH WARNINGS or NOT READY. Then findings by severity, required fixes, tests performed, and what I must check by hand before launch.
