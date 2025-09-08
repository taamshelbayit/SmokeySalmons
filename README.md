# Smokey Salmons

A Next.js ecommerce application for weekly smoked salmon delivery orders with admin management, promotions, and comprehensive order tracking.

## Features

### Customer Features
- Product catalog with flavor selection and quantity
- Shopping cart with promotion code support
- Real-time order cutoff notifications
- Email order confirmations
- Order status tracking
- Responsive design with accessibility features

### Admin Features
- Secure authentication with email magic links
- Order management dashboard with status updates
- Promotion code creation and management
- CSV export for order data
- Real-time analytics tracking
- Customer and delivery detail management

### Technical Features
- Email notifications (customer + admin alerts)
- Analytics event tracking (add-to-cart, orders)
- Automated E2E testing with Cypress
- Production-ready deployment configuration
- Health check endpoints for monitoring

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Prisma with SQLite (dev) / PostgreSQL (prod)
- **Authentication**: NextAuth.js with PrismaAdapter and email magic links
- **Styling**: Tailwind CSS with responsive design
- **Email**: Resend API with nodemailer fallback
- **Testing**: Cypress E2E with CI/CD integration
- **Analytics**: Custom lightweight event tracking
- **Deployment**: Vercel/Netlify ready with Docker support

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize database**
   ```bash
   npm run prisma:migrate
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - **Customer site**: http://localhost:3000
   - **Admin dashboard**: http://localhost:3000/admin (requires sign-in)
   - **Sign-in**: http://localhost:3000/signin (magic link via email/console)

## Scripts

### Development
- `npm run dev` - Start development server
- `npm run prisma:studio` - Open Prisma database browser
- `npm run prisma:generate` - Generate Prisma client

### Database
- `npm run prisma:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data

### Testing
- `npm run e2e:open` - Open Cypress test runner (interactive)
- `npm run e2e:run` - Run E2E tests headlessly (CI)
- Slide-over cart with checkout form, disabled after cutoff
- API: price cart, place order, get order detail
- Emails: order confirmation (Resend if available; dev console fallback)
- Order confirmation page `/order/[id]`
- Content pages: About, How We Make It, Loyalty, Contact, Terms, Privacy

## Roadmap (admin/auth)

- NextAuth email magic link, admin role, protect `/admin/*`
- Admin dashboard: This Week, production plan (fish allocation), CSV exports
- CRUD: products, flavors, promos, settings
- Loyalty points accrual and redemption
- Analytics event hooks (add_to_cart, order_placed) with GA handoff

## Deploy

Use any Node 18+ host. Provide `DATABASE_URL` for Postgres in production and run migrations:

```bash
pnpm prisma migrate deploy
```

## Cypress tests (later)

Basic E2E: add to cart → checkout → sees confirmation; admin sees orders.

---

Built with ❤️ to get delicious, Shabbat-ready salmon to your table, calmly and reliably.