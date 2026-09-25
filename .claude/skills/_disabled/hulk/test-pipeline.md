# Skill: Test Pipeline

> Testing standards.

## Test Pyramid
- Unit: 70% (Jest/Vitest)
- Integration: 20% (Supertest/Playwright API)
- E2E: 10% (Playwright/Cypress)

## Bug Report Template
```markdown
## Bug: [Title]

**Severity:** Critical/High/Medium/Low
**Agent:** [Who built it]

### Repro
1. [Step 1]
2. [Step 2]

### Expected
[What should happen]

### Actual
[What happens]

### Evidence
[Screenshot / log / trace]
```

## QA Certification
```markdown
## QA Pass: [Feature]
- [ ] Functional tests pass
- [ ] Edge cases tested
- [ ] Accessibility verified
- [ ] Performance meets budget
- [ ] Security scan clean
- [ ] Cross-browser checked

**Certified by:** Hulk
**Date:** YYYY-MM-DD
```
