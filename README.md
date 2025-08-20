# Paralegal AI

Privacy-first email summarization for law firms. Process privileged communications with private LLMs that never expose sensitive client information to external APIs.

## 🌟 Overview

Paralegal AI is an agentic system designed specifically for law firms to analyze email communications while maintaining absolute client privacy. The system uses a two-box model:

1. **Private LLM Box**: All email content is processed in complete network isolation
2. **Bridge** (Optional): Allows fact-checking using redacted, template-based queries only

**Key Features:**
- 🔒 **Privacy by Design**: No client data ever reaches external APIs
- 📍 **Deterministic Output**: Every bullet point links to exact spans in original emails  
- ⚡ **Contract Intelligence**: Automatically flags liability caps, indemnity clauses, deadlines
- 🛡️ **Enterprise Ready**: Built for strict compliance requirements and zero data exposure

## 🏗️ Architecture

```
┌─────────────────────┐    ┌─────────────────────┐    ┌──────────────────────┐
│   Landing Page      │    │   Bridge Service    │    │  Summarizer Service  │
│   (Next.js)         │◄──►│   (NestJS)         │◄──►│  (FastAPI/Python)   │
│   Port 3000         │    │   Port 8002         │    │   Port 8001          │
└─────────────────────┘    └─────────────────────┘    └──────────────────────┘
           │                         │                          │
           │                         │                          │
           ▼                         ▼                          ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌──────────────────────┐
│   Email Display     │    │ Redaction Engine    │    │    Private LLM       │
│   Summary View      │    │ Query Firewall      │    │   (No Internet)      │
│   Contract Flags    │    │ Audit Logging       │    │   vLLM Server        │
└─────────────────────┘    └─────────────────────┘    └──────────────────────┘
```

### Repository Structure

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

## 💻 Tech Stack

**Frontend:**
- Next.js 14 with TypeScript
- Tailwind CSS + shadcn/ui components
- Framer Motion for animations

**Backend Services:**
- NestJS (TypeScript) - Bridge service
- FastAPI (Python) - Summarizer orchestration
- vLLM - Private LLM inference server

**Infrastructure:**
- Docker & Docker Compose
- pnpm (package manager)
- Node.js 20+, Python 3.11+
- Optional: GPU for Private LLM

**Testing & Quality:**
- Jest (TypeScript), pytest (Python)  
- ESLint, Prettier (TypeScript)
- Ruff, Black (Python)
- Playwright (E2E testing)

## ⚡ Quick Start

### Prerequisites

- **Node.js 20+** - Runtime for TypeScript services
- **pnpm 9+** - Package manager (required, not npm/yarn)
- **Python 3.11+** - Runtime for summarizer service
- **Docker & Docker Compose** - For production deployment
- **Optional: GPU** - For Private LLM acceleration

```bash
# Check versions
node --version    # Should be 20+
pnpm --version    # Should be 9+
python --version  # Should be 3.11+
docker --version
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/jlieb10/paralegal-ai.git
cd paralegal-ai

# 2. Install dependencies
pnpm install

# 3. Copy environment configuration
cp .env.example .env

# 4. Run environment checks
pnpm run doctor

# 5. Build all services
pnpm run build
```

## 🚀 Development

### Running in Development Mode

```bash
# Start all services in development mode
pnpm run dev

# Or start individual services:
cd apps/landing && pnpm run dev          # Next.js frontend (port 3000)
cd apps/bridge && pnpm run start:dev     # NestJS API (port 8002)  
cd apps/summarizer && python -m uvicorn main:app --reload --port 8001
```

**Access Points:**
- **Landing Page**: http://localhost:3000
- **Demo Interface**: http://localhost:3000/demo
- **Bridge API**: http://localhost:8002/api
- **Summarizer API**: http://localhost:8001 (if running)

### Building & Running Production Locally

```bash
# Build all services
pnpm install
pnpm run build

# Start production server
pnpm run start:prod

# Access at http://localhost:3000
```

**One-command production start:**
```bash
pnpm install && pnpm run build && pnpm run start:prod
```

## 🔧 Configuration

### Environment Variables

All environment variables have sensible defaults. The app will start without a `.env` file.

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8002` | Bridge service URL for frontend |
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `8002` (bridge), `3000` (landing) | Service ports |
| `DEBUG` | `true` | Enable debug logging (Python services) |
| `PRIVATE_LLM_URL` | `http://private-llm:8000/v1` | Private LLM endpoint |
| `CONNECTED_LLM_ENABLED` | `false` | Enable external fact-checking |
| `CONNECTED_LLM_URL` | `http://connected-llm:8002` | External LLM endpoint |

### Missing Environment Variables

If `.env` is missing:
- ✅ App still boots with defaults
- ⚠️ Console warnings show which features are disabled
- 🔍 `pnpm run doctor` helps identify missing configuration

## 🧪 Testing

