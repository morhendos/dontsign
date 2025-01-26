## DontSign - Contract Analysis Application

## Project Overview
DontSign is a web application that helps users analyze contracts using AI. It processes PDF and DOCX files, extracting text and using OpenAI's GPT API to provide detailed analysis including key terms, potential risks, and recommendations.

## Technical Stack
- Next.js 14 with App Router and Server Actions
- TypeScript
- Tailwind CSS
- shadcn/ui components
- OpenAI API (GPT-3.5-turbo-1106)
- PDF.js for PDF parsing
- Nodemailer for email handling
- Sentry for error tracking and monitoring
- Custom analytics system with consent management

## Core Components Structure

### `components/contract-analyzer/`
Main contract analysis components:
- Main orchestrator component
- Progress tracking
- Results display
- Error handling
- Analytics integration

### `components/contract-upload/`
File upload functionality:
- Drag & drop support
- PDF/DOCX validation
- Error handling
- Progress tracking

### `components/analysis-history/`
Analysis history management:
- Recent analyses tracking
- Local storage integration
- Session management

### `components/contact/`
Contact form functionality:
- Form validation
- Email sending
- Rate limiting
- Success/error handling

### `app/actions.ts`
Server Actions implementation:
- Contract analysis with OpenAI
- Rate limiting
- Error handling
- Progress tracking
- Analytics events

### `lib/services/`
Core services:
- OpenAI integration
- Analytics system
- Error tracking
- Rate limiting
- Email service
- Storage management

## Key Features

### Contract Analysis
- PDF and DOCX support
- Text extraction with error handling
- Chunk-based processing for large documents
- Real-time progress tracking
- Comprehensive error handling

### Contact Form
- Email notifications
- Rate limiting protection
- Form validation
- Success/error feedback
- Dark mode support

### Error Tracking & Monitoring
- Sentry integration for client and server
- Custom error boundaries
- Environment-aware configuration
- Performance monitoring
- Protected source maps

### Analytics & Privacy
- Custom analytics system
- Cookie consent management
- Event tracking
- User session handling
- Privacy-first approach

## Development Guidelines

### Adding New Features
1. Create feature branch from main
2. Implement error tracking
3. Add analytics events
4. Update documentation
5. Submit PR

### Code Style
- TypeScript for all components
- Server Actions for API functionality
- shadcn/ui components
- Proper error handling
- Analytics tracking

### Testing
Focus areas:
- File upload flow
- Analysis process
- Error scenarios
- Progress tracking
- Analytics events
- Contact form submission

### Deployment
Automatic deployment flow:
- Production deploys from main
- Feature branches for development
- PR process with reviews
- Preview environments

## Environment Setup
Required environment variables:
```env
OPENAI_API_KEY=your_key
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_ANALYTICS_KEY=your_analytics_key
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_app_password  # Generated from Google Account settings
```

Development server:
```bash
npm run dev
```

For detailed documentation, see the `docs/` directory.