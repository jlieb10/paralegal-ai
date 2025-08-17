import { Test, TestingModule } from '@nestjs/testing';
import { PolicyService } from '../src/policy/policy.service';

describe('PolicyService', () => {
  let service: PolicyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolicyService],
    }).compile();

    service = module.get<PolicyService>(PolicyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateTemplate', () => {
    it('should accept valid CFR_SECTION_SUMMARY template', () => {
      const result = service.validateTemplate('CFR_SECTION_SUMMARY', {
        section: '17 CFR § 240.10b-5'
      });

      expect(result.isValid).toBe(true);
      expect(result.template).toBeDefined();
      expect(result.template?.id).toBe('CFR_SECTION_SUMMARY');
    });

    it('should accept valid CPLR_STANDARD template', () => {
      const result = service.validateTemplate('CPLR_STANDARD', {
        section: 'CPLR § 3211'
      });

      expect(result.isValid).toBe(true);
      expect(result.template?.id).toBe('CPLR_STANDARD');
    });

    it('should reject unknown template', () => {
      const result = service.validateTemplate('UNKNOWN_TEMPLATE', {
        section: 'test'
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not in allowlist');
    });

    it('should reject missing required placeholders', () => {
      const result = service.validateTemplate('CFR_SECTION_SUMMARY', {});

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Missing required placeholders');
    });

    it('should reject extra placeholders', () => {
      const result = service.validateTemplate('CFR_SECTION_SUMMARY', {
        section: '17 CFR § 240.10b-5',
        extra_field: 'not allowed'
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unexpected placeholders');
    });

    it('should reject placeholders with PII', () => {
      const result = service.validateTemplate('CFR_SECTION_SUMMARY', {
        section: 'Contact john.doe@example.com about 17 CFR § 240.10b-5'
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('appears to contain PII');
    });
  });

  describe('buildQuery', () => {
    it('should build query from template', () => {
      const query = service.buildQuery('CFR_SECTION_SUMMARY', {
        section: '17 CFR § 240.10b-5'
      });

      expect(query).toContain('17 CFR § 240.10b-5');
      expect(query).toContain('one-sentence description');
      expect(query).not.toContain('{section}');
    });
  });

  describe('getAllowedTemplates', () => {
    it('should return all allowed templates', () => {
      const templates = service.getAllowedTemplates();

      expect(templates).toHaveLength(3);
      expect(templates.map(t => t.id)).toEqual([
        'CFR_SECTION_SUMMARY',
        'CPLR_STANDARD',
        'UK_CASE_CITATION_LOOKUP'
      ]);
    });
  });
});