# Skill: Orchestration

> NickFury's delegation and coordination playbook.

## Delegation Matrix

| Request | Primary | Secondary | Skills |
|---------|---------|-----------|--------|
| Create/build/redesign a site, page, section, landing page | Odin | — | modern-frontend, web-design (`build-awwwards-quality-sites` umbrella + recipes = primary section system), content-research, page-optimize, frontend-essentials |
| Design system / component library / net-new UI component | Odin | — | modern-frontend |
| Small frontend change / UI bug / tweak / wire-up / one component into an existing system | Vision | — | frontend-build |
| API endpoint | BlackPanther | — | api-design |
| Full feature (net-new UI) | IronMan | Odin + BlackPanther | fullstack-integration, modern-frontend |
| Full feature (wiring existing UI) | IronMan | Vision + BlackPanther | fullstack-integration |
| SSO/auth | Odin | BlackPanther | sso, api-design |
| Immersive 3D / scroll-cinematic / shader hero | Odin | — | modern-frontend, web-design (sourced components + recipes only — never hand-authored, shaders included) |
| Documentation | Natasha | — | doc-gen |
| Testing | Hulk | — | test-pipeline |
| Deploy | Groot | Hulk | deploy-pipeline |
| Performance | Odin | — | page-optimize |
| DB schema | BlackPanther | Natasha | api-design, doc-gen |

**Frontend routing heuristic:** *builds or redesigns* UI → **Odin**;
*changes something that already exists* → **Vision**. Ambiguous → Odin.

## Skill Gap Detection Protocol
1. Parse request → extract capabilities
2. Read `skills/_ref/skills-registry.md`
3. For each capability:
   - Found → proceed
   - Missing → ask user: "Skill '[X]' needed. Create it?"
   - User YES → generate from `skills/_ref/skill-template.md` → save → update registry → log
   - User NO → delegate with limitation note

## Credential Injection Protocol
1. Read `credentials/credentials.md`
2. Extract relevant keys
3. Inject into agent context (names logged, values hidden)
4. Log: `context/root.md` → `Credentials injected for [skill]`
