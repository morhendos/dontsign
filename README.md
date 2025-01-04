## DontSign - Contract Analysis Application

## Project Overview
DontSign is a web application that helps users analyze contracts using AI. It processes PDF and DOCX files, extracting text and using OpenAI's GPT API to provide detailed analysis including key terms, potential risks, and recommendations.

## Technical Stack
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- OpenAI API (GPT-3.5-turbo-1106)
- PDF.js for PDF parsing
- Sentry for error tracking

## Development Best Practices

### Core Development Principles
1. **Understand Before Modifying**
   - Always thoroughly understand existing code before making changes
   - Check both client and server sides of the feature
   - Pay special attention to type definitions shared between client and server
   - Review existing tests and documentation

2. **Minimal Impact Changes**
   - Start with minimal changes that solve the immediate problem
   - Add instrumentation (like logging) before making functional changes
   - If something is working, be very cautious about "improving" it
   - Test changes incrementally

3. **Type Safety and Consistency**
   - Maintain strict type consistency between client and server
   - Document type changes in both places
   - Use TypeScript's type system to catch inconsistencies early
   - Keep shared types in a common location

4. **Effective Debugging**
   - Add comprehensive logging before making changes
   - Log at multiple levels (client, server, component)
   - Use structured logging with context
   - Keep existing logging when adding new features

### Real-World Lessons
Some key lessons learned from actual development:

1. **Progress Bar Example**
   - A simple type mismatch ('update' vs 'progress') can break functionality
   - Client-server communication requires perfect type alignment
   - Adding logging helped identify the real issue
   - Simple fixes are often better than complete rewrites

2. **Streaming Updates**
   - The server-side stream must match client expectations exactly
   - Test the entire pipeline with real data
   - Monitor both client and server logs
   - Keep the original working code as reference

## Core Components Structure

### `components/hero/`
The main interface container that orchestrates all sub-components:
- Manages global state (file, analysis results, errors)
- Handles main analysis flow
- Integrates with OpenAI API
- Manages real-time progress updates and streaming
- Provides user feedback during analysis

[Rest of the README remains the same...]