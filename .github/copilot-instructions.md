# Paralegal AI - GitHub Copilot Instructions

**CRITICAL**: Always reference these instructions first and fallback to additional search or context gathering ONLY if the information here is incomplete or found to be in error.

Paralegal AI is a privacy-first, test-first, policy-gated agentic system for legal document analysis. The system processes emails and documents through private LLMs with strict redaction and audit controls.

## Core Architecture & Principles

**ALWAYS follow these principles:**
- Privacy/Compliance First: Private LLM has no internet egress
- Test-First Development: Every change requires tests (unit + policy + integration)
- Policy-Gated: All external lookups go through the Bridge with redaction
- Deterministic Outputs: Include byte-offset spans and stable HTML anchors

## Repository Structure

This is a monorepo with the following structure:

```
/apps
  /ingestion       # Outlook/Gmail webhooks/IMAP, normalization
  /summarizer      # FastAPI (Python) orchestrating Private LLM
  /bridge          # NestJS (TS): redaction + query firewall + audit chain
  /private-llm     # vLLM server config (no internet egress)
  /connected-llm   # Thin clients for external providers (optional)
  /landing         # Next.js + Tailwind + shadcn/ui
/packages
  /schemas         # zod (TS) + pydantic (Py) mirrored schemas
  /ui              # shared UI components
/docs              # security/deployment documentation
/tests             # redaction, policy, summaries (golden), integration
```

## Technology Stack & Requirements

**Development Environment Setup:**
- Node.js 20+ 
- pnpm 9+ (package manager - REQUIRED, not npm or yarn)
- Python 3.11+
- Docker (with Docker Compose)
- Optional: GPU for Private LLM
- Optional: uv or pip-tools for Python lockfiles (preferred over pip)

**Package Manager Commands:**
```bash
# Install pnpm if not available
npm install -g pnpm

# Verify versions
node --version  # Should be 20+
pnpm --version  # Should be 9+
python --version  # Should be 3.11+
docker --version
docker compose version
```

## Build & Development Commands

**CRITICAL TIMING NOTES:**
- Build operations may take 15-45 minutes - NEVER CANCEL builds
- Test suites may take 10-30 minutes - NEVER CANCEL tests  
- Always set timeouts to 60+ minutes for builds, 45+ minutes for tests

### Initial Setup & Build

**Bootstrap the repository:**
```bash
# Install dependencies - takes 2-5 minutes
pnpm i

# Build all packages - takes 15-45 minutes. NEVER CANCEL. Set timeout to 60+ minutes.
pnpm -w run build

# Start infrastructure - takes 5-10 minutes
docker compose -f infra/docker-compose.mono.yml up -d --build
```

**WARNING**: The `docker compose` command references `infra/docker-compose.mono.yml` which may not exist in early development phases. Check for alternative Docker configurations if this fails.

### Testing Commands

**TypeScript Testing:**
```bash
# Lint TypeScript code - takes 1-3 minutes
pnpm -w run lint

# Run unit tests - takes 5-15 minutes. NEVER CANCEL. Set timeout to 30+ minutes.
pnpm -w run test

# Run policy tests - takes 2-5 minutes
pnpm -w run test:policy

# Run integration tests - takes 10-20 minutes. NEVER CANCEL. Set timeout to 30+ minutes.
pnpm -w run test:integration

# Run end-to-end UI tests - takes 5-15 minutes
pnpm -w run test:e2e
```

**Python Testing:**
```bash
# Run Python tests - takes 5-10 minutes. NEVER CANCEL. Set timeout to 20+ minutes.
pytest -q --maxfail=1 --disable-warnings

# Lint Python code - takes 1-2 minutes
ruff check .

# Format check Python code - takes 1-2 minutes
black --check .
```

**Complete test suite (run before committing):**
```bash
# Run all tests in parallel - takes 15-30 minutes. NEVER CANCEL. Set timeout to 45+ minutes.
pnpm -w run lint && pnpm -w run test && pytest -q
```

## Development Workflows

### Code Style & Standards

**TypeScript:**
- Use 2-space indentation
- Explicit exports, no default exports in libraries
- ESLint + Prettier for formatting
- JSDoc for all public functions

**Python:**
- Type hints mandatory
- 4-space indentation (2-space for YAML)
- ruff + black for linting/formatting
- Docstrings for all public functions

**React/Next.js:**
- Functional components with hooks
- Small, focused files
- Accessible by default (labels, roles, keyboard navigation)

