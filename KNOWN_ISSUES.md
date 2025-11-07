# Known Issues

## MDX v3 Production Build Limitation

### Issue
Production builds fail with `@mdx-js/rollup` v3.x due to strict ESM validation in `micromark-extension-mdxjs-esm`.

**Error**: `Unexpected 'FunctionDeclaration' in code: only import/exports are supported`

### Root Cause
MDX v3 uses strict ESM parsing that rejects any non-import/export statements. The error occurs during internal MDX processing, not from user code.

### Impact
- **Development server**: ✅ Works perfectly
- **Production builds**: ❌ Fails for all MDX files

### Attempted Solutions
All attempts failed to resolve the issue:

1. **Downgraded to @mdx-js/rollup v2.3.0**
   - Result: Different parsing errors

2. **Tried vite-plugin-mdx**
   - Result: Module import compatibility issues

3. **MDX configuration variations**
   - `development: true/false`
   - `jsxImportSource` settings
   - `providerImportSource` settings
   - Disabling syntax highlighting plugins
   - Result: All configurations still fail

### Workaround
Use the development server for now:
```bash
bun dev
```

### Future Resolution
Possible approaches:
- Wait for MDX v3.2+ with relaxed ESM validation
- Implement custom markdown processor
- Use alternative MDX plugins when available
- Configure Vite to use development mode for MDX even in production

### References
- https://github.com/micromark/micromark-extension-mdxjs-esm#unexpected-type-in-code-only-importexports-are-supported
- @mdx-js/rollup v3.1.1 has strict ESM validation
- Related to code blocks (```typescript, ```bash, etc.) in MDX files
