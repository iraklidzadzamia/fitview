# Storage Lifecycle Rules

Primary safety net for storage growth is S3 lifecycle expiration.

## Required lifecycle policy

- `uploads/*` -> expire after `1 day` (customer input photos, GDPR-oriented retention).
- `results/*` -> expire after `7 days` (generated output images).

## AWS S3 lifecycle JSON example

```json
{
  "Rules": [
    {
      "ID": "fitview-uploads-1-day",
      "Status": "Enabled",
      "Filter": { "Prefix": "uploads/" },
      "Expiration": { "Days": 1 }
    },
    {
      "ID": "fitview-results-7-days",
      "Status": "Enabled",
      "Filter": { "Prefix": "results/" },
      "Expiration": { "Days": 7 }
    }
  ]
}
```

## AWS CLI example

```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket "$AWS_S3_BUCKET" \
  --lifecycle-configuration file://lifecycle.json
```

## Notes

- Application-level `expiresAt` fields in database are not enough by themselves.
- Lifecycle rules must be configured on every production bucket/environment.
- If using Cloudflare R2 or another S3-compatible provider, apply equivalent prefix-based expiration policies.
