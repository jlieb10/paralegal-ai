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

### Development Architecture Modes

#### Frontend Development Mode (`pnpm run dev:frontend`)
```
┌─────────────────────┐
│   Landing Page      │ ← Only this runs
│   (Next.js)         │ 
│   Port 3000         │ ← Uses mock data for demo
└─────────────────────┘
```
- **Use for**: UI development, component work, frontend testing
- **Resources**: ~200MB RAM, no Docker needed
- **Setup time**: 2-3 seconds

#### Backend Development Mode (`pnpm run dev:backend`)
```
┌─────────────────────┐    ┌──────────────────────┐
│   Bridge Service    │    │  Summarizer Service  │
│   (NestJS)         │    │  (FastAPI/Python)   │
│   Port 8002         │    │   Port 8001          │
└─────────────────────┘    └──────────────────────┘
```
- **Use for**: API development, service integration testing
- **Resources**: ~500MB RAM, no LLM containers
- **Setup time**: 10-15 seconds

#### Full Stack Development Mode (`pnpm run dev`) 
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
│   Summary View      │    │ Query Firewall      │    │   (Docker vLLM)      │
│   Contract Flags    │    │ Audit Logging       │    │   Port 8001/8003     │
└─────────────────────┘    └─────────────────────┘    └──────────────────────┘
                                     │                          │
                                     ▼                          ▼
                           ┌─────────────────────┐    ┌──────────────────────┐
                           │    PostgreSQL       │    │      MinIO           │
                           │    (Database)       │    │   (File Storage)     │
                           │    Port 5432        │    │   Port 9000/9001     │
                           └─────────────────────┘    └──────────────────────┘
```
- **Use for**: Complete system testing, LLM integration, full workflow testing  
- **Resources**: 2-4GB RAM, requires Docker
- **Setup time**: 3-30 minutes (depending on Docker image cache)

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

#### Required for All Development
- **Node.js 20+** - Runtime for TypeScript services
- **pnpm 9+** - Package manager (required, not npm/yarn)  

#### Required for Full Stack Development
- **Docker & Docker Compose** - For LLM services and infrastructure
- **Python 3.11+** - Runtime for summarizer service
- **4+ GB free disk space** - Docker images for LLM services
- **8+ GB RAM recommended** - For running LLM inference

#### Optional
- **GPU with CUDA** - For accelerated Private LLM inference

```bash
# Check versions
node --version    # Should be 20+
pnpm --version    # Should be 9+
python --version  # Should be 3.11+ (full stack only)
docker --version  # Required for full stack
docker compose version
```

### Installation Options

Choose your development approach:

#### Option A: Frontend Development Only (Fast Setup)
Perfect for UI work, component development, or frontend-focused contributions:

```bash
# 1. Clone and setup
git clone https://github.com/jlieb10/paralegal-ai.git
cd paralegal-ai
pnpm install

# 2. Build shared packages  
pnpm run build

# 3. Start landing page only
cd apps/landing && pnpm run dev

# ✅ Ready at http://localhost:3000 (demo mode with mock data)
```

#### Option B: Full Stack Development (Complete Setup)
Required for backend work, AI features, or complete system testing:

```bash  
# 1. Clone and setup
git clone https://github.com/jlieb10/paralegal-ai.git
cd paralegal-ai
pnpm install

# 2. Copy environment configuration
cp .env.example .env

# 3. Run environment checks
pnpm run doctor

# 4. Build all services
pnpm run build

# 5. Start complete system (⚠️ Downloads ~3GB+ Docker images first time)
pnpm run dev

# ✅ Services will be available at:
# - Landing Page: http://localhost:3000  
# - Bridge API: http://localhost:8002
# - Summarizer: http://localhost:8001
# - Ingestion: http://localhost:4001
```

**⏱️ Expected Setup Times:**
- Frontend only: **2-3 minutes**
- Full stack (first time): **15-30 minutes** (includes Docker image downloads)
- Full stack (subsequent): **3-5 minutes**

## 🚀 Development

### Development Modes

#### Frontend-Only Development (Recommended for UI work)

Work on the landing page, components, and frontend features without running the full infrastructure:

```bash
# Start just the frontend (uses mock data)
cd apps/landing && pnpm run dev

