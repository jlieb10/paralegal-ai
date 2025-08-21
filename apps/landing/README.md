# Landing App - Demo Page

This app provides the demo interface for Paralegal AI, showcasing privacy-first email summarization with interactive features.

## Features

### Demo Page (`/demo`)
- **Interactive Summary Bullets**: Clickable bullets that scroll to corresponding text in the original email
- **Contract Flags**: Displays HIGH/MEDIUM/LOW severity flags for legal terms like liability caps, indemnification, deadlines
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Privacy Messaging**: Clear explanation of privacy guarantees and mock data usage

### Visual Design
- **shadcn/ui Components**: Professional styling with proper color schemes
- **Dark Mode**: Elegant dark theme as default
- **Typography**: Clean, readable fonts with proper hierarchy
- **Interactive Elements**: Hover states and focus indicators

## Development

### Setup
```bash
pnpm install
pnpm run build
```

### Development Server
```bash
pnpm run dev  # Runs on http://localhost:3000
```

### Testing

#### Unit Tests (Jest + React Testing Library)
```bash
pnpm run test
```
- Tests all component functionality
- Validates interactive behavior
- Checks accessibility requirements
- Ensures proper content rendering

#### E2E Tests (Playwright)
```bash
pnpm run test:e2e
```
- Visual regression testing
- Cross-browser compatibility (Chrome, Firefox, Safari)
- Mobile responsiveness
- Interactive functionality validation

#### Visual Tests Only
```bash
pnpm run test:visual
```

#### All Tests
```bash
pnpm run test:all
```

### Key Test Files
- `__tests__/demo.test.tsx` - Unit tests for demo page functionality
- `e2e/demo.spec.ts` - End-to-end and visual regression tests
- `e2e/demo.spec.ts-snapshots/` - Visual regression baseline screenshots

## Architecture

### Components Structure
- **Demo Page** (`src/app/demo/page.tsx`): Main demo interface
- **Layout** (`src/app/layout.tsx`): Root layout with dark mode
- **Global Styles** (`src/app/globals.css`): Tailwind CSS with custom variables

### Styling System
- **Tailwind CSS**: Utility-first CSS framework
- **CSS Variables**: Custom design tokens for theming
- **shadcn/ui Design System**: Professional component library patterns
- **Responsive Design**: Mobile-first approach

### Interactive Features
1. **Section Toggle**: Switch between "AI Summary" and "Original Email" views
2. **Link to Source**: Buttons that demonstrate linking from summary bullets to email text
3. **Contract Flag Links**: Buttons showing navigation from flags to relevant email sections
4. **Smooth Animations**: Framer Motion for professional transitions

## Mock Data

The demo uses realistic mock data including:
- Sample legal email from "Sarah Johnson, Partner at Johnson & Associates"
- Contract terms: liability caps, deadlines, indemnification clauses
- Severity flags: HIGH (red), MEDIUM (yellow), LOW (green)
- Bullet points with exact text spans and HTML anchors

## Privacy & Security

- **Mock Data Only**: All content is hardcoded mock data
- **No External APIs**: Demo runs entirely client-side
- **Privacy Messaging**: Clear explanation that production version uses private LLMs
- **Network Isolation**: Demonstrates two-box architecture benefits

## Accessibility

- **WCAG Compliant**: Proper heading hierarchy, accessible names, keyboard navigation
- **Screen Reader Support**: Semantic HTML and ARIA attributes
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Focus Management**: Visible focus indicators throughout

## Browser Support

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile
- **Visual Testing**: Automated across all supported browsers

## Performance

- **Fast Loading**: Optimized bundle with Next.js
- **Smooth Interactions**: 60fps animations with Framer Motion
- **Responsive Images**: Proper loading and sizing
- **Core Web Vitals**: Optimized for Google's performance metrics