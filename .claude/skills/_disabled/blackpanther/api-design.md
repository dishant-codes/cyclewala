# Skill: API Design

> RESTful API standards.

## Response Envelope — every endpoint, success or failure
Default shape, language-agnostic (`ApiResponse<T>` below is this):
```json
{
  "status": 1,
  "flag": "success",
  "msg": "",
  "data": []
}
```
- **`status`** — app-level result: `1` success, `0` failure. Separate from
  the HTTP status code (below) — pair them (`status: 1` with HTTP `200`;
  `status: 0` with the matching `4xx`/`5xx`), never let them disagree.
- **`flag`** — short machine-readable outcome string (`"success"`,
  `"error"`, `"validation_error"`, ...) — not the human message.
- **`msg`** — human-readable message. Empty string on plain success; a
  clear, specific explanation on failure — never a stack trace or raw
  exception text (see `security/guardrails.md`).
- **`data`** — the payload. `[]`/`{}` (not `null`) when there's nothing to
  return, so clients don't need a null-check on top of an empty-check.

**Before applying this:** check whether the project already has an
established response shape in its existing controllers/handlers. If it
does, follow that one — this is the default for a new project or a
project with no existing convention, not a mandate to reshape working
endpoints. Whichever shape is used, note it in `doc/project-overview.md`
so it isn't rediscovered every session.

```php
// PHP / Laravel
$response = [
    'status' => 1,
    'flag'   => 'success',
    'msg'    => '',
    'data'   => [],
];
return response()->json($response);
```
```javascript
// Node / Express — same shape, any language
res.json({ status: 1, flag: 'success', msg: '', data: {} });
```

## Endpoint Template

```typescript
// GET /api/v1/users/:id
// Response: ApiResponse<User>  (envelope above, data = User)

// Error Codes (HTTP status — transport level, alongside the envelope above)
// 400 - Bad Request (validation)
// 401 - Unauthorized
// 403 - Forbidden
// 404 - Not Found
// 409 - Conflict (duplicate)
// 422 - Unprocessable (business logic)
// 500 - Internal Error

// Always return JSON, even for errors — with the same envelope, status: 0
```

## Security Checklist
- [ ] Input validation (Zod/Joi)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] Rate limiting (per IP + per user)
- [ ] CORS whitelist
- [ ] Auth middleware on protected routes
- [ ] No sensitive data in URL params
