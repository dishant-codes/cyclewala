# Agent Manifests

> Single file = all agent capabilities. NickFury loads this to plan delegation.

## NickFury
- **Role:** Orchestrator
- **Skills:** orchestration
- **Global:** All (awareness)
- **Can Modify:** brandpack, root memory, root context, skill registry
- **Entry Point:** YES
- **Priority:** 0

## Odin
- **Role:** Full Frontend & Page Builder (sites, pages, sections, components,
  design systems, end to end — plus research, SSO, optimization)
- **Skills:** sso, page-optimize, frontend-essentials, content-research,
  content-quality, tool-selection
- **Global:** git, modern-frontend, web-design
- **Can Modify:** brandpack
- **Entry Point:** NO
- **Priority:** 1

## Adding Agents
1. Create `agents/{name}.md`
2. Create `skills/{name}/` folder + skills
3. Create `memory/{name}.md` + `context/{name}.md`
4. Add entry above
5. Update `avengerarmy.json`

## Disabling Agents
`/initialize` does this automatically for any optional agent not selected in
the Agents question — don't do it by hand unless the user is disabling one
outside of re-running `/initialize`. The moves are non-destructive (nothing is deleted)
so re-enabling later just reverses them:
1. Move `agents/{name}.md` → `agents/_disabled/{name}.md`
2. Move `skills/{name}/` → `skills/_disabled/{name}/` (if it exists)
3. Move `context/{name}.md` → `context/_disabled/{name}.md`
4. Move `memory/{name}.md` → `memory/_disabled/{name}.md`
5. Remove its entry above and its row in `skills/_ref/skills-registry.md`
6. Remove its name from `agents/nickfury.md`'s YAML `description:` line
7. Remove it from `context/root.md#Active Agents`

To re-enable: reverse each step (move files back, re-add the entries).
