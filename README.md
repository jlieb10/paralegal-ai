# Paralegal AI

Privacy-first email summarization for law firms. Process client communications without exposing sensitive information to external APIs.

## 🔒 Privacy-First Architecture

- **Private LLM**: All email content processed locally with no internet egress
- **Bridge Service**: Optional fact-checking with PII redaction and allowlisted templates
- **Audit Trail**: Cryptographic hash chaining for tamper detection
- **Zero Data Exposure**: Attorney-client privilege maintained at all times

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Python 3.11+
- Docker & Docker Compose (for production deployment)
- Optional: GPU for Private LLM

### 1. Clone and Install
```bash
git clone https://github.com/jlieb10/paralegal-ai.git
cd paralegal-ai
pnpm install
```

### 2. Build Services
```bash
pnpm run build
```

### 3. Run Tests & Linting (Local Development)
```bash
# Lint all code
pnpm run lint

# Run core tests (schemas + bridge service)
pnpm run test

# Run all tests including landing page (may require additional setup)
pnpm run test:all
```

### 4. Local Development
```bash
# Start individual services in development mode
cd apps/bridge && pnpm run start:dev     # NestJS API server
cd apps/landing && pnpm run dev          # Next.js frontend
# Note: Summarizer and Private LLM require Docker for full setup
```

### 5. Production Deployment (Docker)
```bash
# Start all services with Docker Compose
docker compose -f infra/docker-compose.mono.yml up -d --build
```

**Note**: Docker builds may require network configuration in some environments. Local development with `pnpm` works reliably.

### 6. Access Services
- **Landing Page**: http://localhost:3000
- **Demo**: http://localhost:3000/demo  
- **Bridge API**: http://localhost:8002/api
- **Summarizer**: http://localhost:8001 (Docker only)
- **MinIO Console**: http://localhost:9001 (Docker only)

## 🏗 Architecture

```
[Email] → [Ingestion] → [Summarizer] → [Private LLM] → [Summary + Spans]
                             ↓
                        [Bridge] → [Connected LLM] (optional, redacted only)
                             ↓
                        [Audit Log] (hash-chained)
```

## 🔐 Key Features

### Privacy & Compliance
- **No External API Calls**: Private LLM processes all content locally
- **Network Isolation**: Private services have no internet access
- **PII Redaction**: Automatic removal of emails, names, amounts, dates
- **Template-Only Queries**: Bridge enforces allowlisted query templates
- **Audit Logging**: Cryptographic integrity with hash chaining

### Legal Intelligence
- **Contract Flagging**: Identifies 14 types of contract terms
- **Span Linking**: Exact byte-offset mapping to source text
- **Risk Assessment**: HIGH/MEDIUM/LOW severity levels
- **Deadline Tracking**: Automatic date extraction and alerts

### Technical Excellence
- **Deterministic Output**: Consistent results with provenance tracking
- **Health Checks**: Full service monitoring
- **Type Safety**: TypeScript + Python type hints throughout
- **Test Coverage**: Comprehensive test suite with policy validation

## 📊 Sample Output

```json
{
  "email_id": "msg-123",
  "summary_bullets": [
    {
      "text": "Counterparty proposes liability cap of 1x fees.",
      "spans": [{"start": 1532, "end": 1598}],
      "anchors": ["#para-12"]
    }
  ],
  "flags": [
    {
      "type": "LIABILITY_CAP",
      "term": "1x fees", 
      "severity": "HIGH",
      "spans": [{"start": 1532, "end": 1598}],
      "anchors": ["#para-12"]
    }
  ],
  "provenance": {
    "email_sha256": "abc123...",
    "generated_at": "2024-08-16T22:00:00Z",
    "private_model": "llama-3.1-70b-instruct"
  }
}
```

## 🧪 Testing

```bash
# Run all tests
pnpm run test
pytest -q

# Run policy tests specifically
pnpm run test:policy

# Run with coverage
pnpm run test -- --coverage
```

## 🚀 Deployment

### Individual (Docker Compose)
Perfect for solo practitioners or small firms:
```bash
docker compose -f infra/docker-compose.mono.yml up -d
```

### Enterprise (Kubernetes)
For larger firms with dedicated infrastructure teams:
- See `docs/deploy-enterprise.md`
- Terraform modules for AWS/GCP/Azure
- Network isolation and policy enforcement

## 📚 Documentation

- [Security & Compliance](docs/security.md) - GDPR, privacy, audit controls
- [Agent Architecture](AGENTS.md) - Technical specifications
- [Development Guide](.github/copilot-instructions.md) - Contributor guidelines

## 🛡 Security

Paralegal AI implements defense-in-depth privacy controls:

- **Network Isolation**: Private LLM has no default route or NAT gateway
- **DNS Blocking**: External LLM domains blocked at container level  
- **Payload Limits**: 512 character maximum for Bridge queries
- **Template Enforcement**: Only CFR, CPLR, and UK case lookups allowed
- **Audit Chain**: Every Bridge interaction cryptographically logged

## ⚖️ Legal Compliance

- **Attorney-Client Privilege**: Maintained - no third-party processing
- **Work Product Doctrine**: Protected - all analysis done locally
- **GDPR Article 32**: Technical measures implemented
- **Data Minimization**: Only processes necessary content
- **Retention Controls**: Configurable data lifecycle management

## 🤝 Contributing

This is a privacy-critical system for legal environments. All contributions must:

1. Include comprehensive tests
2. Maintain zero external data exposure
3. Follow existing architecture patterns
4. Document security implications

See [AGENTS.md](AGENTS.md) for detailed development guidelines.

## 📄 License

[License information would go here]

---

**Built for law firms that take client confidentiality seriously.** 🏛️

For support: [support information would go here]