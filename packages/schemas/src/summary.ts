import { z } from "zod";

// Core data structures for spans and anchors
export const Span = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
});

export const SummaryBullet = z.object({
  text: z.string(),
  spans: z.array(Span),
  anchors: z.array(z.string()), // HTML anchor ids like ["#para-12"]
});

export const ContractFlag = z.object({
  type: z.enum([
    "CONTRACT_TERM",
    "LIABILITY_CAP",
    "INDEMNITY",
    "TERMINATION",
    "GOVERNING_LAW",
    "VENUE",
    "ASSIGNMENT",
    "IP_OWNERSHIP",
    "DATA_PROTECTION",
    "FORCE_MAJEURE",
    "PAYMENT_TERMS",
    "AUTO_RENEWAL",
    "NOTICE_PERIODS",
    "DATE_DEADLINE",
  ]),
  term: z.string().optional(),
  date: z.string().optional(), // ISO date string
  severity: z.enum(["HIGH", "MEDIUM", "LOW"]),
  rationale: z.string().optional(),
  spans: z.array(Span),
  anchors: z.array(z.string()),
});

export const FactRequest = z.object({
  template_id: z.enum([
    "CFR_SECTION_SUMMARY",
    "CPLR_STANDARD",
    "UK_CASE_CITATION_LOOKUP",
  ]),
  placeholders: z.record(z.string()),
  bridge_audit_id: z.string().optional(),
  sources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
      }),
    )
    .optional(),
});

export const Provenance = z.object({
  email_sha256: z.string(),
  generated_at: z.string(), // ISO-8601
  private_model: z.string(),
  policy_hash: z.string(),
});

export const Summary = z.object({
  email_id: z.string(),
  summary_bullets: z.array(SummaryBullet),
  flags: z.array(ContractFlag),
  fact_requests: z.array(FactRequest),
  provenance: Provenance,
});

// Type exports
export type SpanT = z.infer<typeof Span>;
export type SummaryBulletT = z.infer<typeof SummaryBullet>;
export type ContractFlagT = z.infer<typeof ContractFlag>;
export type FactRequestT = z.infer<typeof FactRequest>;
export type ProvenanceT = z.infer<typeof Provenance>;
export type SummaryT = z.infer<typeof Summary>;
