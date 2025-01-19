# Contributing to DontSign

## Development Best Practices

### Core Development Principles

1. **Understand Before Modifying**
   - Always thoroughly understand existing code before making changes
   - Check both client and server sides of the feature
   - Pay special attention to type definitions shared between client and server
   - Review existing tests and documentation
   - If something is working correctly, be very cautious about "improving" it

2. **Minimal Impact Changes**
   - Start with minimal changes that solve the immediate problem
   - Add instrumentation (like logging) before making functional changes
   - Test changes incrementally
   - Keep changes focused and atomic

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

## Analytics Integration

When adding new features:
1. Add appropriate analytics events
2. Respect user consent settings
3. Include proper error tracking
4. Document new events

Example:
```typescript
// Good analytics implementation
trackEvent('contract_upload_start', {
  fileType: file.type,
  fileSize: file.size,
});

try {
  // Feature implementation
} catch (error) {
  Sentry.captureException(error);
  trackEvent('contract_upload_error', {
    error: error.message,
  });
}
```

## Error Handling Best Practices

1. Use Sentry for all errors:
   ```typescript
   try {
     // Feature code
   } catch (error) {
     Sentry.captureException(error, {
       extra: {
         // Relevant context
       },
     });
   }
   ```

2. Implement rate limiting:
   - Check rate limits before operations
   - Handle rate limit errors gracefully
   - Provide clear user feedback

### Real-World Lessons

#### State Management Example

A real case study from our development:

Problem:
- Previous analysis results were showing up for new files
- State wasn't being properly cleaned up between file selections
- User couldn't properly close and reopen results

Initial Mistake:
- Made multiple state changes at once
- Didn't add proper logging
- Tried to "fix" working code instead of understanding the issue

Actual Issue:
- State cleanup timing was incorrect
- File selection and analysis state weren't properly coordinated
- Flags weren't being reset at the right time

Solution:
1. Added comprehensive logging
2. Understood the state flow
3. Made minimal, focused changes
4. Verified each state transition

Key Takeaways:
1. Add logging before making changes
2. Understand state flow completely
3. Make minimal, focused changes
4. Test each state transition

## State Management Guidelines

1. **Clear Ownership**
   - Each piece of state should have clear ownership
   - Use appropriate scope for state (component vs. global)
   - Document state dependencies

2. **Clean Transitions**
   - Clear state properly between operations
   - Handle all edge cases
   - Document state cleanup requirements

3. **Proper Testing**
   - Test all state transitions
   - Verify cleanup happens correctly
   - Test edge cases thoroughly

## Pull Request Process

1. Create a feature branch from `main`
2. Follow the best practices above
3. Update documentation as needed
4. Test thoroughly
5. Submit PR with clear description

## Development Setup

See the README.md for:
- Technical stack details
- Environment setup
- Available scripts
- Project structure