# Google Analytics 4 (GA4) Implementation

This document outlines the Google Analytics 4 implementation in the DontSign application.

## Overview

The application uses Google Analytics 4 for tracking user interactions and page views. The implementation includes:

- Privacy-first approach with cookie consent
- Type-safe event tracking
- Error handling and debugging capabilities
- Server-Side Components compatibility

## Core Components

### 1. Analytics Setup (`/lib/analytics.ts`)

- Handles GA4 initialization
- Provides type-safe event tracking
- Includes debug mode for development
- Implements error handling and validation

### 2. Consent Management (`/lib/analytics-consent.ts`)

- Manages user consent for analytics
- Provides persistent storage of consent
- Implements GDPR-compliant consent mechanisms

### 3. Analytics Component (`/components/Analytics.tsx`)

- Client-side wrapper for GA4
- Handles initialization based on user consent
- Tracks page views automatically

## Key Features

### Initialization

```typescript
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
```

- Automatic script loading
- Measurement ID validation
- Debug mode in development

### Page View Tracking

- Automatic page view tracking with Next.js App Router
- URL parameter tracking
- Client-side only execution

### Event Tracking

```typescript
interface GAEvent {
  action: string;
  category: string;
  label: string;
  value?: number;
}
```

## Privacy & Compliance

- Cookie consent implementation
- Local storage for consent persistence
- No tracking before consent
- Easy consent management

## Error Handling

- Comprehensive error catching
- Debug logging in development
- Fallback mechanisms

## Usage Examples

### Tracking Page Views

```typescript
// Automatic with Analytics component
<Analytics />

// Manual tracking
import { pageview } from '@/lib/analytics';
pageview('/specific-page');
```

### Tracking Events

```typescript
import { event } from '@/lib/analytics';

event({
  action: 'document_upload',
  category: 'engagement',
  label: 'contract_analysis',
  value: 1
});
```

### Checking Initialization

```typescript
import { isGAInitialized } from '@/lib/analytics';

if (isGAInitialized()) {
  // Perform tracking
}
```

## Best Practices

1. Always check for consent before tracking
2. Use type-safe event tracking
3. Handle errors gracefully
4. Test in debug mode before production
5. Monitor console for debug messages in development

## Environment Setup

Required environment variable:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Technical Considerations

- Server-Side Components compatibility
- Next.js App Router integration
- Type safety with TypeScript
- Error boundary implementation
