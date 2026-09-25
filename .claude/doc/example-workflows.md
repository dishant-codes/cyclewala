# Example Workflows

> Real-world usage patterns.

## 1. Build Landing Page

**User:** "Build a landing page with hero, features, pricing, footer."

**NickFury:**
1. Parse → it's a *build* → Odin, end to end (frontend routing heuristic)
2. Skills check: modern-frontend ✓, content-research ✓, page-optimize ✓,
   frontend-essentials ✓
3. Delegate:
   - Odin: work through `skills/web-design/build-awwwards-quality-sites/`
     (umbrella) → scan `skills/web-design/INDEX.md` for one aesthetic direction
     + section recipes (§1/§3/§4/§6 — the primary section system) → research
     competitors/structure → pick the **hero component from 21st.dev /
     Aceternity / React Bits** (free tier, by fit) → pull section component
     code only for drop-in gaps → **brandpack gate** (every recipe/component
     checked against `doc/brandpack.md` first) → build hero/features/pricing/
     footer themed to the brandpack → frontend-essentials audit → Lighthouse
     Gate. Hero and 3D/shaders are never hand-built.
4. Collect → Hulk QA
5. Deliver

*Vision is not involved — this is a build, not a change.*

## 2. Add Google SSO

**User:** "Add Google login."

**NickFury:**
1. Parse → needs Odin (SSO flow + login UI) + BlackPanther (API)
2. Skills check: sso ✓, api-design ✓, modern-frontend ✓
3. Read credentials for Google OAuth
4. Delegate:
   - Odin: Design OAuth flow + build the login/auth UI
   - BlackPanther: Implement `/api/auth/google` + token validation
5. Collect → Hulk QA
6. Deliver

*(If the project already had a login screen and this were just adding one
button to it — that's a change, so Vision.)*

## 3. Full Feature (CRUD)

**User:** "Build task management (create, read, update, delete)."

**NickFury:**
1. Parse → fullstack with net-new UI → IronMan coordinates, Odin builds the UI
2. IronMan requests API contract from BlackPanther
3. BlackPanther designs schema + endpoints
4. Odin builds the UI with mock data (per `skills/_global/modern-frontend.md`)
5. BlackPanther implements real API
6. IronMan wires frontend ↔ backend (Vision for any small UI adjustments the
   wiring surfaces)
7. Hulk tests CRUD + edge cases
8. Natasha documents API
9. Groot deploys

## 4. Skill Gap → New Skill

**User:** "Integrate Stripe payments."

**NickFury:**
1. Parse → needs "payments" skill
2. Check registry → NOT FOUND
3. Ask user: "Create 'payments' skill?"
4. User: "Yes"
5. NickFury creates `skills/blackpanther/payments.md`
6. Updates registry
7. BlackPanther uses new skill

## 5. Self-Correction

**Scenario:** Odin builds login form. Hulk finds:
- Password field shows plain text
- No forgot password link
- Button doesn't disable during submit

**Hulk:** Returns bug report + logs in `memory/hulk.md`

**Odin:**
1. Fixes issues
2. Logs in `memory/odin.md`:
   ```
   [2026-08-12] MISTAKE: Login form missing password masking.
   CONTEXT: Login component.
   FIX: Always use type="password", add forgot link, disable on submit.
   VERIFIED: yes
   ```
3. Next login form → reads memory → applies fix proactively

**NickFury:** Logs in `memory/root.md`:
```
[2026-08-12] Pattern: Auth forms need checklist:
- Password masking
- Forgot password link
- Loading state on submit
- Error message display
```

## 6. Production Deploy

**User:** "Deploy latest to production."

**NickFury:**
1. Check Hulk certification exists
2. If missing → "Run QA first?"
3. If certified → delegate to Groot
4. Groot:
   - Staging deploy → smoke test
   - Production deploy (blue/green)
   - Monitor health checks
5. If issues → rollback → notify NickFury
6. Log deploy in root memory

## 7. Small UI Change (change, not build → Vision)

**User:** "The submit button on the contact form doesn't disable while
submitting, and the spacing above it is too tight."

**NickFury:**
1. Parse → *changes something that already exists* → Vision (frontend routing
   heuristic), no Odin
2. Skills check: frontend-build ✓
3. Delegate:
   - Vision: scope check (change, not a build ✓) → add the disabled/loading
     state, fix spacing to the existing scale, minimal diff, match the
     existing design language
4. Collect → Hulk QA (scoped to the contact form)
5. Deliver

*Counter-example:* "redesign the contact page" would be a build → Odin.
