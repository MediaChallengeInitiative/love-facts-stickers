# Love Facts — Media Literacy Stickers Portal

A production-ready sticker download portal for the "Love Facts — Media Literacy" sticker pack. Built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## Overview

The Love Facts Sticker Portal is a web application designed to distribute free media literacy stickers to the public. Users can browse, preview, and download stickers that help fight misinformation. The application includes user contact collection for impact measurement, an admin dashboard for analytics, and full privacy compliance features.

---

## Features

### User-Facing Features
- **Sticker Gallery**: Browse stickers by collection with real-time search and filtering
- **Collection View**: Organized sticker collections with preview carousels
- **Preview Modal**: High-resolution sticker preview with metadata, tags, and suggested captions
- **Download Options**: Download individual stickers (PNG) or entire collections (ZIP)
- **Social Sharing**: Share stickers via WhatsApp, Twitter/X, Facebook, Instagram, or copy link
- **QR Code Generation**: Generate and download QR codes for easy mobile sharing
- **Anonymous Downloads**: Option to download without providing contact information
- **Dark/Light Mode**: Full theme support with system preference detection

### Admin Features
- **Dashboard Metrics**: Total downloads, unique users, collection stats
- **Download Analytics**: Charts showing downloads over time
- **User Data Management**: Searchable download logs with CSV export
- **Collection Management**: View and manage sticker collections

### Privacy & Compliance
- **GDPR-Compliant**: Clear data purpose disclosure
- **Unsubscribe Portal**: Users can request data deletion at `/unsubscribe`
- **Anonymous Option**: Downloads available without contact info
- **Data Retention**: 12-month maximum retention policy

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.33 | React framework with App Router, SSR/SSG |
| **React** | 18.x | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 3.4.1 | Utility-first CSS framework |
| **Framer Motion** | 12.23.24 | Animations and transitions |
| **Lucide React** | 0.555.0 | Icon library |
| **next-themes** | 0.4.6 | Dark/Light mode support |
| **react-hot-toast** | 2.6.0 | Toast notifications |
| **qrcode.react** | 4.2.0 | QR code generation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 14.x | Serverless API endpoints |
| **Prisma ORM** | 6.19.0 | Database toolkit and ORM |
| **NextAuth.js** | 4.24.13 | Authentication |
| **Zod** | 4.1.13 | Schema validation |
| **bcryptjs** | 3.0.3 | Password hashing |

### Database & Storage
| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Primary database |
| **AWS S3** | Sticker file storage (production) |
| **Google Drive API** | Source sticker sync |

### Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **PostCSS** | CSS processing |
| **TypeScript** | Type checking |

---

## Project Architecture

