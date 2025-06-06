# Team Todd Photo Gallery - Project Structure

This document explains the organization of files and folders in this Next.js project.

## Root Directory

The root directory contains essential configuration files that must be at the project root for tools to function properly:

### Required at Root
- `package.json` & `package-lock.json` - npm package management
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` & `next-env.d.ts` - Next.js configuration
- `middleware.ts` - Next.js middleware (App Router requirement)
- `.gitignore` - Git ignore patterns
- `README.md` - Project documentation

### Build & Test Configuration (Root)
- `jest.config.js` - Jest testing configuration
- `jest.setup.js` - Jest setup file
- `lint-staged.config.js` - Pre-commit linting configuration
- `eslint.config.mjs` - ESLint configuration

*Note: These files need to be at root because Jest and other tools have issues finding package.json and other dependencies when configs are in subdirectories.*

## Organized Directories

### `/config/`
Contains configuration files that can be moved from root:
- `.prettierrc` - Code formatting rules
- `postcss.config.mjs` - PostCSS configuration for Tailwind

### `/src/`
Main application source code:
- `/app/` - Next.js App Router pages and layouts
- `/components/` - Reusable React components
- `/contexts/` - React Context providers
- `/lib/` - Utility functions and configurations

### `/public/`
Static assets served by Next.js

### `/.husky/`
Git hooks configuration

### `/.taskmaster/`
Task Master AI project management files

## Hidden/System Directories
- `/.next/` - Next.js build output
- `/node_modules/` - npm dependencies
- `/.git/` - Git repository data
- `/.swc/` - SWC compiler cache
- `/.cursor/` - Cursor IDE configuration

## Why This Structure?

### What We Moved
✅ **Prettier config** - Can be referenced via package.json
✅ **PostCSS config** - Next.js finds it automatically in config/

### What Stays at Root
❌ **Jest config** - Needs to find package.json and Next.js config
❌ **ESLint config** - Standard location for most tools
❌ **lint-staged config** - Works better with Husky from root
❌ **TypeScript config** - Required by TypeScript compiler
❌ **Next.js files** - Required by Next.js framework

## Best Practices Followed

1. **Tool Requirements**: Kept configs where tools expect them
2. **Minimal Root**: Moved what we could to reduce root clutter
3. **Logical Grouping**: Related configs grouped in `/config/`
4. **Documentation**: This file explains the decisions made

## Future Improvements

As the project grows, consider:
- Moving more configs to `/config/` if tools support it
- Creating `/docs/` for additional documentation
- Adding `/scripts/` for build and deployment scripts
- Organizing `/src/` with feature-based folders 