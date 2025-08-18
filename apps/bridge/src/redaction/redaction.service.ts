import { Injectable } from '@nestjs/common';
import { RedactionResultT } from '@paralegal-ai/schemas';

export interface RedactionFinding {
  type: 'EMAIL' | 'NAME' | 'AMOUNT' | 'DATE' | 'DOMAIN';
  original: string;
  placeholder: string;
  start: number;
  end: number;
}

@Injectable()
export class RedactionService {
  private readonly patterns = {
    EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    NAME: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Simple name pattern
    AMOUNT: /\$[\d,]+(?:\.\d{2})?/g,
    DATE: /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
    DOMAIN: /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\b/gi
  };

  private readonly maxPayloadLength = 512;

  redact(input: string): RedactionResultT {
    let redactedText = input;
    const findings: Record<string, RedactionFinding[]> = {};

    // Process EMAIL pattern first to avoid conflicts with DOMAIN
    const patternOrder = ['EMAIL', 'NAME', 'AMOUNT', 'DATE', 'DOMAIN'] as const;
    
    // Apply each redaction pattern in order
    for (const type of patternOrder) {
      const pattern = this.patterns[type];
      const matches = Array.from(redactedText.matchAll(pattern));
      findings[type] = [];

      // Process matches in reverse order to maintain positions
      for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i];
        if (match.index !== undefined) {
          const original = match[0];
          const placeholder = this.generatePlaceholder(type);
          
          findings[type].unshift({
            type: type as any,
            original,
            placeholder,
            start: match.index,
            end: match.index + original.length
          });

          // Replace immediately to avoid conflicts
          redactedText = redactedText.substring(0, match.index) + 
                        placeholder + 
                        redactedText.substring(match.index + original.length);
        }
      }
    }

    // Policy checks
    const isSafe = this.validatePolicy(redactedText, findings);
    const rejectionReason = isSafe ? undefined : this.getRejectionReason(redactedText, findings);

    return {
      redacted_text: redactedText,
      findings,
      is_safe: isSafe,
      rejection_reason: rejectionReason
    };
  }

  private generatePlaceholder(type: keyof typeof this.patterns): string {
    // Simple static placeholders for MVP
    return `[${type}]`;
  }

  private getCounters(): Record<string, number> {
    // Simple static counter - in production would use request-scoped counters
    return {};
  }

  private validatePolicy(redactedText: string, findings: Record<string, RedactionFinding[]>): boolean {
    // Check length limit
    if (redactedText.length > this.maxPayloadLength) {
      return false;
    }

    // Check for remaining PII patterns (should be minimal after redaction)
    const remainingEmails = redactedText.match(this.patterns.EMAIL);
    if (remainingEmails && remainingEmails.length > 0) {
      return false;
    }

    // Check for suspicious patterns that might be PII
    const suspiciousPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b\d{16}\b/, // Credit card pattern
      /\b[A-Z]{2}\d{7}\b/ // License pattern
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(redactedText)) {
        return false;
      }
    }

    return true;
  }

  private getRejectionReason(redactedText: string, findings: Record<string, RedactionFinding[]>): string {
    if (redactedText.length > this.maxPayloadLength) {
      return `Payload too long: ${redactedText.length} > ${this.maxPayloadLength} chars`;
    }

    const remainingEmails = redactedText.match(this.patterns.EMAIL);
    if (remainingEmails && remainingEmails.length > 0) {
      return 'Remaining email addresses detected after redaction';
    }

    return 'Policy violation: Potential PII detected in redacted text';
  }
}