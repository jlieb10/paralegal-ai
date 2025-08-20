import { Test, TestingModule } from "@nestjs/testing";
import { RedactionService } from "../src/redaction/redaction.service";

describe("RedactionService", () => {
  let service: RedactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedactionService],
    }).compile();

    service = module.get<RedactionService>(RedactionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("redact", () => {
    it("should redact email addresses", () => {
      const input = "Contact john.doe@example.com for details.";
      const result = service.redact(input);

      expect(result.redacted_text).toContain("[EMAIL]");
      expect(result.redacted_text).not.toContain("john.doe@example.com");
      expect(result.findings.EMAIL).toHaveLength(1);
      expect(result.findings.EMAIL[0].original).toBe("john.doe@example.com");
    });

    it("should redact dollar amounts", () => {
      const input = "The fee is $10,000.00 for this service.";
      const result = service.redact(input);

      expect(result.redacted_text).toContain("[AMOUNT]");
      expect(result.redacted_text).not.toContain("$10,000.00");
      expect(result.findings.AMOUNT).toHaveLength(1);
    });

    it("should redact dates", () => {
      const input = "Due date is 12/31/2025.";
      const result = service.redact(input);

      expect(result.redacted_text).toContain("[DATE]");
      expect(result.redacted_text).not.toContain("12/31/2025");
      expect(result.findings.DATE).toHaveLength(1);
    });

    it("should redact names (simple pattern)", () => {
      const input = "John Smith will handle this matter.";
      const result = service.redact(input);

      expect(result.redacted_text).toContain("[NAME]");
      expect(result.findings.NAME).toHaveLength(1);
    });

    it("should reject payloads that are too long", () => {
      const longText = "a".repeat(600);
      const result = service.redact(longText);

      expect(result.is_safe).toBe(false);
      expect(result.rejection_reason).toContain("Payload too long");
    });

    it("should accept safe, short text", () => {
      const input = "This is a safe legal query about CPLR § 3211(a)(7).";
      const result = service.redact(input);

      expect(result.is_safe).toBe(true);
      expect(result.rejection_reason).toBeUndefined();
    });
  });
});
