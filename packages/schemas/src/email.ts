import { z } from "zod";

// Email record structure from ingestion
export const EmailRecord = z.object({
  id: z.string(),
  provider_id: z.string(), // Original message ID from provider
  provider: z.enum(["outlook", "gmail", "imap"]),
  from: z.string().email(),
  to: z.array(z.string().email()),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  subject: z.string(),
  date: z.string(), // ISO-8601
  plaintext: z.string(),
  html: z.string().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content_type: z.string(),
    size: z.number(),
    s3_key: z.string().optional(), // MinIO/S3 object key
  })).optional(),
  headers: z.record(z.string()),
  created_at: z.string(), // ISO-8601
  updated_at: z.string(), // ISO-8601
});

// Normalized email for processing
export const NormalizedEmail = z.object({
  id: z.string(),
  plaintext: z.string(),
  html_anchors: z.record(z.object({ // anchor_id -> position mapping
    start: z.number(),
    end: z.number(),
  })),
  metadata: z.object({
    from: z.string(),
    to: z.array(z.string()),
    subject: z.string(),
    date: z.string(),
  }),
});

export type EmailRecordT = z.infer<typeof EmailRecord>;
export type NormalizedEmailT = z.infer<typeof NormalizedEmail>;