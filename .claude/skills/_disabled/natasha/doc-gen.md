# Skill: Document Generation

> Documentation standards.

## API Doc Template
```markdown
## POST /api/v1/users

**Auth:** Bearer token

**Body:**
```json
{ "email": "string", "name": "string" }
```

**Response:**
```json
{ "data": { "id": "uuid", "email": "string", "name": "string" } }
```

**Errors:** 400, 409, 500
```

## Changelog Template
```markdown
## [1.2.0] - YYYY-MM-DD
### Added
- Feature X
### Fixed
- Bug Y (#123)
```

## ADR Template
```markdown
# ADR-001: Choose PostgreSQL over MongoDB

## Status: Accepted
## Context: [why]
## Decision: [what]
## Consequences: [trade-offs]
```

## Word Document Generation (.docx)

> When: a big feature (spans multiple agents, or the user calls it
> "big"/"major") or an explicit "create a doc" request — never for routine
> `doc/*.md` edits. A real `.docx`, not a markdown file with a `.docx`
> extension.

### 1. Read the brand
`doc/brandpack.md` → logo file path (Logo table, Light variant — if
`[TBD]`, ship the document without a logo rather than guessing), Primary/
Secondary Color, Font Primary/Secondary, Tone.

### 2. Generate via a disposable script
Use whatever the project stack already has available — a Node script with
the `docx` npm package, or a Python script with `python-docx`, run once and
deleted after. Don't add a permanent dependency to the project just to
produce one document.

Standard document shape:
- **Page:** A4 or US Letter (match what other docs in `doc/` already use;
  default A4 if nothing else indicates a preference)
- **Header:** logo (from brandpack, if set) + document title
- **Footer:** page number + project name (from `doc/project-overview.md#name`)
- **Headings:** brand Font Primary if available, else a clean system default
  (Calibri/Arial equivalent) — never an unstyled default Word look
- **Body:** brand Font Secondary if set, else the same clean default
- **Tables:** real Word tables (`docx`'s `Table`/`python-docx`'s
  `add_table`), header row shaded with the brand's Primary Color — never a
  markdown table pasted in as plain text
- **Diagrams / flow diagrams:** render as an image and embed it — use a
  diagram tool already available in the environment (e.g. a Mermaid CLI) to
  produce a PNG/SVG from a simple flow description, then embed with
  `ImageRun`/`add_picture`. If no diagram tool is available, say so and
  fall back to a clearly-labeled step-by-step numbered list instead of
  faking a diagram with text art.

### 3. Verify it's real
Run `file <output>.docx` (or equivalent) and confirm it reports as a
Word/OOXML document (a ZIP-based container), not `ASCII text` — a script
bug that writes plain text into a `.docx`-named file is a silent failure
otherwise indistinguishable from success until someone opens it.

### 4. Clean up
Delete the disposable generation script once the `.docx` is produced and
verified. It's a build tool, not application code — don't commit it.

### 5. Log it
`memory/natasha.md` and `doc/project-overview.md#Change Log` — what was
generated, for what feature, and where it landed.
