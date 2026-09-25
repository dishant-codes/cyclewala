# Skill: External Tool Selection

> Generic procedure for reaching for anything outside the core stack — image
> generation, web search, live browser/Lighthouse checks, an SEO API, any
> MCP/CLI. The available toolset varies by session and by project; never
> assume it matches a prior session or another project.

## Purpose
Prevents two failure modes: assuming a tool exists because it's common
elsewhere (and hard-coding a specific provider into a plan or generated
code), and fabricating a plausible-sounding result when a tool wasn't
actually called or failed.

## Prerequisites
None — this is a decision procedure, not an integration.

## Usage — every step, in order

1. **Identify the capability needed, not a tool.** "Verify what real
   competitors say," not "call Provider X." Naming the tool before the need
   is how a task ends up using the wrong one, or inventing one that isn't
   there.
2. **Check what's actually available this session** — the current tool
   list, deferred tools via search, connected MCP servers, project CLI
   (`npm`, `php`, `git`). Don't assume based on a different project or
   session.
3. **Pick the best fit for the capability** — not the most powerful option,
   not the first one found, the one that actually matches (e.g. a project's
   own browser/preview tool for live DOM/network inspection, not a
   text-only page fetch).
4. **Use it only when it adds real value.** A tool call that doesn't change
   the plan or output is overhead, not rigor.
5. **Never assume a tool exists.** If nothing available covers the need
   (no image generator, no live Lighthouse path, no SEO API), say so
   plainly. Use the closest available substitute — documented as a
   substitute, not the real thing — or flag the gap. Never proceed as if
   it ran.
6. **Never fabricate a tool's output.** If it wasn't called, or was called
   and failed, its result doesn't exist — say that directly. No plausible
   invented number or claim in its place.
7. **Validate external results before trusting them.** A search result or
   API response can be wrong or stale — treat it as a claim to check
   against the actual codebase/requirement, not ground truth.
8. **Never send confidential project data externally without
   authorization** — source code, customer data, keys, internal
   architecture stay out of any prompt/payload sent to an external tool
   unless the user has explicitly authorized that specific exchange. A
   public search for industry statistics is fine; pasting internal secrets
   or customer data into any external tool is never fine.

## Input
A task step that would benefit from a capability outside the core
implementation stack.

## Output
Either a real tool result, used and cited as such, or an explicit,
honest statement that the capability wasn't available/wasn't run.

## Error Handling
| Situation | Response |
|---|---|
| The tool that would be ideal isn't configured for this project | Use the best available substitute, labeled as a substitute, and note the gap — don't silently downgrade the deliverable's stated quality. |
| A tool call errors | Report the error, don't retry blindly (see `security/guardrails.md#Retry & Escalation Ceiling`), don't paper over it with an invented result. |

## Security Notes
See step 8 — this is the section's core security rule, not a footnote.

## Prohibited Actions
- Hard-coding a specific external provider into generated code or a plan
  unless it's genuinely configured and approved for this project.
- Presenting a substitute's output as if it came from the ideal tool.

## Memory Hooks
- Log which tools are actually available/reliable for this project once
  discovered (e.g. "no live Lighthouse path in this sandbox — use
  production-build bundle-size checks instead") so it isn't re-diagnosed
  every session.

## Change Log
<!-- Log updates to this skill -->
