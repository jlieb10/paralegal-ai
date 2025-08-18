import { Injectable } from '@nestjs/common';

export interface QueryTemplate {
  id: string;
  name: string;
  template: string;
  placeholders: string[];
  maxLength: number;
}

@Injectable()
export class PolicyService {
  private readonly allowedTemplates: Record<string, QueryTemplate> = {
    'CFR_SECTION_SUMMARY': {
      id: 'CFR_SECTION_SUMMARY',
      name: 'CFR Section Summary',
      template: 'Return a one-sentence description of {section} with source link.',
      placeholders: ['section'],
      maxLength: 200
    },
    'CPLR_STANDARD': {
      id: 'CPLR_STANDARD',
      name: 'CPLR Standard',
      template: 'Provide the standard for CPLR § {section} with a short cite.',
      placeholders: ['section'],
      maxLength: 300
    },
    'UK_CASE_CITATION_LOOKUP': {
      id: 'UK_CASE_CITATION_LOOKUP',
      name: 'UK Case Citation Lookup',
      template: 'Return official citation and neutral citation for {case_name} {year}.',
      placeholders: ['case_name', 'year'],
      maxLength: 250
    }
  };

  validateTemplate(templateId: string, placeholders: Record<string, string>): {
    isValid: boolean;
    error?: string;
    template?: QueryTemplate;
  } {
    // Check if template is allowed
    const template = this.allowedTemplates[templateId];
    if (!template) {
      return {
        isValid: false,
        error: `Template '${templateId}' is not in allowlist`
      };
    }

    // Check required placeholders
    const missingPlaceholders = template.placeholders.filter(
      placeholder => !placeholders[placeholder]
    );

    if (missingPlaceholders.length > 0) {
      return {
        isValid: false,
        error: `Missing required placeholders: ${missingPlaceholders.join(', ')}`
      };
    }

    // Check for extra placeholders
    const extraPlaceholders = Object.keys(placeholders).filter(
      key => !template.placeholders.includes(key)
    );

    if (extraPlaceholders.length > 0) {
      return {
        isValid: false,
        error: `Unexpected placeholders: ${extraPlaceholders.join(', ')}`
      };
    }

    // Validate placeholder values
    for (const [key, value] of Object.entries(placeholders)) {
      const validation = this.validatePlaceholderValue(key, value);
      if (!validation.isValid) {
        return {
          isValid: false,
          error: `Invalid placeholder '${key}': ${validation.error}`
        };
      }
    }

    return {
      isValid: true,
      template
    };
  }

  buildQuery(templateId: string, placeholders: Record<string, string>): string {
    const template = this.allowedTemplates[templateId];
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let query = template.template;
    for (const [key, value] of Object.entries(placeholders)) {
      query = query.replace(`{${key}}`, value);
    }

    return query;
  }

  getAllowedTemplates(): QueryTemplate[] {
    return Object.values(this.allowedTemplates);
  }

  private validatePlaceholderValue(key: string, value: string): {
    isValid: boolean;
    error?: string;
  } {
    // Basic validation rules for placeholders
    if (value.length > 100) {
      return {
        isValid: false,
        error: 'Value too long (max 100 characters)'
      };
    }

    // Check for suspicious patterns that might be PII
    const piiPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\$[\d,]+(?:\.\d{2})?/, // Dollar amounts
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    ];

    for (const pattern of piiPatterns) {
      if (pattern.test(value)) {
        return {
          isValid: false,
          error: 'Value appears to contain PII'
        };
      }
    }

    // Key-specific validations
    if (key === 'section') {
      // Legal section format validation
      const sectionPattern = /^(\d+\s+(CFR|CPLR)\s+§?\s*[\d.]+|CPLR\s+§?\s*[\d.]+)/i;
      if (!sectionPattern.test(value)) {
        return {
          isValid: false,
          error: 'Invalid legal section format'
        };
      }
    }

    if (key === 'year') {
      // Year validation
      const year = parseInt(value);
      if (isNaN(year) || year < 1800 || year > new Date().getFullYear()) {
        return {
          isValid: false,
          error: 'Invalid year'
        };
      }
    }

    return { isValid: true };
  }
}