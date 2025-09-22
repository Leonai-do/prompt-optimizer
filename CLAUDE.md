# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prompt Optimizer is an AI-powered tool for optimizing prompts to improve AI output quality. It supports multiple deployment modes: Web application, Desktop application, Chrome extension, and Docker deployment. The project is built using a monorepo architecture with TypeScript and Vue 3.

## Package Manager and Commands

**IMPORTANT**: This project uses `pnpm` as the package manager. Use `pnpm` for all operations, not npm or yarn.

### Development Commands

```bash
# Install dependencies
pnpm install

# Development (Web app)
pnpm dev               # Build core/ui packages and run web app
pnpm dev:fresh         # Clean reset: clean + reinstall + dev
pnpm dev:parallel      # Run UI and WEB in parallel after building core

# Development (Desktop app)
pnpm dev:desktop       # Build core/ui, run web and desktop in parallel
pnpm dev:desktop:fresh # Clean reset for desktop development

# Testing
pnpm test              # Run all tests across packages
pnpm -F @prompt-optimizer/core test        # Test specific package
pnpm -F @prompt-optimizer/ui test          # Test UI package

# Building
pnpm build             # Build all packages in dependency order
pnpm build:core        # Build core package only
pnpm build:ui          # Build UI package only
pnpm build:web         # Build web application
pnpm build:desktop     # Build desktop application (includes packaging)

# Linting
pnpm lint              # Lint UI package
pnpm lint:fix          # Fix linting issues

# Cleaning
pnpm clean             # Clean dist and cache directories
pnpm clean:dist        # Clean distribution directories
pnpm clean:vite        # Clean Vite cache
```

### MCP Server Commands

```bash
pnpm mcp:build         # Build MCP server package
pnpm mcp:dev           # Run MCP server in development mode
pnpm mcp:start         # Start MCP server
pnpm mcp:test          # Test MCP server
```

### Package-Specific Commands

Use `pnpm -F <package-name>` to run commands in specific packages:
- `@prompt-optimizer/core` - Core functionality
- `@prompt-optimizer/ui` - UI components
- `@prompt-optimizer/web` - Web application
- `@prompt-optimizer/extension` - Chrome extension
- `@prompt-optimizer/desktop` - Desktop application
- `@prompt-optimizer/mcp-server` - MCP server

## Architecture Overview

### Monorepo Structure

The project uses a monorepo with the following packages:

- **`@prompt-optimizer/core`**: Core business logic, services, and utilities
- **`@prompt-optimizer/ui`**: Vue 3 UI components with Naive UI design system
- **`@prompt-optimizer/web`**: Web application entry point
- **`@prompt-optimizer/extension`**: Chrome extension
- **`@prompt-optimizer/desktop`**: Electron desktop application
- **`@prompt-optimizer/mcp-server`**: Model Context Protocol server

### Build Dependencies

Build order is crucial due to dependencies:
1. **core** → **ui** → **web/extension/desktop** (parallel)

### Key Services Architecture

The core package provides a service-oriented architecture:

- **TemplateManager**: Manages prompt optimization templates
- **ModelManager**: Handles AI model configurations and API integrations
- **LLMService**: Provides unified interface for different AI providers (OpenAI, Gemini, DeepSeek, etc.)
- **HistoryManager**: Manages optimization history and persistence
- **StorageFactory**: Provides abstracted storage (localStorage, Dexie, file system)
- **PreferenceService**: User preferences and settings management
- **CompareService**: Prompt comparison functionality
- **DataManager**: Import/export and data management
- **ContextRepo**: Context variables and conversation management

### Cross-Platform Support

The application supports multiple environments:
- **Browser**: Web application with localStorage
- **Electron**: Desktop with file system storage and native features
- **Extension**: Chrome extension with limited storage

Environment detection is handled by `utils/environment.ts`.

## Development Guidelines

### Code Style and Conventions

1. **TypeScript**: Strict TypeScript configuration across all packages
2. **Vue 3**: Composition API with `<script setup>` syntax
3. **Naive UI**: Primary UI component library
4. **Internationalization**: Vue I18n for multi-language support
5. **Error Handling**: Comprehensive error handling with custom error types

### Testing Requirements

- **Unit tests**: Vitest for all packages
- **Integration tests**: For service interactions
- **Test coverage**: Aim for comprehensive coverage of core services
- Run tests before committing: `pnpm test`

### Key Development Rules (from .cursorrules)

1. **Environment**: Windows development environment preferred
2. **Testing**: Run `pnpm test` after any code changes
3. **Documentation**: Update experience documentation in relevant files
4. **API Integration**: Use OpenAI-compatible format, keep business logic decoupled
5. **Error Handling**: Implement comprehensive error handling with user-friendly messages

### File Structure Patterns

- Services follow factory pattern with interfaces
- Electron proxies for cross-process communication
- Error classes for each service domain
- Type definitions separated from implementation

## Environment Variables

Key environment variables for development:

```bash
# API Keys
VITE_OPENAI_API_KEY=your_openai_key
VITE_GEMINI_API_KEY=your_gemini_key
VITE_DEEPSEEK_API_KEY=your_deepseek_key
VITE_ZHIPU_API_KEY=your_zhipu_key
VITE_SILICONFLOW_API_KEY=your_siliconflow_key

# Custom Models (unlimited number supported)
VITE_CUSTOM_API_KEY_suffix=key
VITE_CUSTOM_API_BASE_URL_suffix=url
VITE_CUSTOM_API_MODEL_suffix=model_name

# Access Control
ACCESS_USERNAME=admin
ACCESS_PASSWORD=your_password

# MCP Server
MCP_DEFAULT_MODEL_PROVIDER=openai
MCP_LOG_LEVEL=info
```

## Deployment Information

### Development Branches

- **`main`**: Production branch (triggers Vercel deployment)
- **`develop`**: Development branch (no Vercel deployment)
- **Feature branches**: Created from develop

### Version Management

```bash
# Update version (without git tag)
pnpm version:prepare patch|minor|major

# Create and push git tag (triggers desktop build)
pnpm run version:tag
pnpm run version:publish
```

### Platform-specific Notes

- **Vercel**: Automatic deployment from main branch only
- **Desktop**: GitHub Actions build triggered by git tags
- **Docker**: Multi-stage build with nginx serving
- **Extension**: Chrome Web Store publishing

## Common Issues and Solutions

1. **CORS Issues**: Use desktop app or deploy to avoid browser CORS restrictions
2. **Build Failures**: Run `pnpm clean` then `pnpm install` to reset environment
3. **Test Failures**: Ensure all packages are built before running tests
4. **Electron Issues**: Use proxy classes for renderer-main process communication

## Important Files

- `dev.md`: Detailed development guide with deployment workflows
- `.cursorrules`: Development rules and conventions
- `package.json`: Root package with all build scripts
- `packages/core/src/index.ts`: Core services export
- `packages/ui/src/index.ts`: UI components export