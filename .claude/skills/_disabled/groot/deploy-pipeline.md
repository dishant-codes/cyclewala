# Skill: Deploy Pipeline

> CI/CD and infrastructure.

## Pipeline Stages

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test
      - run: npm run lint
  build:
    needs: test
    steps:
      - run: npm run build
      - run: docker build -t app:$GITHUB_SHA .
  deploy:
    needs: build
    steps:
      - run: docker push app:$GITHUB_SHA
      - run: aws ecs update-service --cluster prod --service app --force-new-deployment
```

## Rollback
```bash
aws ecs update-service --cluster prod --service app --task-definition app:PREV_REVISION
```

## Monitoring
- Health check: `GET /health` → `{"status":"ok","version":"x.x.x"}`
- Alert on: 5xx > 1%, p99 latency > 2s, error log spike
