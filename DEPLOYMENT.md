# Wedflow Production Deployment Guide

This guide covers the complete production deployment process for Wedflow, including performance optimization, security measures, and monitoring setup.

## Prerequisites

- Node.js 18+ and npm
- Vercel CLI installed (`npm i -g vercel`)
- Access to all required external services (Supabase, Google APIs, Twilio, Sanity)

## Environment Variables

### Required Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Drive API
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key
NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=your_google_drive_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_drive_client_secret

# Twilio API
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token

# Security
WEBHOOK_SECRET=your_webhook_secret_key_for_signature_verification
```

### Optional Variables (Recommended for Production)

```bash
# Error Tracking and Monitoring
ERROR_TRACKING_ENDPOINT=https://your-error-tracking-service.com/api/errors
ERROR_TRACKING_TOKEN=your_error_tracking_token

# Alert Webhooks
CRITICAL_ERROR_WEBHOOK=https://hooks.slack.com/services/your/critical/webhook
SECURITY_ALERT_WEBHOOK=https://hooks.slack.com/services/your/security/webhook

# External Integrations
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/wedflow

# Performance Monitoring
NEXT_PUBLIC_CDN_URL=https://your-cdn-domain.com
```

## Deployment Process

### 1. Pre-deployment Checks

```bash
# Install dependencies
npm install

# Run security audit
npm run security:audit

# Run tests (if available)
npm test

# Build and analyze bundle
npm run analyze
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Configure all required environment variables
# Edit .env.local with your production values
```

### 3. Database Setup

Ensure your Supabase database has the following tables with Row Level Security (RLS) enabled:

```sql
-- Enable RLS on all tables
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;

-- Create backup logs table for monitoring
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  size BIGINT NOT NULL,
  tables TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  backup_type VARCHAR(20) DEFAULT 'full',
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create critical errors table for monitoring
CREATE TABLE IF NOT EXISTS critical_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  stack TEXT,
  level VARCHAR(20) NOT NULL,
  context JSONB NOT NULL,
  fingerprint VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Security Configuration

The application includes comprehensive security measures:

- **Content Security Policy (CSP)**: Prevents XSS attacks
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options
- **Input Validation**: Zod schemas for all user inputs
- **Rate Limiting**: API endpoint protection
- **SQL Injection Prevention**: Input sanitization
- **File Upload Validation**: Type and size restrictions

### 5. Performance Optimizations

- **Image Optimization**: WebP/AVIF formats, responsive images
- **Caching**: Sanity content and Google Drive API responses
- **Bundle Analysis**: Webpack bundle analyzer for optimization
- **CDN Integration**: Static asset optimization

### 6. Deploy to Vercel

```bash
# Using the deployment script
npm run deploy:prod

# Or manually
vercel --prod
```

### 7. Post-deployment Verification

```bash
# Check deployment health
curl -I https://your-domain.com

# Verify security headers
curl -I https://your-domain.com | grep -E "(Content-Security-Policy|Strict-Transport-Security)"

# Test API endpoints
curl https://your-domain.com/api/health
```

## Monitoring and Maintenance

### Performance Monitoring

The application includes built-in performance monitoring:

- Page load times
- API response times
- Image loading performance
- Cache hit rates

Access the monitoring dashboard at `/dashboard/monitoring` (admin only).

### Error Tracking

Critical errors are automatically:

- Logged to the database
- Sent to configured webhook endpoints
- Tracked with fingerprinting for deduplication

### Security Monitoring

- CSP violation reporting
- Failed authentication attempts
- Suspicious request patterns
- Rate limit violations

### Backup Strategy

```bash
# Manual full backup
npm run backup

# Manual incremental backup
npm run backup:incremental
```

Set up automated backups using cron jobs or Vercel cron functions:

```javascript
// api/cron/backup.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const {
      runScheduledBackup,
    } = require("../../src/lib/backup/database-backup");
    await runScheduledBackup("incremental");
    res.status(200).json({ success: true });
  }
}
```

## Scaling Considerations

### Database Scaling

- Monitor connection pool usage
- Consider read replicas for heavy read workloads
- Implement database connection pooling

### CDN and Caching

- Configure Vercel Edge Network
- Implement Redis for session storage (if needed)
- Use Vercel's built-in caching for static assets

### API Rate Limiting

Current rate limits:

- General API: 100 requests per 15 minutes per IP
- Monitoring endpoints: 50-200 requests per minute
- File uploads: 10 requests per minute per user

Adjust based on usage patterns.

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify all dependencies are installed
   - Review build logs for specific errors

2. **Performance Issues**
   - Monitor bundle size with `npm run analyze`
   - Check image optimization settings
   - Review database query performance

3. **Security Alerts**
   - Check CSP violation reports
   - Review failed authentication logs
   - Monitor rate limit violations

### Health Checks

```bash
# Application health
curl https://your-domain.com/api/health

# Database connectivity
curl https://your-domain.com/api/health/database

# External services
curl https://your-domain.com/api/health/services
```

## Security Best Practices

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Run `npm audit` regularly

2. **Access Control**
   - Use strong authentication
   - Implement proper authorization
   - Regular access reviews

3. **Data Protection**
   - Enable database encryption
   - Use HTTPS everywhere
   - Implement proper backup encryption

4. **Monitoring**
   - Set up alerting for critical errors
   - Monitor unusual access patterns
   - Regular security audits

## Support and Maintenance

### Regular Tasks

- Weekly: Review monitoring dashboard
- Monthly: Security audit and dependency updates
- Quarterly: Performance optimization review
- Annually: Comprehensive security assessment

### Emergency Procedures

1. **Critical Error Response**
   - Check monitoring dashboard
   - Review error logs
   - Implement hotfix if needed
   - Post-incident review

2. **Security Incident Response**
   - Isolate affected systems
   - Assess impact
   - Implement fixes
   - Notify stakeholders

3. **Performance Degradation**
   - Check monitoring metrics
   - Identify bottlenecks
   - Scale resources if needed
   - Optimize code/queries

For additional support, refer to the API documentation and monitoring dashboards.
