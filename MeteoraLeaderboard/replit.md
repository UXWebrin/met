# Meteora LP Leaderboard Dashboard

## Overview

The Meteora LP Leaderboard Dashboard is a DeFi analytics application that displays rankings and statistics for liquidity providers on the Meteora protocol. The application provides real-time data visualization of top LPs, including their active positions, trading volumes, and lifetime fees earned. Built as a modern web dashboard, it emphasizes data clarity and professional presentation suitable for financial analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, providing fast hot module replacement (HMR)
- **Wouter** for lightweight client-side routing (single-page application pattern)
- **TanStack Query (React Query)** for server state management, data fetching, and caching

**UI Component System**
- **shadcn/ui** component library based on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- **Design System**: Material Design-inspired approach optimized for financial dashboards
  - Custom color system supporting dark/light themes via CSS variables
  - Typography emphasizes data density with Inter font family
  - Tabular numbers (`tabular-nums`) for aligned numerical data
  - Spacing primitives following 4px/8px grid system

**State Management Pattern**
- Server state managed via React Query with infinite stale time
- Local UI state managed via React hooks (useState, useContext)
- Theme preferences persisted to localStorage
- No global state management library (Redux/Zustand) - simple prop drilling and context

**Component Architecture**
- Feature-based organization under `client/src/components/dashboard/`
- Reusable UI primitives in `client/src/components/ui/`
- Custom hooks for data fetching (`use-leaderboard.ts`) and responsive behavior (`use-mobile.tsx`)
- Separation of presentation and data-fetching logic

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript running on Node.js
- HTTP server created via Node's `http.createServer()` for potential WebSocket upgrade capability
- Middleware: JSON body parsing with raw body preservation for webhook verification

**API Design**
- RESTful JSON API pattern
- Three primary endpoints:
  - `GET /api/leaderboard` - Returns array of LP rankings with metrics
  - `GET /api/stats` - Returns protocol-level statistics (TVL, volume, unique LPs)
  - `GET /api/lp/:wallet` - Returns detailed LP profile for a specific wallet
- **Data Source**: Dune Analytics API (query ID: 6262729)
- API responses use Zod schemas for type safety and validation

**Dune API Integration**
- Uses `@duneanalytics/client-sdk` to fetch real on-chain data
- Query ID 6262729 returns Meteora LP trading data
- Field mapping:
  - `trader_id` → wallet address
  - `trade_count` → active positions count
  - `total_volume_usd` → 7-day trading volume
  - `feesLifetime` → estimated as 0.3% of total volume
- 5-minute in-memory cache to reduce API calls
- Stale data fallback on API errors

**Development vs Production**
- Development mode uses Vite middleware for SPA serving with HMR
- Production mode serves pre-built static files from `dist/public`
- Build process bundles server code with esbuild for optimized cold starts
- Selective dependency bundling (allowlist pattern) to reduce syscalls

**Request Logging**
- Custom middleware logs all requests with timing information
- Formatted timestamps and duration tracking
- Special handling for API routes vs static assets

### Data Storage Solutions

**Current Implementation**
- Real-time data fetched from Dune Analytics API (query 6262729)
- In-memory caching with 5-minute TTL
- `MemStorage` class implements basic CRUD operations for user management
- No persistent database connected in current state

**Database Preparation (Configured but Unused)**
- **Drizzle ORM** configured for PostgreSQL
- **Neon Database** serverless PostgreSQL driver included in dependencies
- Schema defined for users table with UUID primary keys
- Migration directory structure in place (`/migrations`)
- Database URL expected via environment variable (`DATABASE_URL`)

**Data Models**
- `LeaderboardEntry`: rank, wallet address, active positions, 7-day volume, lifetime fees
- `ProtocolStats`: total TVL, 24-hour volume, total unique LPs
- `User`: id, username, password (for future authentication)
- Zod schemas provide runtime validation and TypeScript type inference

### Authentication and Authorization

**Current State**
- No active authentication system implemented
- Session management dependencies present but unused:
  - `express-session` with `connect-pg-simple` for PostgreSQL session store
  - `passport` and `passport-local` for local authentication strategy
- Storage layer includes user CRUD methods prepared for future auth implementation

**Prepared Infrastructure**
- User schema with username/password fields
- In-memory user storage with UUID generation
- Session cookie configuration constants defined
- No password hashing currently implemented (security consideration for future)

### External Dependencies

**Core Production Dependencies**
- **@duneanalytics/client-sdk**: Official Dune Analytics TypeScript client for fetching on-chain data
- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon Database
- **drizzle-orm**: TypeScript ORM for database operations
- **express**: Web server framework
- **@tanstack/react-query**: Data synchronization and caching
- **zod**: Schema validation library used across frontend and backend

**UI Component Dependencies**
- **@radix-ui/***: Unstyled accessible component primitives (20+ packages)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **lucide-react**: Icon library optimized for React

**Development Tools**
- **Vite**: Frontend build tool with plugin ecosystem
- **esbuild**: Fast JavaScript bundler for server code
- **TypeScript**: Type system across entire codebase
- **drizzle-kit**: Database migration and schema management CLI

**Build Process**
- Custom build script (`script/build.ts`) orchestrates Vite and esbuild
- Client assets output to `dist/public`
- Server bundle output to `dist/index.cjs` as single file
- Selective dependency bundling reduces deployment size and startup time

**API Services (Not Currently Integrated)**
- Dependencies present but unused: OpenAI, Stripe, Nodemailer, Google Generative AI
- WebSocket support via `ws` package (not implemented)
- File upload capability via `multer` (not implemented)