# Changelog

## [v1.1.0] - 2024-12-20

### Added
- Sentry error tracking and performance monitoring integration
  - Client-side error tracking with custom filtering
  - Server-side error handling with Node.js specific integrations
  - Performance monitoring with 10% sample rate
  - Environment-aware configuration
  - Development mode protection
  - Custom breadcrumb filtering for cleaner logs
  - Automatic HTTP request tracing
  - Integration with Next.js app router

### Technical Details
- Added `sentry.client.config.js` with:
  - Browser performance tracking
  - Trace propagation for both localhost and production
  - Custom error and breadcrumb filtering
  - Production-only error reporting
- Added `sentry.server.config.js` with:
  - Node.js specific integrations
  - HTTP request tracing
  - Uncaught exception handling
  - Unhandled rejection handling
  - Development mode protection

## [v1.0.0] - 2024-12-17

Initial release with core functionality:

### Features
- PDF document upload and text extraction
- AI-powered contract analysis using OpenAI GPT-3.5
- Key terms and risks identification
- Important clauses extraction
- Mobile-responsive interface

### Technical
- Next.js 14 with App Router setup
- TypeScript implementation
- PDF.js integration
- OpenAI API integration
- CI/CD pipeline with GitHub Actions
- Vercel deployment with preview environments