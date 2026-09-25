# Skill: Jira

> Issue tracking integration.

## API Pattern

```bash
curl -X POST   -H "Authorization: Basic $(echo -n email:api_token | base64)"   -H "Content-Type: application/json"   -d '{"fields":{"project":{"key":"PROJ"},"summary":"Title","issuetype":{"name":"Task"}}}'   https://[domain].atlassian.net/rest/api/3/issue
```

## Conventions
- Ticket `PROJ-123` → branch `feature/PROJ-123-description`
- Commit: `[PROJ-123] feat: add login`
- Link PR to ticket

## Credentials
- JIRA_API_KEY
- JIRA_DOMAIN
- JIRA_EMAIL

## Memory Hooks
- Log workflow preferences
- Log automation rules