**Naming Conventions:**
- `camelCase` for variables/functions
- `PascalCase` for components/classes  
- `UPPER_SNAKE_CASE` for constants

### Testing Requirements

**CRITICAL**: All code changes must include tests. No tests = no merge.

**Test Types & Locations:**
- Unit tests: `apps/*/src/**/*.test.ts` or `apps/summarizer/**/*.test.py`
- Policy tests: `/tests/policy/*.test.ts` 
- Redaction tests: `/tests/redaction/*.test.(ts|py)`
- Golden summaries: `/tests/summaries/golden/*.json`
- Integration/E2E: `/tests/integration/*`
- UI tests: Playwright in landing app

**Coverage Requirements:**
- TypeScript services: 95%+ line coverage
- Python code: 95%+ statement coverage
- Policy & redaction suites: 100% coverage for rules

### Pre-commit Validation

**ALWAYS run before committing:**
```bash
# Format and lint all code
pnpm -w run lint
ruff check .
black --check .

# Run relevant test suites
pnpm -w run test
pytest -q --maxfail=1 --disable-warnings

# For UI changes, also run:
pnpm -w run test:e2e
```

## Key Applications & Services

### Summarizer Service (Python/FastAPI)
- Located in `/apps/summarizer`
- Orchestrates private LLM for document analysis
- Produces structured summaries with spans and anchors
- NO internet access - fully offline operation

### Bridge Service (TypeScript/NestJS)  
- Located in `/apps/bridge`
- Handles redaction and query firewall
- Audit trail with hash-chaining
- Only allows allowlisted external queries

### Landing App (Next.js)
- Located in `/apps/landing`
- Next.js + Tailwind CSS + shadcn/ui
- Displays summaries with interactive links to source text
- Accessible UI with proper ARIA labels

### Schema Packages
- Located in `/packages/schemas`
- Mirrored TypeScript (zod) and Python (pydantic) schemas
- Import these instead of hand-rolling types
- Key schemas: SUMMARY_SCHEMA, CONTRACT_FLAGS_SCHEMA, FACT_REQUESTS_SCHEMA

## Validation Scenarios

**ALWAYS test these scenarios after making changes:**

### 1. Document Processing Flow
```bash
# Test document ingestion pipeline
# Upload test legal document (contract, email, etc.)
# Verify summarizer produces structured output with:
#   - summary_bullets with proper spans and anchors
#   - contract flags (HIGH/MEDIUM/LOW severity)
#   - fact_requests for external lookups (if applicable)
# Check that byte-offset spans map correctly to source text
# Ensure HTML anchors link to proper document sections
```

### 2. Redaction & Privacy Validation
```bash
# Test PII redaction before Bridge crossing
# Verify placeholder replacement: [EMAIL], [NAME], [AMOUNT], [DATE], [DOMAIN]
# Check 512-character payload limit enforcement
# Ensure no raw document content in external API calls
# Validate audit logging with hash-chaining
# Test rejection of disallowed templates
```

### 3. Bridge Policy Testing
```bash
# Test allowlisted templates: CFR_SECTION_SUMMARY, CPLR_STANDARD, UK_CASE_CITATION_LOOKUP
# Verify template placeholders work correctly
# Ensure external lookup returns cited answers
# Check that policy violations are caught and logged
```

### 4. UI/Frontend Functionality
```bash
# Test document upload and display in landing app
# Verify summary bullets show clickable 🔗 links
# Check links scroll to correct text excerpts in original document
# Test contract flags appear as chips with proper severity colors
# Ensure keyboard navigation works (accessibility)
# Verify responsive design on different screen sizes
# Test with screen readers (basic accessibility check)
```

### 5. Agent Communication Flow
```bash
# Test Summarizer Agent (Private) → produces bullets with spans
# Test Contract Flagging Agent → identifies legal terms
# Test Bridge Query Planner → converts needs to allowlisted templates
# Test Connected Lookup Executor → returns cited external data
# Test Span/Anchor Mapper → maps bullets to shortest unique spans
# Test complete end-to-end flow from document input to rendered output
```

### 6. Performance & Reliability
```bash
# Test with various document sizes (small email to large contract)
# Verify processing completes within reasonable time limits
# Test error handling for malformed documents
# Check memory usage during large document processing
# Test concurrent document processing if applicable
```

## Security & Privacy Enforcement

**CRITICAL RULES - NEVER VIOLATE:**
- Private LLM must have NO internet egress
- All external queries must go through Bridge with allowlisted templates
- Never pass raw email/document content to external APIs
- All Bridge activity must be audited and hash-chained
- PII must be redacted before crossing network boundaries

