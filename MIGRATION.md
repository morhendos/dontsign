# Migration Guide

## January 2025

### Type Import Changes

#### LogEntry Type
The `LogEntry` type has been moved to the shared types directory.

```diff
- import { LogEntry } from '@/components/analysis-log';
+ import { LogEntry } from '@/types/log';
```

Please update all imports accordingly. This change improves type consistency and reduces potential circular dependencies.
