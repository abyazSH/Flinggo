# Getting Started

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [vite.config.js](file://vite.config.js)
- [README.md](file://README.md)
- [supabase-schema.sql](file://supabase-schema.sql)
- [src/config/supabase.js](file://src/config/supabase.js)
- [src/services/gemmaService.js](file://src/services/gemmaService.js)
- [src/services/llamaService.js](file://src/services/llamaService.js)
- [src/services/supabaseService.js](file://src/services/supabaseService.js)
- [src/hooks/useLLM.js](file://src/hooks/useLLM.js)
- [tailwind.config.js](file://tailwind.config.js)
- [postcss.config.js](file://postcss.config.js)
- [eslint.config.js](file://eslint.config.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Development Server](#development-server)
7. [Build Configuration](#build-configuration)
8. [Initial Project Structure Walkthrough](#initial-project-structure-walkthrough)
9. [First Run: Supabase Authentication](#first-run-supabase-authentication)
10. [First Run: AI API Keys](#first-run-ai-api-keys)
11. [Accessing the Application Locally](#accessing-the-application-locally)
12. [Common Setup Issues and Troubleshooting](#common-setup-issues-and-troubleshooting)
13. [Conclusion](#conclusion)

## Introduction
This guide helps you set up and run Flinggo-app locally. It covers prerequisites, installation, environment configuration, database setup, development server startup, build configuration, and first-run steps for Supabase authentication and AI integrations. The project is a React application built with Vite, styled with Tailwind CSS and DaisyUI, and integrates Supabase for authentication and data, along with external AI APIs for translation and quizzes.

## Prerequisites
- Operating system: Windows, macOS, or Linux
- Node.js: Version 18.x or later recommended (check compatibility with your platform)
- Package manager: npm (bundled with Node.js) or Yarn
- Git (optional, for cloning the repository)
- Text editor or IDE with JavaScript/React support

Notes:
- The project uses ES modules and modern React features. Ensure your Node.js version supports the latest ECMAScript features used by the stack.
- If using Yarn, install it globally and use Yarn commands instead of npm in this guide.

**Section sources**
- [package.json:11-21](file://package.json#L11-L21)
- [package.json:22-29](file://package.json#L22-L29)

## Installation
Follow these steps to install dependencies and prepare your local environment:

1. Install dependencies
   - Using npm:
     - Run: npm install
   - Using Yarn:
     - Run: yarn install

2. Verify installation
   - After installation completes, confirm that the project runs without errors.

Notes:
- The project uses Vite for fast development builds and HMR.
- Dependencies include React, routing, UI libraries, and Supabase client.

**Section sources**
- [package.json:6-10](file://package.json#L6-L10)
- [package.json:11-21](file://package.json#L11-L21)
- [package.json:22-29](file://package.json#L22-L29)

## Environment Variables
Create a .env file at the project root and configure the following variables:

- VITE_SUPABASE_URL: Supabase project URL
- VITE_SUPABASE_ANON_KEY: Supabase anonymous public key
- VITE_GOOGLE_AI_API_KEY: Google AI (Gemini) API key
- VITE_META_AI_API_KEY: Meta AI (Llama) API key

Where to find these values:
- Supabase keys: Obtain from your Supabase project settings under API.
- Google AI API key: Get from Google AI Studio.
- Meta AI API key: Get from the Meta AI provider portal.

Validation tips:
- Ensure keys are correct and not truncated.
- Keep the .env file out of version control.

**Section sources**
- [src/config/supabase.js:3-6](file://src/config/supabase.js#L3-L6)
- [src/services/gemmaService.js:3](file://src/services/gemmaService.js#L3)
- [src/services/llamaService.js:1](file://src/services/llamaService.js#L1)

## Database Setup
Run the provided SQL schema in your Supabase SQL Editor to create tables and policies:

- Open the Supabase project SQL Editor.
- Paste and run the entire SQL script from the repository file.
- Confirm that tables are created and Row Level Security (RLS) policies are applied.

Tables created:
- profiles
- translation_history
- quiz_attempts
- user_progress
- daily_challenges

Indexes created:
- translation_history user index
- quiz_attempts user index
- user_progress user index
- daily_challenges date index
- profiles XP leaderboard index

Verification:
- Test basic queries via the SQL Editor to ensure data insertion and retrieval work as expected.

**Section sources**
- [supabase-schema.sql:1-119](file://supabase-schema.sql#L1-L119)

## Development Server
Start the development server using Vite:

- Using npm:
  - Run: npm run dev
- Using Yarn:
  - Run: yarn dev

Expected behavior:
- Vite starts a local development server with hot module replacement.
- The app reloads automatically when you edit files.

Port and host:
- By default, Vite serves on localhost:5173. If this port is busy, Vite will suggest an alternative.

**Section sources**
- [package.json:7](file://package.json#L7)
- [vite.config.js:1-7](file://vite.config.js#L1-L7)

## Build Configuration
Build the project for production:

- Using npm:
  - Run: npm run build
- Using Yarn:
  - Run: yarn build

Outputs:
- Production-ready static assets in the dist directory.

PostCSS and Tailwind:
- PostCSS and Tailwind are configured for styling. DaisyUI is included as a plugin.
- Tailwind scans the project for class usage and generates optimized CSS.

ESLint:
- ESLint is configured with recommended rules for React and JSX.

**Section sources**
- [package.json:8](file://package.json#L8)
- [postcss.config.js:1-7](file://postcss.config.js#L1-L7)
- [tailwind.config.js:1-66](file://tailwind.config.js#L1-L66)
- [eslint.config.js:1-22](file://eslint.config.js#L1-L22)

## Initial Project Structure Walkthrough
High-level overview of key directories and files:

- src/
  - config/: Configuration modules (Supabase client setup)
  - services/: Integrations (Supabase, Gemini, Llama)
  - hooks/: React hooks (e.g., useLLM)
  - components/, layouts/, pages/: UI and page modules
  - contexts/, data/, assets/: shared resources
- public/: static assets
- vite.config.js: Vite configuration
- tailwind.config.js, postcss.config.js: Styling pipeline
- package.json: Scripts, dependencies, and devDependencies

How this supports development:
- Separation of concerns enables modular development.
- Services encapsulate external integrations.
- Hooks centralize reusable logic.

**Section sources**
- [vite.config.js:1-7](file://vite.config.js#L1-L7)
- [tailwind.config.js:1-66](file://tailwind.config.js#L1-L66)
- [postcss.config.js:1-7](file://postcss.config.js#L1-L7)
- [package.json:11-21](file://package.json#L11-L21)
- [package.json:22-29](file://package.json#L22-L29)

## First Run: Supabase Authentication
Complete these steps to enable user sign-up/sign-in:

1. Enable Auth in Supabase
   - Go to Authentication > Settings and enable Email/Password or other providers you want to support.

2. Configure Redirect URLs
   - Set authorized redirect domains for local development (e.g., http://localhost:5173).

3. Initialize Supabase Client
   - Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.

4. Test Authentication
   - Navigate to the login/register pages and verify sign-in/out works.

Integration points:
- Supabase client initialization is handled in the Supabase configuration module.
- Supabase service functions manage user data and RLS-secured tables.

**Section sources**
- [src/config/supabase.js:1-7](file://src/config/supabase.js#L1-L7)
- [src/services/supabaseService.js:1-132](file://src/services/supabaseService.js#L1-L132)

## First Run: AI API Keys
Configure AI integrations for translation and quizzes:

1. Obtain API Keys
   - Google AI (Gemini): Get API key from Google AI Studio.
   - Meta AI (Llama): Get API key from the Meta AI provider.

2. Set Environment Variables
   - Add VITE_GOOGLE_AI_API_KEY and VITE_META_AI_API_KEY to .env.

3. Verify Integration
   - Use the translation and quiz features to ensure responses are returned.
   - Check for API errors in the browser console if requests fail.

Error handling:
- Llama service throws descriptive errors on API failures.
- Gemini service parses structured JSON responses and falls back gracefully.

**Section sources**
- [src/services/gemmaService.js:1-56](file://src/services/gemmaService.js#L1-L56)
- [src/services/llamaService.js:1-84](file://src/services/llamaService.js#L1-L84)
- [src/hooks/useLLM.js:1-38](file://src/hooks/useLLM.js#L1-L38)

## Accessing the Application Locally
After starting the development server:

- Open your browser to http://localhost:5173
- Sign in or register using Supabase Auth
- Explore features:
  - Translation chat with AI models
  - Quizzes and progress tracking
  - Leaderboard and user profiles

Navigation:
- Pages are organized under src/pages and routed via React Router.
- Layouts in src/layouts wrap page components.

**Section sources**
- [package.json:7](file://package.json#L7)

## Common Setup Issues and Troubleshooting
- Missing environment variables
  - Symptom: Blank screen or runtime errors related to missing keys.
  - Fix: Add VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GOOGLE_AI_API_KEY, VITE_META_AI_API_KEY to .env.

- Supabase RLS policy errors
  - Symptom: Permission denied when reading/writing user data.
  - Fix: Ensure RLS policies are enabled and user is authenticated before querying protected tables.

- AI API errors
  - Symptom: Llama API errors or empty responses.
  - Fix: Verify API key validity and network connectivity; check service logs for detailed error messages.

- Port conflicts during dev server startup
  - Symptom: Vite reports port already in use.
  - Fix: Stop the conflicting process or change the port in Vite configuration.

- Tailwind/DaisyUI styles not applying
  - Symptom: Components render without expected styling.
  - Fix: Ensure Tailwind content paths include your source files and rebuild the project.

- ESLint warnings or errors
  - Symptom: Lint errors in the terminal or editor.
  - Fix: Review ESLint configuration and fix reported issues.

**Section sources**
- [src/config/supabase.js:3-6](file://src/config/supabase.js#L3-L6)
- [src/services/llamaService.js:34-37](file://src/services/llamaService.js#L34-L37)
- [tailwind.config.js:3](file://tailwind.config.js#L3)
- [eslint.config.js:1-22](file://eslint.config.js#L1-L22)

## Conclusion
You now have a complete local setup for Flinggo-app. You installed dependencies, configured environment variables, initialized the Supabase database, and verified AI integrations. Use the development server for rapid iteration and the build command to produce production assets. If you encounter issues, refer to the troubleshooting section to resolve common problems quickly.