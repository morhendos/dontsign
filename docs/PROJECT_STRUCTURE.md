# DontSign Project Structure

## Directory Structure

```
📦 dontsign
├── 📂 app/                      # Next.js App Router
│   ├── 📂 (legal)/              # Legal pages route group
│   │   ├── privacy/             # Privacy policy page
│   │   └── terms/               # Terms of service page
│   ├── 📂 api/                  # API routes
│   ├── 📂 contact/              # Contact page
│   ├── 📄 actions.ts            # Server Actions
│   ├── 📄 error.tsx             # Error page
│   ├── 📄 global-error.tsx      # Global error handler
│   ├── 📄 layout.tsx            # Root layout
│   ├── 📄 page.tsx              # Home page
│   └── 📄 not-found.tsx         # 404 page
├── 📂 components/               # React components
│   ├── 📂 analysis-history/     # Analysis history components
│   │   ├── 📄 index.tsx         # Main history component
│   │   └── 📄 history-item.tsx  # Individual history item
│   ├── 📂 analysis-log/         # Analysis logging components
│   │   ├── 📄 index.tsx         # Main log component
│   │   └── 📄 log-entry.tsx     # Individual log entry
│   ├── 📂 contract-analyzer/    # Main analyzer components
│   │   ├── 📄 index.tsx         # Main analyzer
│   │   └── 📄 progress.tsx      # Progress tracking
│   ├── 📂 contract-upload/      # File upload components
│   │   ├── 📄 index.tsx         # Upload container
│   │   └── 📄 dropzone.tsx      # Drag & drop zone
│   ├── 📂 error/                # Error components
│   │   ├── 📄 index.tsx         # Error container
│   │   └── 📄 display.tsx       # Error display
│   ├── 📂 ui/                   # Shared UI components
│   │   ├── 📄 button.tsx
│   │   ├── 📄 card.tsx
│   │   └── 📄 [...others]
│   ├── 📄 Analytics.tsx         # Analytics wrapper
│   ├── 📄 CookieConsent.tsx     # Cookie consent banner
│   ├── 📄 header.tsx            # Site header
│   └── 📄 footer.tsx            # Site footer
├── 📂 lib/                      # Utility functions
│   ├── 📂 services/             # External services
│   │   ├── 📂 openai/           # OpenAI integration
│   │   │   ├── 📄 openai-service.ts
│   │   │   └── 📄 prompts.ts
│   │   └── 📂 analytics/        # Analytics service
│   ├── 📄 pdf-utils.ts          # PDF processing
│   ├── 📄 text-utils.ts         # Text processing
│   ├── 📄 rate-limit.ts         # Rate limiting
│   ├── 📄 errors.ts             # Error handling
│   └── 📄 storage.ts            # Local storage
├── 📂 types/                    # TypeScript types
│   ├── 📄 analysis.ts           # Analysis types
│   └── 📄 common.ts             # Shared types
├── 📂 hooks/                    # React hooks
│   ├── 📄 useAnalysis.ts        # Analysis hook
│   └── 📄 useStorage.ts         # Storage hook
└── 📂 public/                   # Static assets

```

## Key Files and Their Purposes

### Core Application

- `app/page.tsx`: Main entry point, renders primary components
- `app/actions.ts`: Server Actions for contract analysis
- `app/layout.tsx`: Root layout with providers and global components

### Components

#### Analysis Components
- `components/contract-analyzer/index.tsx`: Main analysis orchestrator
- `components/contract-upload/index.tsx`: File upload handling
- `components/analysis-history/index.tsx`: Analysis history management
- `components/analysis-log/index.tsx`: Real-time analysis logging

#### UI Components
- `components/ui/*`: Shared UI components using shadcn/ui
- `components/error/*`: Error handling and display
- `components/Analytics.tsx`: Analytics wrapper
- `components/CookieConsent.tsx`: GDPR cookie consent

### Services and Utilities

#### OpenAI Integration
- `lib/services/openai/openai-service.ts`: OpenAI API client
- `lib/services/openai/prompts.ts`: Analysis prompts

#### File Processing
- `lib/pdf-utils.ts`: PDF processing utilities
- `lib/text-utils.ts`: Text processing and chunking

#### Error Handling
- `lib/errors.ts`: Custom error types
- `app/error.tsx`: Error boundary component
- `app/global-error.tsx`: Global error handler

#### State and Storage
- `lib/storage.ts`: Local storage utilities
- `hooks/useStorage.ts`: Storage management hook
- `hooks/useAnalysis.ts`: Analysis state management

## Component Dependencies

### Main Flow
1. User interacts with `contract-upload`
2. `contract-analyzer` orchestrates analysis
3. `analysis-log` shows progress
4. Results displayed through analyzer
5. History saved via `analysis-history`

### Error Flow
1. Errors caught in components or actions
2. Processed through error boundaries
3. Displayed via error components
4. Logged to Sentry
5. Tracked in analytics

### Analytics Flow
1. User actions tracked via Analytics wrapper
2. Consent managed by CookieConsent
3. Events processed by analytics service
4. Error tracking integrated with Sentry

## Configuration Files

- `next.config.js`: Next.js configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `components.json`: shadcn/ui configuration
- `sentry.*.config.js`: Sentry configuration files

## Environment Variables

```env
OPENAI_API_KEY=          # OpenAI API key
SENTRY_DSN=              # Sentry DSN
ANALYTICS_KEY=           # Analytics API key
NEXT_PUBLIC_APP_URL=     # Application URL
```