# Available at:
# - Main page: http://localhost:3000
# - Demo interface: http://localhost:3000/demo
```

**Benefits:**
- ⚡ **Fast startup** (2-3 seconds)
- 💾 **Low resource usage** (no Docker containers)
- 🔧 **Perfect for**: UI development, component work, styling, frontend testing

#### Individual Service Development

Run specific services for focused backend development:

```bash
# Landing page only (port 3000)
cd apps/landing && pnpm run dev

# Bridge API only (port 8002) - requires build first
cd apps/bridge && pnpm run start:dev     

# Summarizer only (port 8001) - requires Python setup
cd apps/summarizer && pnpm run dev
```

#### Full Stack Development

Run the complete system for end-to-end development and testing:

```bash
# ⚠️ Warning: Downloads 3GB+ Docker images on first run
pnpm run dev
```

**What this starts:**
- 🌐 Landing Page (http://localhost:3000)
- 🌉 Bridge API (http://localhost:8002)  
- 🤖 Summarizer Service (http://localhost:8001)
- 📨 Ingestion Service (http://localhost:4001)
- 🧠 Private LLM (Docker containers with CPU fallback)

**System Requirements:**
- 8GB+ RAM recommended
- 4GB+ free disk space
- Docker running and accessible

### Available Development Scripts

| Command | Purpose | Resources | Setup Time | Use Case |
|---------|---------|-----------|------------|----------|
| `pnpm run dev:frontend` | Landing page only | Low (~200MB) | 2-3 sec | UI/component development |
| `pnpm run dev:api` | Bridge API only | Medium (~300MB) | 10-15 sec | API development |
| `pnpm run dev:backend` | Bridge + Summarizer | Medium (~500MB) | 15-30 sec | Backend integration |
| `pnpm run dev` | Full stack | High (~2-4GB) | 3-30 min | Complete system testing |
| `pnpm run dev:llm:cpu` | LLM services only | High (~1-2GB) | 5-15 min | LLM development |
| `pnpm run dev:llm:gpu` | LLM with GPU | High (~1-2GB) | 5-15 min | GPU-accelerated LLM |
| `docker compose up` | Production mode | Highest | 5-45 min | Production testing |

#### Quick Commands Reference

```bash
# Fast development (recommended for most work)
pnpm run dev:frontend        # Just the UI with mock data

# API development  
pnpm run dev:api            # Just the Bridge service
pnpm run dev:backend        # Bridge + Summarizer APIs

# Full system (when you need everything)
pnpm run dev                # Complete stack (downloads Docker images)

# LLM-specific development
pnpm run dev:llm:cpu        # CPU-only LLM (faster startup)
pnpm run dev:llm:gpu        # GPU-accelerated LLM
pnpm run dev:llm:down       # Stop LLM containers

# Production testing
docker compose up --build   # Full production environment
```

### Production Build & Start

```bash
# Build all services
pnpm run build

# Start production frontend only (fastest)
pnpm run start:prod

# OR start with full Docker infrastructure
docker compose up --build
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

### Development with Docker (Optional)

For development that requires the complete infrastructure (LLM services, database, etc.):

```bash
# Full development infrastructure with private LLM
docker compose -f infra/docker-compose.mono.yml up -d --build

# ⚠️ Note: Downloads 3GB+ images on first run
# ⚠️ Requires: 8GB+ RAM, 4GB+ disk space
```

**Service URLs:**
- **Landing Page**: http://localhost:3000  
- **Bridge API**: http://localhost:8002/api
- **Summarizer**: http://localhost:8001
- **MinIO Console**: http://localhost:9001
- **PostgreSQL**: localhost:5432

### Production Docker Deployment

#### Simple Production (Docker Compose)
For small deployments, solo practitioners:

```bash
# Start all production services
docker compose up --build

# Access at http://localhost:3000
```

#### Full Infrastructure (All Services)
For production with complete infrastructure:

```bash
# Complete production setup with database, storage, LLM
docker compose -f infra/docker-compose.mono.yml up -d --build
```

### Docker Development Commands

