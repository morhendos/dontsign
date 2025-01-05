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

### Real-World Lessons

#### Progress Bar Example

A real case study from our development:

Problem:
- Progress bar was getting stuck at 5% even though server-side processing completed
- Server logs showed correct progress updates
- UI wasn't reflecting the updates

Initial Mistake:
- Tried to "improve" the working stream handling code
- Made multiple changes at once
- Introduced new types without checking existing ones

Actual Issue:
- Simple type mismatch between client and server
- Server was sending 'progress' but client expected 'update'
- Working code was modified without understanding it fully

Solution:
1. Reverted changes to working code
2. Added logging to understand the flow
3. Maintained type consistency
4. Made minimal necessary changes

Key Takeaways:
1. Don't fix what isn't broken
2. Understand before modifying
3. Check type consistency
4. Add logging first

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
