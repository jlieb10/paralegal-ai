# Paralegal — AGENTS.md (Copilot Playbook)

**Purpose:** Instruct GitHub Copilot (and humans) how to write code for Paralegal’s agentic system while enforcing **privacy-first**, **test-first**, and **policy-gated** development.

---

## Core Principles

- **Privacy/Compliance First.** Private LLM has **no internet egress**. All external lookups must go through the **Bridge** with redaction + allowlisted templates.
- **Deterministic Outputs.** Summaries must include **byte-offset spans** and **stable HTML anchors** linking bullets to source text.
- **Auditability.** All Bridge activity is **hash-chained** and tested. No payload containing PII may cross the Bridge.
- **Design & UX Matter.** Output and docs must be legible, elegant, and accessible. Small, thoughtful details over brute complexity.
- **Tests Are Mandatory.** Every change ships with tests (unit + policy + integration where relevant). No tests, no merge.

---

## Code Style & Architecture

### Monorepo structure

/apps
/ingestion       # Outlook/Gmail webhooks/IMAP, normalization
/summarizer      # FastAPI (Python) orchestrating Private LLM
/bridge          # NestJS (TS): redaction + query firewall + audit chain
/private-llm     # vLLM server config (no egress)
/connected-llm   # Thin clients for allowed external providers (optional)
/landing         # Next.js + Tailwind + shadcn/ui
/packages
/schemas         # zod (TS) + pydantic (Py) mirrored schemas
/ui              # shared UI components
/docs              # this file + security/deploy docs
/tests             # redaction, policy, summaries (golden), integration

### Languages & conventions
- **TypeScript**: Node 20+, `eslint` + `prettier`. 2-space indent, explicit exports, no default exports in libraries.
- **Python**: 3.11+, `ruff` + `black` + `pytest`. Type hints mandatory. 2-space indent for YAML, 4-space for Python.
- **React/Next**: Functional components, hooks, small files, accessible by default (labels, roles, keyboard nav).
- **Naming**: `camelCase` for variables/functions, `PascalCase` for components/classes, `UPPER_SNAKE` for constants.

### Copilot-friendly patterns
- Write **small, pure functions** with JSDoc/docstrings.
- Co-locate tests with code (`*.test.ts|py`) or in `/tests/...` for integration/policy.
- Use **predictable I/O contracts**: import shared schemas from `/packages/schemas`.

---

## Agent Roster & Responsibilities

1. **Summarizer Agent (Private)**
   - Produces bullets with `{ text, spans:[{start,end}], anchors:[...] }`.
   - Extracts `flags` (contract terms, deadlines, amounts, parties).
   - Emits `FACT_REQUEST`s when law/current events required (no speculation).

2. **Contract Flagging Agent (Private)**
   - Identifies terms: Liability Cap, Indemnity, Termination, Governing Law, Venue, Assignment, IP, Data Protection, Force Majeure, Payment Terms, Auto-renewal, Notice.
   - Returns `{ type, severity: HIGH|MEDIUM|LOW, rationale, spans, anchors }`.

3. **Bridge Query Planner (Private → Bridge)**
   - Converts needs to `{ template_id, placeholders }`. **Never** pass raw email content.

4. **Connected Lookup Executor (Bridge)**
   - Executes allowlisted templates only; returns short, **cited** answers.

5. **Redaction Engine (Bridge)**
   - Replaces PII with typed placeholders: `[EMAIL]`, `[NAME]`, `[AMOUNT]`, `[DATE]`, `[DOMAIN]`.
   - Enforces max outbound payload length (default **512 chars**).

6. **Span/Anchor Mapper (Private)**
   - Maps bullets to **shortest unique** matching spans; anchors to HTML ids.

7. **Renderer (Landing/App)**
   - Bullets show 🔗 that scroll to exact excerpts; flags appear as chips; original email below.

---

## Prompt & Schema Contracts (keep minimal, deterministic)

### System prompts (sketches)

**Summarizer (Private)**

You are Paralegal operating fully offline. Produce concise bullets for parties, asks, dates, amounts, obligations, and risks.
	•	Validate SUMMARY_SCHEMA.
	•	For each bullet provide precise spans and anchors.
	•	Emit FACT_REQUESTS when legal/factual confirmation is needed.
	•	Do not invent facts. Keep quotes short with spans.

**Contract Flagging (Private)**

Identify contract/risk terms. Output CONTRACT_FLAGS_SCHEMA only.
Include {type, severity, rationale, spans, anchors}. No speculation.

**Bridge Planner (Private)**

If external legal/fact confirmation is needed, output FACT_REQUESTS_SCHEMA using ALLOWED_TEMPLATES with placeholders only.
Never include content or PII.

**Connected Lookup (Bridge)**

Given {template_id, placeholders}, return short, factual answer with 1–3 citations.
Output CONNECTED_LOOKUP_SCHEMA only.

### Output schemas (authoritative; mirror in TS+Py)
/packages/schemas:
- `summary.ts` / `summary.py` (SUMMARY_SCHEMA)
- `flags.ts` / `flags.py` (CONTRACT_FLAGS_SCHEMA)
- `facts.ts` / `facts.py` (FACT_REQUESTS_SCHEMA, CONNECTED_LOOKUP_SCHEMA)
- `audit.ts` / `audit.py` (BRIDGE_AUDIT_SCHEMA)

