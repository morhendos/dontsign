# Migration Guide

## January 2025

### Component Structure Changes

#### ContractAnalyzer Refactoring
The main analysis component has been refactored:

```diff
- import { Hero } from '@/components/hero';
+ import { ContractAnalyzer } from '@/components/contract-analyzer';
```

#### State Management Updates
State management has been centralized in the ContractAnalyzer component:

```diff
- const { ... } = useFileUpload();
+ const { ... } = useContractAnalyzer();
```

### Type Changes

#### LogEntry Type
The `LogEntry` type has been moved to the shared types directory.

```diff
- import { LogEntry } from '@/components/analysis-log';
+ import { LogEntry } from '@/types/log';
```

Please update all imports accordingly. These changes improve type consistency and reduce potential circular dependencies.
