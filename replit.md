# Meteora LP Leaderboard Dashboard

## Overview

The Meteora LP Leaderboard Dashboard is a DeFi analytics application that displays real-time rankings and statistics for liquidity providers on the Meteora protocol. The application fetches data from Dune Analytics to showcase top LPs by trading volume, active positions, and lifetime fees earned. Built as a data-dense, professional dashboard optimized for financial metrics visualization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework Stack**
- **React 18 with TypeScript** - Type-safe component development with modern React patterns
- **Vite** - Fast build tool and development server with hot module replacement
- **Wouter** - Lightweight client-side routing library for single-page navigation
- **TanStack Query (React Query)** - Server state management with automatic caching and background refetching

**Design System & UI**
- **shadcn/ui + Radix UI** - Accessible component primitives with custom styling
- **Tailwind CSS** - Utility-first CSS framework with custom design tokens
- **Typography System** - Inter font family optimized for data density and financial dashboards
  - Tabular numbers (`font-variant-numeric: tabular-nums`) for aligned numerical columns
  - Consistent type scale with specific weights for headers, metrics, and table data
- **Theme System** - Dark/light mode support via CSS variables with localStorage persistence
- **Spacing System** - 4px/8px grid-based spacing primitives (Tailwind units: 2, 4, 6, 8)

**State Management**
- Server state: React Query with infinite stale time and 5-minute cache duration
- UI state: React Context (ThemeProvider) and local component state (useState)
- No global state library - simple prop drilling for component communication
- Theme preference persisted to browser localStorage

**Component Architecture**
- Feature components: `client/src/components/dashboard/` (Header, MetricCards, LeaderboardTable, SearchBar, LPProfileModal)
- UI primitives: `client/src/components/ui/` (shadcn/ui components)
- Custom hooks: `use-leaderboard.ts` (data fetching), `use-mobile.tsx` (responsive breakpoints), `use-toast.ts` (notifications)
- Path aliases configured: `@/` for client source, `@shared/` for shared schemas

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript running on Node.js
- HTTP server created via `http.createServer()` for potential WebSocket upgrades
- Middleware: JSON body parser with raw body preservation for webhook support

**API Design**
- RESTful JSON API endpoints under `/api/` prefix
- Key endpoints:
  - `GET /api/leaderboard` - Returns ranked list of liquidity providers
  - `GET /api/stats` - Returns protocol-wide statistics (TVL, volume, unique LPs)
  - `GET /api/lp/:wallet` - Returns detailed profile for specific LP (positions, charts, history)
- Request/response logging with timing metrics
- In-memory caching with 5-minute TTL to reduce external API calls

**Data Fetching Strategy**
- Dune Analytics integration via `@duneanalytics/client-sdk`
- Query ID: 6262729 for leaderboard data
- Caching layer: Server-side in-memory cache with timestamp-based invalidation
- Data transformation: Maps Dune query results to typed TypeScript schemas

**Development vs Production**
- Development mode: Vite middleware for HMR and live reloading
- Production mode: Serves static build from `dist/public`
- Build process: Separate Vite (client) and esbuild (server) builds
- Server bundling: Selected dependencies bundled to reduce cold start times

### Data Layer

**Schema Design**
- **Drizzle ORM** - TypeScript-first ORM with Zod schema validation
- **Database**: PostgreSQL via Neon serverless driver (`@neondatabase/serverless`)
- **Schema validation**: `drizzle-zod` for automatic Zod schema generation from Drizzle tables
- Shared schema types exported from `shared/schema.ts`:
  - `LeaderboardEntry` - Rank, wallet, positions, volume, fees
  - `ProtocolStats` - Total TVL, 24h volume, unique LP count
  - `LPProfile` - Detailed LP data with positions and historical metrics
  - `Position` - Individual pool position data
  - `User` - Basic user authentication schema (currently unused)

**Type Safety**
- End-to-end type safety from database to frontend
- Zod schemas for runtime validation
- TypeScript inference for compile-time type checking
- Shared types between client and server via `@shared/` alias

### Build System

**Development Workflow**
- Single command: `npm run dev` starts Express server with Vite middleware
- Hot module replacement for instant client updates
- TypeScript type checking without emit
- Vite plugins: React, runtime error overlay, Replit-specific tooling

**Production Build**
- Two-stage build process (`npm run build`):
  1. Vite builds client into `dist/public`
  2. esbuild bundles server into `dist/index.cjs`
- Server bundling strategy: Allowlist specific dependencies for bundling to optimize cold starts
- Output: Single CJS file for server + static assets for client

**Configuration**
- TypeScript: Incremental builds with shared config for client/server
- Module resolution: ESNext with bundler mode
- Path aliases: `@/` (client), `@shared/` (shared schemas), `@assets/` (assets)

## External Dependencies

### Third-Party Services

**Dune Analytics**
- Purpose: Primary data source for leaderboard and LP metrics
- Integration: Official SDK (`@duneanalytics/client-sdk`)
- Authentication: API key via `DUNE_API_KEY` environment variable
- Query ID: 6262729 for trader/LP data
- Data structure: Returns rows with trader_id, trade_count, total_volume_usd

### Database

**Neon Postgres**
- Purpose: Serverless PostgreSQL database
- Driver: `@neondatabase/serverless` with WebSocket support
- Connection: `DATABASE_URL` environment variable required
- ORM: Drizzle with schema defined in `shared/schema.ts`
- Migrations: Managed via `drizzle-kit push`

### UI Component Libraries

**Radix UI Primitives**
- Complete set of unstyled, accessible components
- Used components: Dialog, Dropdown, Tooltip, Tabs, Toast, Select, and 20+ others
- Styling: Wrapped and styled via shadcn/ui conventions with Tailwind

**Supporting Libraries**
- `recharts` - Data visualization (charts in LP profile modal)
- `lucide-react` - Icon system
- `date-fns` - Date formatting and manipulation
- `class-variance-authority` - Component variant management
- `tailwind-merge` + `clsx` - Utility for merging Tailwind classes

### Development Tools

**Replit Platform**
- Vite plugins: Cartographer, dev banner, runtime error modal
- Environment detection via `REPL_ID` variable
- Allowed hosts configuration for Replit domains

**Build Tools**
- Vite: Frontend build tool with React plugin
- esbuild: Server bundling with external dependency management
- TypeScript: Type checking without emit
- PostCSS: Tailwind processing with autoprefixer