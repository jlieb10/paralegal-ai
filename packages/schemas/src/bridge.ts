import { z } from "zod";

// Bridge audit log entry
export const AuditLogEntry = z.object({
  id: z.string(),
  timestamp: z.string(), // ISO-8601
  requester_service: z.string(),
  template_id: z.string(),
  placeholders_hash: z.string(),
  model_id: z.string(),
  result_hash: z.string(),
  previous_hash: z.string().optional(), // For hash chaining
  merkle_root: z.string().optional(), // Daily checkpoint
});

// Bridge query request
export const BridgeQueryRequest = z.object({
  template_id: z.enum([
    "CFR_SECTION_SUMMARY",
    "CPLR_STANDARD", 
    "UK_CASE_CITATION_LOOKUP"
  ]),
  placeholders: z.record(z.string()),
});

// Bridge query response
export const BridgeQueryResponse = z.object({
  answer: z.string(),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string(),
  })),
  audit_id: z.string(),
});

// Redaction result
export const RedactionResult = z.object({
  redacted_text: z.string(),
  findings: z.record(z.array(z.object({
    type: z.enum(["EMAIL", "NAME", "AMOUNT", "DATE", "DOMAIN"]),
    original: z.string(),
    placeholder: z.string(),
    start: z.number(),
    end: z.number(),
  }))),
  is_safe: z.boolean(), // true if passes all policy checks
  rejection_reason: z.string().optional(),
});

export type AuditLogEntryT = z.infer<typeof AuditLogEntry>;
export type BridgeQueryRequestT = z.infer<typeof BridgeQueryRequest>;
export type BridgeQueryResponseT = z.infer<typeof BridgeQueryResponse>;
export type RedactionResultT = z.infer<typeof RedactionResult>;