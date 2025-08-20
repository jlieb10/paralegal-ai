import { Module } from "@nestjs/common";
import { BridgeController } from "./bridge.controller";
import { QueryService } from "./query/query.service";
import { RedactionService } from "./redaction/redaction.service";
import { PolicyService } from "./policy/policy.service";
import { AuditService } from "./audit/audit.service";

@Module({
  controllers: [BridgeController],
  providers: [QueryService, RedactionService, PolicyService, AuditService],
  exports: [QueryService, RedactionService, PolicyService, AuditService],
})
export class BridgeModule {}