**SUMMARY_SCHEMA (shape)**
```json
{
  "email_id": "string",
  "summary_bullets": [
    {"text":"string","spans":[{"start":0,"end":1}],"anchors":["#para-1"]}
  ],
  "flags": [
    {"type":"CONTRACT_TERM","term":"Liability Cap","severity":"HIGH","spans":[{"start":0,"end":1}],"anchors":["#..."]}
  ],
  "fact_requests": [
    {"template_id":"CFR_SECTION_SUMMARY","placeholders":{"section":"17 CFR § 240.10b-5"}}
  ],
  "provenance": {
    "email_sha256":"string",
    "generated_at":"ISO-8601",
    "private_model":"string",
    "policy_hash":"string"
  }
}


⸻

Redaction & Policy Templates
	•	Allowlist: CFR_SECTION_SUMMARY, CPLR_STANDARD, UK_CASE_CITATION_LOOKUP.
	•	Rejection rules: Any placeholder containing emails, names, long quotes, or numbers that look like monetary amounts/dates → reject.
	•	Max outbound: 512 chars including placeholders.
	•	Audit: Log {time, template_id, placeholders_hash, model, result_hash}, append-only, hash-chained. Daily Merkle root checkpoint.

⸻

Span/Anchor Mapping Rules
	•	Normalize plaintext and build an offset map to HTML anchors (paragraph ids).
	•	For each bullet:
	•	Find shortest unique match; include all relevant ranges if split.
	•	spans are byte offsets into normalized plaintext.
	•	anchors are ids like #para-12, #date-aug-30.

⸻

Testing Requirements (CRITICAL)

All code changes must include tests.

Test Types & Locations
	•	Unit: apps/*/src/**/*.test.ts, apps/summarizer/**/*.test.py
	•	Policy (Bridge): /tests/policy/*.test.ts
	•	Redaction: /tests/redaction/*.test.(ts|py) with before/after fixtures
	•	Summaries (Golden): /tests/summaries/golden/*.json compared byte-for-byte
	•	Integration/E2E: /tests/integration/* (mock Graph/Gmail; replay MIME fixtures)
	•	UI: Playwright for landing app

Coverage Gates
	•	TS services: 95%+ lines; Python: 95%+ statements
	•	Policy & redaction suites must be 100% for rules
	•	CI must run: lint + unit + policy + integration (where changed)

Commands

# TypeScript
pnpm -w run lint
pnpm -w run test
pnpm -w run test:policy
pnpm -w run test:integration

# Python
pytest -q --maxfail=1 --disable-warnings
ruff check .
black --check .

# UI (landing)
pnpm -w run test:e2e

Pre-commit must fail if any gate fails.

⸻

Pull Request Acceptance Criteria
	•	✅ Tests for all new/changed code (unit + policy where applicable)
	•	✅ Golden summary fixtures updated with review (no schema drift)
	•	✅ No external egress from Private LLM in tests (network stubs enforced)
	•	✅ Bridge policy tests prove no PII crosses the firewall
	•	✅ Lint/format pass; clear docs or comments for non-obvious logic
	•	✅ Screenshots or short loom for UI changes (optional but preferred)
	•	✅ Design/UX consistent with repo tokens & components

⸻

AI/Copilot Guidelines
	1.	Generate tests first, then minimal code to pass, then refactor.
	2.	Use shared schemas; don’t hand-roll shapes in multiple places.
	3.	Prefer pure functions; isolate side effects (network, FS) behind interfaces.
	4.	For security logic (redaction/policy/audit), write tests before code and keep logic declarative where possible.
	5.	When adding an allowlisted template, also add:
	•	Policy rule
	•	Redaction test
	•	Integration fixture
	•	Docs entry in docs/agents.md and docs/security.md

Bad

// Leaks content to external API (DO NOT DO THIS)
await http.post(CONNECTED_URL, { text: emailBody }); // ❌

Good

// Uses placeholders via allowlisted template (OK)
await bridge.executeTemplate("CFR_SECTION_SUMMARY", { section: "17 CFR § 240.10b-5" });


⸻

Developer Environment
	•	Node 20+, pnpm 9+; Python 3.11+
	•	pnpm i && pnpm -w run build for TS packages
	•	uv or pip-tools for Python lockfiles preferred
	•	Docker installed (Compose for local), optional GPU for Private LLM

⸻

Commit Messages
	•	Imperative mood: “Add bridge policy tests”
	•	Reference issues, note test updates, keep commits small and meaningful

⸻

Quick Start (Local)

pnpm i
pnpm -w run build
docker compose -f infra/docker-compose.mono.yml up -d --build

# In parallel for tests
pnpm -w run lint && pnpm -w run test && pytest -q


⸻

Appendix: Minimal Schema Snippets (TS)

// /packages/schemas/summary.ts
import { z } from "zod";
export const Span = z.object({ start: z.number().int().nonnegative(), end: z.number().int().nonnegative() });
export const Bullet = z.object({ text: z.string(), spans: z.array(Span).min(1), anchors: z.array(z.string()).min(1) });
export const Flag = z.object({
  type: z.enum(["CONTRACT_TERM","DATE_DEADLINE","AMOUNT","PARTY"]),
  term: z.string().optional(),
  severity: z.enum(["HIGH","MEDIUM","LOW"]),
  spans: z.array(Span).min(1),
  anchors: z.array(z.string()).min(1),
  rationale: z.string().optional(),
});
export const Summary = z.object({
  email_id: z.string(),
  summary_bullets: z.array(Bullet).min(1),
  flags: z.array(Flag).default([]),
  fact_requests: z.array(z.object({ template_id: z.string(), placeholders: z.record(z.string())})).default([]),
  provenance: z.object({
    email_sha256: z.string(),
    generated_at: z.string(),
    private_model: z.string(),
    policy_hash: z.string(),
  })
});
export type SummaryT = z.infer<typeof Summary>;


⸻

Remember: If it isn’t tested, it doesn’t ship. If it isn’t redacted, it doesn’t cross the Bridge.

---

If you want, I can also add a tiny `/packages/schemas` starter (TS + Python) and a `tests/policy/redaction.test.ts` so Copilot has immediate anchors to riff from.