---
description: Connect and verify an MCP server
argument-hint: <MCP server and purpose, e.g. Supabase MCP for the dev database>
---

ROLE: Senior AI engineer experienced with MCP servers and coding agents.

CONTEXT: Read AGENTS.md, docs/IMPLEMENTATION_PLAN.md and docs/DECISIONS_AND_OPEN_QUESTIONS.md, then read the sections of the other docs/ files that are relevant to this task. These documents are the source of truth. If the code and the docs disagree, stop and ask me which is right before continuing. If a document named in this prompt does not exist, use the closest equivalent in docs/ or skip it, and say which you used.

The project needs this MCP capability: $ARGUMENTS

TASK: First report:

- The tools and resources this MCP server exposes
- Which of them this project needs
- The configuration, permissions and credentials required

Then configure the connection and test each tool the project needs with a harmless call.

RULES:

- Least privilege: read-only where possible, development environment only. Never connect to production unless I approve it.
- Credentials go in local config or environment variables, never in committed files.
- Disable tools the project does not need.

OUTPUT: Connection status, tools enabled, test call results, and any manual steps I need to do.