```
love-facts-stickers/
├── prisma/
│   └── schema.prisma          # Database schema definition
├── public/
│   ├── stickers/              # Local sticker files (development)
│   └── favicon.ico            # Site favicon
├── scripts/
│   ├── seed.ts                # Database seeding script
│   └── sync-drive.ts          # Google Drive to S3 sync
├── src/
│   ├── app/
│   │   ├── api/               # API route handlers
│   │   │   ├── collections/   # Collection endpoints
│   │   │   ├── stickers/      # Sticker endpoints
│   │   │   ├── download-request/  # Download tracking
│   │   │   ├── admin/         # Admin API endpoints
│   │   │   └── unsubscribe/   # Data deletion
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── privacy/           # Privacy policy page
│   │   ├── unsubscribe/       # Data deletion request page
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── admin/             # Admin-specific components
│   │   ├── layout/            # Header, Footer, Hero
│   │   ├── modals/            # Preview, Download, Success modals
│   │   ├── stickers/          # Gallery, Card, Filter components
│   │   └── ui/                # Base UI components (Button, Input, etc.)
│   └── lib/
│       ├── db.ts              # Prisma client singleton
│       ├── s3.ts              # AWS S3 utilities
│       ├── types.ts           # TypeScript type definitions
│       ├── utils.ts           # Helper functions
│       └── validation.ts      # Zod validation schemas
├── .env.example               # Environment template
├── tailwind.config.ts         # Tailwind configuration
├── next.config.mjs            # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

---

## Database Schema

### Collections
- `id`: Unique identifier (UUID)
- `name`: Collection name
- `slug`: URL-friendly identifier
- `description`: Collection description
- `coverImage`: Cover image URL
- `createdAt`, `updatedAt`: Timestamps

### Stickers
- `id`: Unique identifier (UUID)
- `title`: Sticker title
- `caption`: Suggested caption for sharing
- `tags`: Array of searchable tags
- `thumbnailUrl`: Thumbnail image URL
- `sourceUrl`: Full-resolution image URL
- `collectionId`: Foreign key to collection
- `downloadCount`: Download counter
- `createdAt`, `updatedAt`: Timestamps

### DownloadRequests
- `id`: Unique identifier
- `email`: User email (optional)
- `phone`: User phone (optional)
- `name`: User name (optional)
- `isAnonymous`: Boolean flag
- `stickerId`: Downloaded sticker
- `downloadType`: 'single' or 'collection'
- `createdAt`: Timestamp

### UnsubscribeRequests
- `id`: Unique identifier
- `email`/`phone`: Contact to delete
- `reason`: Optional deletion reason
- `status`: pending/processed
- `createdAt`, `processedAt`: Timestamps

---

## API Reference

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/collections` | GET | List all collections with sticker counts |
| `/api/stickers` | GET | List stickers with optional filters |
| `/api/stickers/[id]` | GET | Get single sticker details |
| `/api/download-request` | POST | Log download and collect contact |
| `/api/unsubscribe` | POST | Submit data deletion request |

### Admin Endpoints (Protected)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/metrics` | GET | Dashboard statistics |
| `/api/admin/downloads` | GET | Download logs (supports CSV export) |
| `/api/admin/collections` | GET/POST | Manage collections |

---

## Configuration

### Environment Variables

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/love_facts_stickers"

# Authentication (Required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# AWS S3 Storage (Production)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="love-facts-stickers"
S3_BUCKET_URL="https://love-facts-stickers.s3.amazonaws.com"

# Google Drive Sync (Optional)
GOOGLE_SERVICE_ACCOUNT_KEY_FILE="path/to/service-account.json"
GOOGLE_DRIVE_FOLDER_ID="your-folder-id"

# Admin Credentials
ADMIN_EMAIL="admin@mciug.org"
ADMIN_PASSWORD="secure-password"
```

---

## Deployment

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy automatically

### Option 2: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Option 3: Traditional Server

```bash
# Install dependencies
npm ci --only=production

# Generate Prisma client
npx prisma generate

# Build application
npm run build

# Start production server
npm start
```

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Database operations
npx prisma generate      # Generate client
npx prisma db push       # Push schema changes
npx prisma studio        # Open database GUI

# Seed database
npx ts-node scripts/seed.ts

# Sync from Google Drive
npx ts-node scripts/sync-drive.ts
```

---

## Responsive Design

The application is fully responsive with the following breakpoints:

| Breakpoint | Min Width | Target Devices |
|------------|-----------|----------------|
| `xs` | 475px | Large phones |
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Mobile Features
- Off-canvas navigation menu with smooth animations
- Touch-friendly sticker cards with tap feedback
- Horizontally scrollable filter chips
- Bottom sheet modals on small screens
- Compact typography and spacing

---

## Theme Support

The application supports three theme modes:
- **Light Mode**: Default bright theme
- **Dark Mode**: Eye-friendly dark theme
- **System**: Automatically matches OS preference

Theme toggle is available in the header navigation.

---

## Security Features

- CSRF protection via NextAuth
- Password hashing with bcrypt
- Environment variable secrets
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS protection through React

---

## Performance Optimizations

- Image lazy loading
- Component code splitting
- Static page generation where possible
- Optimized animations with Framer Motion
- Efficient database queries with Prisma

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome for Android)

---

## Support & Contact

**Media Challenge Initiative**
- Email: info@mciug.org
- Alternative: challengemediaug2014@gmail.com
- Website: https://mciug.org

---

## License

MIT License - Media Challenge Initiative

Copyright (c) 2024 Media Challenge Initiative

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.
