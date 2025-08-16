import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { BridgeQueryRequestT, BridgeQueryResponseT } from '@paralegal-ai/schemas';
import { RedactionService } from '../redaction/redaction.service';
import { PolicyService } from '../policy/policy.service';
import { AuditService } from '../audit/audit.service';
import axios from 'axios';

@Injectable()
export class QueryService {
  constructor(
    private readonly redactionService: RedactionService,
    private readonly policyService: PolicyService,
    private readonly auditService: AuditService,
  ) {}

  async executeQuery(request: BridgeQueryRequestT): Promise<BridgeQueryResponseT> {
    // Step 1: Validate template and placeholders
    const validation = this.policyService.validateTemplate(
      request.template_id,
      request.placeholders
    );

    if (!validation.isValid) {
      throw new HttpException(
        `Policy violation: ${validation.error}`,
        HttpStatus.FORBIDDEN
      );
    }

    // Step 2: Build query from template
    const query = this.policyService.buildQuery(
      request.template_id,
      request.placeholders
    );

    // Step 3: Additional redaction check on final query
    const redactionResult = this.redactionService.redact(query);
    if (!redactionResult.is_safe) {
      throw new HttpException(
        `Redaction policy violation: ${redactionResult.rejection_reason}`,
        HttpStatus.FORBIDDEN
      );
    }

    // Step 4: Execute query against connected LLM (if enabled)
    let answer = 'Mock response for MVP';
    let sources = [{ title: 'Mock Source', url: 'https://example.com' }];
    
    const connectedLlmEnabled = process.env.CONNECTED_LLM_ENABLED === 'true';
    if (connectedLlmEnabled) {
      try {
        const response = await this.queryConnectedLLM(redactionResult.redacted_text);
        answer = response.answer;
        sources = response.sources;
      } catch (error) {
        // Log error but don't fail - return mock response
        console.warn('Connected LLM query failed:', error.message);
      }
    }

    // Step 5: Log to audit trail
    const auditId = await this.auditService.logBridgeQuery(
      'bridge-service',
      request.template_id,
      request.placeholders,
      'connected-llm',
      answer
    );

    return {
      answer,
      sources,
      audit_id: auditId
    };
  }

  private async queryConnectedLLM(query: string): Promise<{
    answer: string;
    sources: Array<{ title: string; url: string }>;
  }> {
    const connectedLlmUrl = process.env.CONNECTED_LLM_URL || 'http://connected-llm:8002';
    
    try {
      const response = await axios.post(
        `${connectedLlmUrl}/query`,
        { query },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Connected LLM query failed: ${error.message}`);
    }
  }

  async getAuditTrail(limit?: number) {
    return this.auditService.getEntries(limit);
  }

  async validateAuditChain(): Promise<{ isValid: boolean; merkleRoot: string }> {
    const isValid = await this.auditService.validateChain();
    const merkleRoot = await this.auditService.getMerkleRoot();

    return { isValid, merkleRoot };
  }
}