# Meteora LP Leaderboard Dashboard - Design Guidelines

## Design Approach

**Selected Approach**: Reference-Based (DeFi Dashboard Pattern) + Material Design System

Drawing inspiration from leading DeFi analytics platforms (DeFiLlama, Dune Analytics, Uniswap Analytics) combined with Material Design's data visualization principles. This approach emphasizes data clarity, scannable metrics, and professional financial interface patterns.

**Key Design Principles**:
- Data hierarchy: Metrics first, then detailed table data
- Glanceability: Users should grasp key stats within 2 seconds
- Professional restraint: Clean, trustworthy interface for financial data
- Performance perception: Instant visual feedback for all interactions

## Typography

**Font Family**: Inter (via Google Fonts CDN) - optimized for financial dashboards and data density

**Type Scale**:
- Headers (H1): 2.5rem (40px), font-weight: 700, tracking: -0.025em
- Metric Values: 2rem (32px), font-weight: 600, tabular-nums
- Metric Labels: 0.875rem (14px), font-weight: 500, uppercase, tracking: 0.05em
- Table Headers: 0.875rem (14px), font-weight: 600, uppercase, tracking: 0.025em
- Table Data: 0.9375rem (15px), font-weight: 400, tabular-nums for numbers
- Search Input: 0.9375rem (15px), font-weight: 400

**Critical**: Use `font-variant-numeric: tabular-nums` for all numerical displays to maintain column alignment.

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8 for consistency
- Component padding: p-6 to p-8
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-6
- Table cell padding: px-6 py-4

**Container Structure**:
- Max-width: max-w-7xl (1280px)
- Dashboard padding: px-4 sm:px-6 lg:px-8
- Vertical rhythm: py-8 for main sections

**Grid System**:
- Metric Cards: `grid grid-cols-1 md:grid-cols-3 gap-6`
- Full-width table container

## Component Library

### Header Component
- Full-width container with bottom border
- Title aligned left with subtle DeFi iconography (optional logo/badge to the left)
- Height: h-16 to h-20
- Include timestamp/last updated indicator on right side in small text

### Metric Cards (3 cards in row)
- Rounded corners: rounded-lg
- Border: 1px solid border treatment
- Padding: p-6
- Structure per card:
  - Label (top): Small caps, muted text
  - Value (prominent): Large, bold, tabular numerals
  - Change indicator: Small text with arrow icon (↑/↓) showing 24h change
- Hover state: subtle elevation/border glow (translate-y-[-2px] transition)

### Search Bar
- Width: max-w-md
- Margin bottom: mb-6
- Height: h-12
- Rounded: rounded-lg
- Icon: Magnifying glass (Heroicons) positioned left with pl-10
- Placeholder: "Search by wallet address..."
- Border on focus with ring treatment

### Leaderboard Table
**Table Container**:
- Rounded corners: rounded-lg
- Border: 1px solid border treatment
- Overflow: overflow-x-auto for mobile responsiveness

**Table Structure**:
- Header: Sticky positioning (sticky top-0), border-bottom, uppercase labels
- Rows: border-b treatment, hover state with subtle background shift
- Cell padding: px-6 py-4
- Font: tabular-nums for all numeric columns

**Column Widths** (approximate):
- Rank: 80px (narrow, right-aligned number with #)
- LP Wallet: 200px (monospace font for wallet addresses)
- Active Positions: 150px (center-aligned)
- 7D Volume: 200px (right-aligned, bold for emphasis)
- Lifetime Fees: 200px (right-aligned, bold for emphasis)

**Sortable Headers**:
- Include sort icon (Heroicons: chevron-up/down) for Rank, 7D Volume, Lifetime Fees
- Clickable with cursor-pointer
- Active sort state shows filled/highlighted icon
- Transition: smooth icon rotation on sort direction change

**Wallet Address Formatting**:
- Use monospace section: `font-mono`
- Display format: "7kF...f3G" (first 3 + ellipsis + last 3)
- Copy-to-clipboard button on hover (small icon button)

**Number Formatting**:
- Currency: "$2,500,000" with commas, no decimals for large numbers
- Use decimals only when value < $1000
- Right-align all numeric columns
- Bold font-weight for volume/fees columns to emphasize earning potential

### Visual Enhancements
- Rank #1-3: Add subtle badge/medal icon (🥇🥈🥉 or styled shapes) next to rank number
- Top 10 rows: Very subtle background tint to differentiate elite performers
- Empty states: Centered message "No results found" with search icon when search yields nothing

### Loading States
- Skeleton screens for metric cards (animated pulse)
- Table skeleton: Show 10 shimmer rows while loading
- Smooth fade-in transition when data loads

## Images
**No hero images needed** - This is a data-focused dashboard. Visual hierarchy comes from data presentation, not imagery.

## Animations
**Minimal, performance-focused**:
- Metric card hover: transform translateY(-2px) with 200ms ease
- Table row hover: 150ms background transition
- Sort icon rotation: 200ms ease when toggling
- Data load: 300ms fade-in opacity transition
- NO scroll animations, parallax, or decorative motion

## Accessibility
- Sortable table headers use aria-sort attributes
- Search input has proper aria-label
- Focus states: 2px ring with offset on all interactive elements
- Keyboard navigation: Full table keyboard support
- Color contrast: Ensure all text meets WCAG AA standards against dark backgrounds