**Example of WRONG approach:**
```typescript
// DO NOT DO THIS - leaks content to external API
await http.post(CONNECTED_URL, { text: emailBody }); // ❌
```

**Example of CORRECT approach:**
```typescript
// Uses allowlisted template with placeholders only
await bridge.executeTemplate("CFR_SECTION_SUMMARY", { 
  section: "17 CFR § 240.10b-5" 
});
```

## Key Files & Directories

**Configuration Files (when implemented):**
- `package.json` - Root workspace configuration for pnpm
- `apps/*/package.json` - Individual app configurations
- `infra/docker-compose.mono.yml` - Complete infrastructure setup
- `apps/*/Dockerfile` - Individual service containers
- `pyproject.toml` or `requirements.txt` - Python dependencies

**Important Development Files:**
- `AGENTS.md` - Complete system specifications (READ FIRST)
- `.github/copilot-instructions.md` - This file (development guide)
- `apps/summarizer/main.py` - Python/FastAPI entry point
- `apps/bridge/src/main.ts` - NestJS Bridge service entry
- `apps/landing/pages/index.tsx` - Next.js UI entry point
- `packages/schemas/` - Shared type definitions (zod + pydantic)

**Test Files & Directories:**
- `apps/*/src/**/*.test.ts` - TypeScript unit tests
- `apps/summarizer/**/*.test.py` - Python unit tests  
- `/tests/policy/*.test.ts` - Bridge policy enforcement tests
- `/tests/redaction/*.test.(ts|py)` - PII redaction tests
- `/tests/summaries/golden/*.json` - Expected output fixtures
- `/tests/integration/*` - End-to-end workflow tests

**Frequently Referenced Locations:**
- `/packages/schemas/summary.ts` - Core summary data structures
- `/packages/schemas/flags.ts` - Contract flagging schemas
- `/apps/bridge/src/redaction/` - PII redaction logic  
- `/apps/bridge/src/policy/` - Template allowlist enforcement
- `/apps/landing/components/` - Reusable UI components

## Common Development Tasks

### Adding New Features
1. **Write tests first** - create failing tests for new functionality
2. **Implement minimal code** to make tests pass
3. **Refactor and optimize** while keeping tests green
4. **Update schemas** if data structures change
5. **Add integration tests** for end-to-end workflows

### Debugging Issues
- Check logs in `/apps/*/logs` directories
- Use Docker logs: `docker compose logs [service-name]`
- For Python: Use `pytest -v -s` for verbose test output
- For TypeScript: Use `pnpm -w run test -- --verbose`

### Performance Optimization
- Profile LLM inference times in `/apps/private-llm`
- Monitor Bridge throughput and redaction performance
- Use Playwright for frontend performance testing

## Current Repository State

**WARNING**: As of the current state, this repository contains specifications (AGENTS.md) but no implemented code. Many of the commands listed above cannot be validated until the codebase is implemented.

**Commands that CANNOT be validated in current state:**
- `pnpm i` - will fail (no package.json exists yet)
- `pnpm -w run build` - will fail (no packages to build)
- `docker compose -f infra/docker-compose.mono.yml up -d --build` - will fail (no Docker configuration exists)
- All test commands - will fail (no test infrastructure exists yet)

**When code is implemented, expect these timings:**
- Complete build process: 15-45 minutes
- Full test suite: 15-30 minutes  
- Docker infrastructure startup: 5-10 minutes
- Individual test runs: 2-15 minutes depending on scope

**Development Status Indicators:**
- ✅ Specifications complete (AGENTS.md)
- ❌ Code implementation (pending)
- ❌ Package configuration (pending)
- ❌ Docker infrastructure (pending)
- ❌ Test infrastructure (pending)

## Development Tips

- **Use shared schemas**: Import from `/packages/schemas` rather than duplicating types
- **Write pure functions**: Isolate side effects (network, filesystem) behind interfaces  
- **Co-locate tests**: Place `*.test.ts` files next to implementation files
- **Document security logic**: Add clear comments for redaction and policy code
- **Update golden files**: When changing output formats, update `/tests/summaries/golden/*.json`

## Commit Message Format

Use imperative mood:
- "Add bridge policy tests"
- "Fix span mapping for contract terms" 
- "Update redaction rules for email addresses"

Reference issues and note test updates in commit messages.

---

**Remember**: Privacy first, tests mandatory, policy-gated everything. If it's not tested, it doesn't ship. If it's not redacted, it doesn't cross the Bridge.