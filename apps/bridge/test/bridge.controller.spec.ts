import { Test, TestingModule } from '@nestjs/testing';
import { BridgeController } from '../src/bridge.controller';
import { QueryService } from '../src/query/query.service';
import { RedactionService } from '../src/redaction/redaction.service';
import { PolicyService } from '../src/policy/policy.service';

describe('BridgeController', () => {
  let controller: BridgeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BridgeController],
      providers: [
        {
          provide: QueryService,
          useValue: {
            executeQuery: jest.fn(),
            getAuditTrail: jest.fn(),
            validateAuditChain: jest.fn(),
          },
        },
        {
          provide: RedactionService,
          useValue: {
            redact: jest.fn(),
          },
        },
        {
          provide: PolicyService,
          useValue: {
            getAllowedTemplates: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BridgeController>(BridgeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const result = await controller.healthCheck();
      expect(result.status).toBe('healthy');
      expect(result.service).toBe('bridge');
    });
  });
});