```bash
# Start LLM services only (for backend development)
pnpm run dev:llm          # GPU-enabled LLM
pnpm run dev:llm:cpu      # CPU-only LLM (faster startup)
pnpm run dev:llm:down     # Stop LLM services

# Monitor containers
docker compose logs -f landing    # Follow logs
docker compose ps                 # List running services
docker compose down               # Stop all services

# Clean up resources
docker compose down -v            # Stop and remove volumes
docker system prune -a            # Clean all unused Docker resources
```

## 🔧 Troubleshooting

### Development Setup Issues

#### "pnpm run dev is too slow / downloading huge files"

The full development mode downloads Docker images for LLM services (~3GB+). For most development work, use frontend-only mode instead:

```bash
# Instead of: pnpm run dev
# Use this for UI work:
cd apps/landing && pnpm run dev
```

#### "Docker containers taking too much resources"

The full stack uses Docker containers for LLM inference. Consider these alternatives:

```bash
# Stop LLM containers to save resources
pnpm run dev:llm:down

# Or start only specific services
cd apps/landing && pnpm run dev  # Frontend only
cd apps/bridge && pnpm run start:dev   # API only
```

#### "Cannot connect to services"

Different development modes expose different services:

| Development Mode | Available Services | URLs |
|-----------------|-------------------|------|
| Frontend Only | Landing page with mock data | http://localhost:3000 |
| Individual Services | Varies by service started | Check service logs |
| Full Stack | All services + LLM | All URLs listed below |

### Service Connection Issues

#### Port Already in Use
```bash
# Find process using port
lsof -ti:3000

# Kill process
kill $(lsof -ti:3000)

# Or change port
PORT=3001 pnpm run start:prod
```

#### Docker Services Not Starting
```bash
# Check Docker is running
docker ps

# Clean Docker cache if builds fail
docker system prune -a

# Rebuild without cache
docker compose up --build --no-cache

# Check specific service logs
docker compose logs landing
```

### Environment & Setup Issues

#### Node Version Mismatch
```bash
# Using nvm
nvm install 20
nvm use 20

# Or update system Node.js to 20+
```

#### Missing Environment Variables
```bash
# Copy example file
cp .env.example .env

# Run environment doctor
pnpm run doctor

# Check what features are disabled
pnpm run start:prod  # Look for console warnings
```

#### CSS Not Loading After Build
```bash
# Clear Next.js cache
rm -rf apps/landing/.next

# Rebuild
pnpm run build

# Check import paths in CSS files
```

### Build & Infrastructure Issues

#### Build Errors
```bash
# Clean all build outputs
pnpm run clean

# Check types first
pnpm run typecheck

# Rebuild incrementally
pnpm run build
```

#### Python Service Issues (Summarizer)
```bash
# Check Python version
python --version  # Should be 3.11+

# Manual setup if automated setup fails
cd apps/summarizer
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Start manually
cd src && python -m uvicorn summarizer.main:app --reload --port 8001
```

#### Docker Image Download Timeout
```bash
# If Docker image downloads timeout, try:
# 1. Check your internet connection
# 2. Restart Docker daemon
# 3. Use CPU-only mode (faster download)
pnpm run dev:llm:cpu

# 4. Or skip LLM entirely for frontend development
cd apps/landing && pnpm run dev
```

### Performance & Resource Issues

#### High Memory Usage During Development
The full stack development environment can use significant resources:

- **Frontend only**: ~200MB RAM
- **Frontend + API**: ~500MB RAM  
- **Full stack**: ~2-4GB RAM (including LLM containers)

**Optimization strategies:**
```bash
# 1. Use frontend-only development when possible
cd apps/landing && pnpm run dev

# 2. Stop unused Docker containers
docker compose down

# 3. Use CPU-only LLM (smaller memory footprint)
pnpm run dev:llm:cpu

# 4. Monitor resource usage
docker stats
```

### Quick Development Mode Reference

| Use Case | Command | Resource Usage | Setup Time |
|----------|---------|---------------|------------|
| **UI/Frontend work** | `cd apps/landing && pnpm run dev` | Low (~200MB) | 2-3 seconds |
| **API development** | `cd apps/bridge && pnpm run start:dev` | Medium (~500MB) | 10-15 seconds |
| **Full system testing** | `pnpm run dev` | High (~2-4GB) | 3-30 minutes |
| **Production testing** | `docker compose up --build` | Highest | 5-45 minutes |

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