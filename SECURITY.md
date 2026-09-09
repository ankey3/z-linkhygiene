# Security

## Authentication
Not required — this is a public tool.

## Rate Limiting
15 requests per minute per IP, enforced via middleware.

## Content Security Policy (CSP)
Configured in middleware.

## Data Storage
SQLite database — not persisted across deployments.

## Input Validation
- URL validation on all user-provided URLs
- Private IP address blocking (e.g., `127.0.0.1`, `10.x.x.x`, `192.168.x.x`)
- Request body size limits enforced at the framework level

## Security Headers
| Header | Value |
|---|---|
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload` |
| X-Frame-Options | `DENY` |
| X-Content-Type-Options | `nosniff` |
| Content-Security-Policy | Configured via middleware |
| X-Powered-By | Removed |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | Camera, microphone, geolocation, interest-cohort disabled |