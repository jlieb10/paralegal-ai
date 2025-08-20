import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import {
  BridgeQueryRequestT,
  BridgeQueryResponseT,
} from "@paralegal-ai/schemas";
import { QueryService } from "./query/query.service";
import { RedactionService } from "./redaction/redaction.service";
import { PolicyService } from "./policy/policy.service";

@ApiTags("bridge")
@Controller("bridge")
export class BridgeController {
  constructor(
    private readonly queryService: QueryService,
    private readonly redactionService: RedactionService,
    private readonly policyService: PolicyService,
  ) {}

  @Post("query")
  @ApiOperation({ summary: "Execute a fact-checking query through the bridge" })
  @ApiResponse({ status: 200, description: "Query executed successfully" })
  @ApiResponse({ status: 403, description: "Policy violation" })
  async executeQuery(
    @Body() request: BridgeQueryRequestT,
  ): Promise<BridgeQueryResponseT> {
    return this.queryService.executeQuery(request);
  }

  @Post("redact")
  @ApiOperation({ summary: "Test redaction on input text" })
  @ApiResponse({ status: 200, description: "Text redacted successfully" })
  async redactText(@Body() body: { text: string }) {
    return this.redactionService.redact(body.text);
  }

  @Get("templates")
  @ApiOperation({ summary: "Get allowed query templates" })
  @ApiResponse({ status: 200, description: "Templates retrieved successfully" })
  async getTemplates() {
    return {
      templates: this.policyService.getAllowedTemplates(),
    };
  }

  @Get("audit")
  @ApiOperation({ summary: "Get audit trail entries" })
  @ApiResponse({
    status: 200,
    description: "Audit entries retrieved successfully",
  })
  async getAuditTrail(@Query("limit") limit?: string) {
    const numLimit = limit ? parseInt(limit, 10) : undefined;
    return {
      entries: await this.queryService.getAuditTrail(numLimit),
    };
  }

  @Get("audit/validate")
  @ApiOperation({ summary: "Validate audit chain integrity" })
  @ApiResponse({ status: 200, description: "Chain validation completed" })
  async validateChain() {
    return this.queryService.validateAuditChain();
  }

  @Get("health")
  @ApiOperation({ summary: "Health check" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  async healthCheck() {
    return {
      status: "healthy",
      service: "bridge",
      version: "0.1.0",
      privacy: "PII redaction and policy enforcement active",
    };
  }
}
