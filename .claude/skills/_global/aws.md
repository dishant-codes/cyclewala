# Skill: AWS

> Cloud infrastructure.

## Common Commands

```bash
# S3 deploy
aws s3 sync ./dist s3://bucket-name --delete

# ECS deploy
aws ecs update-service --cluster prod --service api --force-new-deployment

# CloudWatch logs
aws logs tail /ecs/service-name --follow
```

## Service Mapping
- Groot: ECS, Lambda, S3, CloudFront, Route53
- BlackPanther: RDS, DynamoDB, ElastiCache
- Odin: S3 (build assets), CloudFront (CDN) — frontend delivery/optimization

## Credentials
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION

## Security
- Rotate keys every 90 days
- Use IAM roles over keys where possible
- Never log credentials

## Memory Hooks
- Log service choices + cost rationale
- Log deploy failure patterns