```bash
# Run all tests
pnpm run test          # Core tests (schemas + bridge)
pnpm run test:all      # All packages including landing page
pytest -q              # Python tests

# Specific test suites
pnpm run test:policy   # Bridge policy tests
pnpm run test:e2e      # End-to-end tests

# With coverage
pnpm run test -- --coverage
pytest --cov=.
```

### Adding Tests

- **Unit tests**: `apps/*/src/**/*.test.ts` or `apps/summarizer/**/*.test.py`
- **Policy tests**: `/tests/policy/*.test.ts`
- **Redaction tests**: `/tests/redaction/*.test.(ts|py)`
- **Integration**: `/tests/integration/*`

## 🎨 Code Style & Linting

```bash
# Lint all code
pnpm run lint          # Auto-fix TypeScript issues
ruff check .           # Check Python code
black --check .        # Check Python formatting

# Format code
pnpm run format        # Format TypeScript
black .                # Format Python

# Type checking
pnpm run typecheck     # TypeScript type checking
```

### Pre-commit Checks

Always run before committing:
```bash
pnpm run lint && pnpm run typecheck && pnpm run test
pytest -q --maxfail=1 --disable-warnings
```

## 🐳 Docker Deployment

### Local Production (Docker Compose)

```bash
# Start all services
docker compose up --build

# Access at http://localhost:3000
```

### Individual Service Deployment

Perfect for solo practitioners or small firms:
```bash
# Full infrastructure
docker compose -f infra/docker-compose.mono.yml up -d --build
```

**Service URLs:**
- **Landing Page**: http://localhost:3000  
- **Bridge API**: http://localhost:8002/api
- **Summarizer**: http://localhost:8001
- **MinIO Console**: http://localhost:9001

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -ti:3000

# Kill process
kill $(lsof -ti:3000)

# Or change port
PORT=3001 pnpm run start:prod
```

### Node Version Mismatch
```bash
# Using nvm
nvm install 20
nvm use 20

# Or update system Node.js to 20+
```

### Missing Environment Variables
```bash
# Copy example file
cp .env.example .env

# Run environment doctor
pnpm run doctor

# Check what features are disabled
pnpm run start:prod  # Look for console warnings
```

### CSS Not Loading After Build
```bash
# Clear Next.js cache
rm -rf apps/landing/.next

# Rebuild
pnpm run build

# Check import paths in CSS files
```

### Build Errors
```bash
# Clean all build outputs
pnpm run clean

# Check types first
pnpm run typecheck

# Rebuild incrementally
pnpm run build
```

### Docker Build Issues
```bash
# Clean Docker cache
docker system prune -a

# Build with no cache
docker compose up --build --no-cache

# Check Docker logs
docker compose logs landing
```

## 🤝 Contributing

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes  
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Pull Request Process
1. **Fork & Clone**: Fork the repo and create a feature branch
2. **Implement**: Make minimal, focused changes
3. **Test**: Ensure all tests pass and add new tests for features
4. **Lint**: Run `pnpm run lint && pnpm run typecheck`
5. **Document**: Update README/docs if needed
6. **Submit**: Open PR with clear description

### Code Style
- **TypeScript**: 2-space indentation, explicit exports
- **Python**: 4-space indentation, type hints mandatory
- **Commit Messages**: Imperative mood ("Add feature" not "Added feature")

## 📚 Documentation

- **[Security & Compliance](docs/security.md)** - GDPR, privacy, audit controls
- **[Agent Architecture](AGENTS.md)** - Technical specifications  
- **[Development Guide](.github/copilot-instructions.md)** - Contributor guidelines
- **[Deploy Enterprise](docs/deploy-enterprise.md)** - Kubernetes, Terraform

## 🚀 Deployment

### Production Environments

**Individual (Docker Compose)**
Perfect for solo practitioners or small firms:
```bash
docker compose -f infra/docker-compose.mono.yml up -d
```

**Enterprise (Kubernetes)**  
For larger firms with dedicated infrastructure:
- Terraform modules for AWS/GCP/Azure
- Network isolation and policy enforcement
- See `docs/deploy-enterprise.md`

## 🗺️ Roadmap

### Current: Email Summarization MVP
- ✅ Privacy-first document processing
- ✅ Contract term flagging  
- ✅ Deterministic bullet points with source spans
- ✅ Bridge redaction and audit logging

### Next: Enhanced Intelligence
- [ ] Multi-document analysis
- [ ] Timeline extraction from email chains
- [ ] Advanced contract clause detection
- [ ] Integration with email providers (Outlook, Gmail)

### Future: Full Paralegal Suite  
- [ ] Legal research integration
- [ ] Document drafting assistance
- [ ] Client communication templates
- [ ] Billing time extraction

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues, questions, or contributions:
- 📧 **Email**: [Contact information]
- 🐛 **Bug Reports**: Open GitHub issue with reproduction steps
- 💡 **Feature Requests**: Discuss in GitHub Discussions
- 📖 **Documentation**: Check `/docs` directory first

---

**Built with ❤️ for legal professionals who value client privacy above all else.**