# Skill: Fullstack Integration

> Bridge frontend and backend.

## API Contract Template

```typescript
// types/shared.ts
interface User {
  id: string;
  email: string;
  name: string;
}

interface ApiResponse<T> {
  data: T;
  meta?: { page: number; total: number };
  error?: { code: string; message: string };
}
```

## Integration Checklist
- [ ] API contract agreed with BlackPanther
- [ ] Types shared frontend ↔ backend
- [ ] Error handling consistent (same codes)
- [ ] Loading states in UI
- [ ] Auth token attached
- [ ] CORS configured
- [ ] Rate limiting respected
