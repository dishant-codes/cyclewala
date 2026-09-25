# Skill: SSO

> Single Sign-On implementation.

## OAuth 2.0 + OIDC Flow

```
1. User clicks "Login with [Provider]"
2. Redirect to provider auth URL (state param included)
3. Provider redirects back with code
4. Exchange code for tokens (backend — BlackPanther)
5. Validate ID token signature
6. Create/update user in DB
7. Issue session/JWT to client
8. Redirect to app
```

## Providers
- Google, GitHub, Microsoft, Auth0

## Security
- PKCE for SPA flows
- State param for CSRF prevention
- Short-lived auth codes (10 min max)
- Refresh token rotation

## Handoff
- You design the flow
- BlackPanther implements token validation + session
- You build the login/auth UI (per `skills/_global/modern-frontend.md`) —
  Vision only if it's a tweak to a login screen that already exists
