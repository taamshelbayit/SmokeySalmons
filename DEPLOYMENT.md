# Smokey Salmons - Deployment Guide

## Production Deployment Checklist

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or SQLite for simple deployments)
- Email service (Resend API key recommended)
- Domain name and SSL certificate

### Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/smokey_salmons"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="https://yourdomain.com"

# Branding
BRAND_NAME="Smokey Salmons"
BRAND_SLOGAN="Fresh smoked salmon delivered weekly"

# Email Configuration
EMAIL_FROM="orders@yourdomain.com"
RESEND_API_KEY="re_your_resend_api_key"

# Admin Bootstrap
ADMIN_EMAIL="admin@yourdomain.com"

# Order Management
ORDER_CUTOFF_CRON="0 18 * * 2"  # Tuesday 6 PM
TIMEZONE="Asia/Jerusalem"
```

### Database Setup

1. **Create Production Database**
   ```bash
   # PostgreSQL
   createdb smokey_salmons_prod
   ```

2. **Run Migrations**
   ```bash
   npm run prisma:migrate
   ```

3. **Seed Initial Data**
   ```bash
   npm run db:seed
   ```

### Build and Deploy

1. **Install Dependencies**
   ```bash
   npm ci --production=false
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

### Platform-Specific Deployment

#### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Netlify
1. Build command: `npm run build`
2. Publish directory: `.next`
3. Set environment variables in Netlify dashboard

#### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Post-Deployment Setup

1. **Verify Health Check**
   ```bash
   curl https://yourdomain.com/api/health
   ```

2. **Test Admin Access**
   - Visit `/signin`
   - Enter admin email
   - Check email for magic link
   - Access `/admin` dashboard

3. **Configure Email Templates**
   - Test order confirmation emails
   - Verify admin notification emails

4. **Set Up Monitoring**
   - Configure error tracking (Sentry recommended)
   - Set up uptime monitoring
   - Monitor database performance

### Security Considerations

- [ ] Enable HTTPS/SSL
- [ ] Set secure NEXTAUTH_SECRET (32+ characters)
- [ ] Configure CORS if needed
- [ ] Set up rate limiting
- [ ] Regular database backups
- [ ] Monitor for suspicious activity

### Maintenance Tasks

#### Weekly
- [ ] Review order analytics
- [ ] Check email delivery rates
- [ ] Monitor error logs

#### Monthly
- [ ] Database backup verification
- [ ] Security updates
- [ ] Performance optimization review

### Troubleshooting

#### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check database server status
   - Ensure migrations are applied

2. **Email Not Sending**
   - Verify RESEND_API_KEY
   - Check EMAIL_FROM domain verification
   - Review email service logs

3. **Admin Access Issues**
   - Confirm ADMIN_EMAIL is seeded
   - Check NextAuth configuration
   - Verify magic link email delivery

#### Performance Optimization

1. **Database Indexing**
   ```sql
   CREATE INDEX idx_orders_placed_at ON "Order"("placedAt");
   CREATE INDEX idx_orders_status ON "Order"("status");
   ```

2. **Caching Strategy**
   - Enable Next.js static generation where possible
   - Consider Redis for session storage
   - Implement CDN for static assets

### Backup Strategy

1. **Database Backups**
   ```bash
   # Daily automated backup
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

2. **File Backups**
   - Environment configuration
   - Custom uploads (if any)
   - SSL certificates

### Monitoring and Alerts

Set up alerts for:
- Application errors (500+ status codes)
- Database connection failures
- High response times (>2s)
- Failed email deliveries
- Unusual order patterns

### Support Contacts

- **Technical Issues**: tech@yourdomain.com
- **Business Questions**: support@yourdomain.com
- **Emergency Contact**: +1-XXX-XXX-XXXX

---

## Development vs Production Differences

| Feature | Development | Production |
|---------|-------------|------------|
| Database | SQLite | PostgreSQL |
| Email | Console logs | Resend API |
| Auth | Local magic links | Production URLs |
| Analytics | Console logs | External service |
| Error Handling | Detailed errors | User-friendly messages |

## Scaling Considerations

As your business grows, consider:

1. **Database Scaling**
   - Read replicas for analytics
   - Connection pooling
   - Query optimization

2. **Application Scaling**
   - Horizontal scaling with load balancer
   - Microservices architecture
   - API rate limiting

3. **Feature Enhancements**
   - Payment processing integration
   - Inventory management
   - Customer loyalty program
   - Mobile app development
