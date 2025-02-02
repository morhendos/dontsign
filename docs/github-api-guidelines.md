# Guidelines for GitHub API File Modifications

## Available Functions

### `push_files`
Pushes one or more files to a repository in a single commit.
```typescript
await push_files({
  owner: string,          // Repository owner
  repo: string,           // Repository name
  branch: string,         // Branch name
  files: Array<{          // Array of files to push
    path: string,         // File path in repository
    content: string       // File content
  }>,
  message: string         // Commit message
});
```

### `get_file_contents`
Retrieves content of a file from repository.
```typescript
const file = await get_file_contents({
  owner: string,          // Repository owner
  repo: string,           // Repository name
  path: string,           // File path
  branch?: string         // Optional branch name
});
```

## Correct Approach

```typescript
// 1. First get existing content
const existingFile = await getFileContents({
  owner,
  repo,
  path: 'path/to/file.md',
  branch: 'feature-branch'
});

// 2. Decode and modify content
const currentContent = existingFile.content 
  ? Buffer.from(existingFile.content, 'base64').toString()
  : '';

const updatedContent = modifyContent(currentContent);

// 3. Push changes
await pushFiles({
  owner,
  repo,
  branch: 'feature-branch',
  files: [{
    path: 'path/to/file.md',
    content: updatedContent
  }],
  message: 'update: modify file content'
});
```

## Common Mistakes to Avoid

1. Direct file replacement without reading current content
2. Not checking if file exists before modification
3. Not handling base64 encoding/decoding
4. Not preserving sections from original file

## Best Practices

1. Always fetch current content first
2. Use proper error handling
3. Make atomic changes (one logical change per commit)
4. Provide clear commit messages
5. Verify content before pushing

## Example: Updating README

```typescript
async function updateReadme(newSection: string) {
  // Get current README
  const readme = await get_file_contents({
    owner,
    repo,
    path: 'README.md'
  });

  // Decode content
  const currentContent = Buffer.from(readme.content, 'base64').toString();

  // Add new section while preserving existing content
  const updatedContent = `${currentContent}\n\n${newSection}`;

  // Push update
  await push_files({
    owner,
    repo,
    branch: 'feature-branch',
    files: [{
      path: 'README.md',
      content: updatedContent
    }],
    message: 'docs: add new section to README'
  });
}
```