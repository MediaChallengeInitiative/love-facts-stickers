# Love Facts — Media Literacy Stickers Portal

A production-ready sticker download portal for the "Love Facts — Media Literacy" sticker pack. Built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and Framer Motion.

**Live Site:** [https://stickers.lovefacts.africa](https://stickers.lovefacts.africa)

## Overview

The Love Facts Sticker Portal is a web application designed to distribute free media literacy stickers to the public. Users can browse, preview, and download stickers that help fight misinformation. The application includes user contact collection for impact measurement, an admin dashboard for analytics, and full privacy compliance features.

---

## Features

### User-Facing Features
- **3D Stacked Collection Cards**: Modern card-based layout with stacked sticker previews and hover animations
- **Sticker Gallery**: Browse stickers by collection with real-time search and filtering
- **Collection View**: Organized sticker collections with visual card stacking effects
- **Preview Modal**: Accessible modal with high-resolution sticker preview, ESC to close, focus trap
- **Download Options**: Download individual stickers (PNG) or entire collections
- **Social Sharing**: Share stickers via WhatsApp, Twitter/X, Facebook, or copy link
- **QR Code Generation**: Generate and download QR codes for easy mobile sharing
- **Anonymous Downloads**: Option to download without providing contact information
- **Dark/Light Mode**: Full theme support with system preference detection
- **Fully Responsive**: Optimized for all devices from mobile to desktop

### Collection Card Features
- **Stacked Card Effect**: Up to 4 stickers displayed with rotation, offset, and scale for depth
- **Hover Animations**: Cards lift and rotate on hover with smooth spring physics
- **Quick Actions**: View and Download buttons appear on hover (desktop)
- **Always-Visible Buttons**: Preview and Get buttons in card footer (mobile-friendly)
- **Browse All Link**: Quick navigation to filter gallery by collection

### Admin Features
- **Dashboard Metrics**: Total downloads, unique users, collection stats
- **Download Analytics**: Charts showing downloads over time
- **User Data Management**: Searchable download logs with CSV export
- **Collection Management**: View and manage sticker collections
- **Google Drive Sync**: Sync stickers directly from Google Drive folders

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
| **Prisma Postgres** | - | Managed PostgreSQL on Vercel |
| **Zod** | 4.1.13 | Schema validation |
| **Google APIs** | 146.0.0 | Google Drive integration |

### Database & Storage
| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Primary database (Prisma Postgres) |
| **Google Drive API** | Source sticker sync |

---

## Project Architecture

```
love-facts-stickers/
├── prisma/
│   └── schema.prisma          # Database schema definition
├── public/
│   └── favicon.ico            # Site favicon
├── scripts/
│   └── sync-drive.ts          # Google Drive sync script
├── src/
│   ├── app/
│   │   ├── api/               # API route handlers
│   │   │   ├── collections/   # Collection endpoints
│   │   │   ├── stickers/      # Sticker endpoints
│   │   │   ├── download-request/  # Download tracking
│   │   │   ├── sync/drive/    # Google Drive sync endpoint
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
│   │   ├── StickerCollections/ # Stacked gallery components
│   │   │   ├── StackedGallery.tsx  # Main collection grid
│   │   │   ├── StickerModal.tsx    # Accessible preview modal
│   │   │   └── index.ts            # Exports
│   │   └── ui/                # Base UI components (Button, Input, etc.)
│   └── lib/
│       ├── db.ts              # Prisma client singleton
│       ├── types.ts           # TypeScript type definitions
│       ├── utils.ts           # Helper functions (cn, etc.)
│       └── validation.ts      # Zod validation schemas
├── .env.example               # Environment template
├── tailwind.config.ts         # Tailwind configuration
├── next.config.mjs            # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

---

## Component Documentation

### StackedGallery Component

The main collection display component featuring 3D stacked card effects.

**Location:** `src/components/StickerCollections/StackedGallery.tsx`

**Props:**
```typescript
interface StackedGalleryProps {
  stickers: GallerySticker[]           // All stickers to display
  collections?: CollectionInfo[]        // Collection metadata
  onView?: (id: string) => void        // View tracking callback
  onDownload?: (id: string) => void    // Download tracking callback
  onCollectionClick?: (id: string) => void  // Collection filter callback
  className?: string                    // Additional CSS classes
}

interface GallerySticker {
  id: string
  title: string
  imageUrl: string
  collectionId?: string
  collectionName?: string
}

interface CollectionInfo {
  id: string
  name: string
  count: number
}
```

**Usage:**
```tsx
import { StackedGallery } from '@/components/StickerCollections'

<StackedGallery
  stickers={stickers.map(s => ({
    id: s.id,
    title: s.title,
    imageUrl: s.thumbnailUrl,
    collectionId: s.collectionId,
    collectionName: s.collection?.name,
  }))}
  collections={collections.map(c => ({
    id: c.id,
    name: c.name,
    count: c._count?.stickers || 0,
  }))}
  onView={(id) => trackView(id)}
  onDownload={(id) => trackDownload(id)}
  onCollectionClick={(id) => filterByCollection(id)}
/>
```

### StickerModal Component

Accessible preview modal with focus trap and keyboard navigation.

**Location:** `src/components/StickerCollections/StickerModal.tsx`

**Features:**
- Focus trap within modal
- ESC key closes modal
- Returns focus to trigger element on close
- Accessible: `role="dialog"`, `aria-modal="true"`, `aria-label`
- Backdrop blur effect
- Download button with tracking

---

## Database Schema

### Collections
- `id`: Unique identifier (UUID)
- `name`: Collection name
- `slug`: URL-friendly identifier
- `description`: Collection description
- `coverImage`: Cover image URL
- `driveFolderId`: Google Drive folder ID for sync
- `createdAt`, `updatedAt`: Timestamps

### Stickers
- `id`: Unique identifier (UUID)
- `title`: Sticker title
- `caption`: Suggested caption for sharing
- `tags`: Array of searchable tags
- `thumbnailUrl`: Thumbnail/preview URL
- `sourceUrl`: Full-resolution image URL
- `driveFileId`: Google Drive file ID
- `collectionId`: Foreign key to collection
- `downloadCount`: Download counter
- `createdAt`, `updatedAt`: Timestamps

### Downloads
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
| `/api/collections` | GET | List all collections with sticker counts and previews |
| `/api/stickers` | GET | List stickers with optional `?limit=N&collectionId=ID` |
| `/api/stickers/[id]` | GET | Get single sticker details |
| `/api/download-request` | POST | Log download and collect contact info |
| `/api/unsubscribe` | POST | Submit data deletion request |
| `/api/sync/drive` | GET | Trigger Google Drive sync (requires API key) |
| `/api/image/[id]` | GET | Proxy image with caching |

### Admin Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/metrics` | GET | Dashboard statistics |
| `/api/admin/downloads` | GET | Download logs with pagination |

---

## Configuration

### Environment Variables

```env
# Database (Required) - Prisma Postgres connection string
DATABASE_URL="postgres://user:password@db.prisma.io:5432/postgres"

# Google Drive Sync (Required for sticker sync)
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID="your-google-drive-folder-id"

# Optional
NEXT_PUBLIC_SITE_URL="https://stickers.lovefacts.africa"
```

### Google Drive Setup

1. Create a Google Cloud project
2. Enable Google Drive API
3. Create a service account and download credentials
4. Share your Google Drive folder with the service account email
5. Add the credentials to environment variables
6. Sync stickers: `GET /api/sync/drive`

---

## Deployment

### Live Production Site

The Love Facts Sticker Portal is currently **LIVE** and accessible at:

| Domain | Purpose | Status |
|--------|---------|--------|
| **lovefacts.africa** | Main Love Facts domain | Active |
| **stickers.lovefacts.africa** | Sticker Portal | **LIVE** |

**Domain Cost:** $17 (one-time purchase for lovefacts.africa)

**QR Code:** A QR code has been generated for https://stickers.lovefacts.africa/ for easy sharing at events and printed materials.

### Hosting (Vercel)

The project is deployed on Vercel with Prisma Postgres.

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables:
   - `DATABASE_URL` (from Prisma Postgres)
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_DRIVE_FOLDER_ID`
4. Configure custom domain (stickers.lovefacts.africa)
5. Deploy automatically

### Database Setup

```bash
# Push schema to database
npx prisma db push

# Sync stickers from Google Drive
curl https://stickers.lovefacts.africa/api/sync/drive
```

---

## Development Commands

```bash
# Install dependencies
npm install

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

# Sync stickers from Google Drive
npx tsx scripts/sync-drive.ts
```

---

## Responsive Design

The application is fully responsive with no horizontal scrolling on any device.

### Grid Layout

| Breakpoint | Columns | Target Devices |
|------------|---------|----------------|
| Default | 2 | Mobile phones |
| `md` (768px) | 3 | Tablets |
| `lg` (1024px) | 4 | Laptops |
| `xl` (1280px) | 5 | Desktops |

### Mobile Features
- 2-column grid on all mobile devices
- Touch-friendly buttons (Preview, Get)
- No hover-dependent functionality
- Compact card design with proper spacing
- Smooth animations optimized for 60fps

### Desktop Features
- Hover effects on collection cards
- Quick action overlay on image hover
- Card lift animation
- Enhanced shadow effects

---

## Theme Support

The application supports three theme modes:
- **Light Mode**: Clean, bright interface
- **Dark Mode**: Eye-friendly dark theme
- **System**: Automatically matches OS preference

Theme toggle is available in the header navigation.

---

## Accessibility Features

- Keyboard navigation support
- Focus trap in modals
- ESC key closes modals
- ARIA labels on interactive elements
- Semantic HTML structure
- Focus indicators on all interactive elements
- Screen reader friendly

---

## Performance Optimizations

- Image lazy loading with `loading="lazy"`
- Eager loading for above-fold images
- Component code splitting
- Static page generation
- Optimized Framer Motion animations
- Efficient Prisma database queries
- Image caching via proxy endpoint

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
