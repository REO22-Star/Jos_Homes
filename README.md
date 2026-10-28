# JosHomes AI Build Pack

Working title: JosHomes  
Product: A trusted, current housing-vacancy marketplace for Jos, Plateau State, Nigeria  
Primary release: Mobile-first responsive website / installable web app

## What this pack is

This folder is the source of truth for building the first version of JosHomes with an AI coding agent. It deliberately separates:

- Product requirements: what the service must do.
- Engineering rules: how the code should be produced.
- Delivery milestones: what to build first and what to postpone.
- Data model: how the core records relate.
- Acceptance tests: how to tell whether a feature is actually complete.
- Product copy: consistent user-facing words and safety messages.

Do not ask an AI to build the entire product from a single conversational description. Give it this folder, make it read the files, and let it implement one milestone at a time.

## Recommended way to use it

1. Create a new project folder, for example `jos-homes`.
2. Copy `AGENTS.md`, `START_HERE_PROMPT.txt`, and the `docs` folder into the project root.
3. Open that project folder in a coding environment whose AI agent can read workspace files.
4. Paste the text from `START_HERE_PROMPT.txt` into the agent.
5. Let the agent complete Milestone 0 only.
6. Review the running result, commit it, then request Milestone 1.
7. Require the agent to run linting, type checks, and tests after every milestone.
8. Keep product decisions in the documents, not scattered across chat history.

## About sharing a file path

A file path works only when the AI has access to the same machine, mounted drive, or open repository.

- In a local or repository-aware coding agent, a path such as `/Users/name/projects/jos-homes/docs/PRODUCT_REQUIREMENTS.md` or `C:\Users\name\projects\jos-homes\docs\PRODUCT_REQUIREMENTS.md` can work.
- In an ordinary cloud chat, sending only a local path does not grant access. Upload the file, connect the repository, or paste the relevant text.
- The safest instruction is: `Read AGENTS.md and every file in docs/ before changing code.`

## Source-of-truth order

When documents conflict, use this order:

1. `AGENTS.md`
2. `docs/PRODUCT_REQUIREMENTS.md`
3. `docs/DECISIONS_AND_OPEN_QUESTIONS.md`
4. `docs/IMPLEMENTATION_PLAN.md`
5. `docs/DATA_MODEL.md`
6. `docs/ACCEPTANCE_TESTS.md`
7. `docs/CONTENT_AND_COPY.md`
8. The current task message from the product owner

Any deliberate change to a product decision should be written into the relevant document before or alongside the code change.

## Suggested first session

Ask the agent to:

- Read the full pack.
- Summarize the product in its own words.
- List assumptions and risks.
- Propose the initial file tree.
- Implement Milestone 0 only.
- Use fictional seed listings and placeholder media.
- Stop after showing the quality-check results and next milestone.

## Important product boundary

The first version is a discovery, verification, and communication product. It does not collect rent, deposits, or agency fees. Payments, escrow, native mobile apps, sales listings, and nationwide expansion are outside the MVP.
