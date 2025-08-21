from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class SpanModel(BaseModel):
    """Byte-offset span in normalized plaintext"""
    start: int = Field(ge=0)
    end: int = Field(ge=0)


class SummaryBulletModel(BaseModel):
    """Individual bullet point with source linkage"""
    text: str
    spans: List[SpanModel]
    anchors: List[str]  # HTML anchor ids like ["#para-12"]


class FlagSeverity(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class FlagType(str, Enum):
    CONTRACT_TERM = "CONTRACT_TERM"
    LIABILITY_CAP = "LIABILITY_CAP"
    INDEMNITY = "INDEMNITY"
    TERMINATION = "TERMINATION"
    GOVERNING_LAW = "GOVERNING_LAW"
    VENUE = "VENUE"
    ASSIGNMENT = "ASSIGNMENT"
    IP_OWNERSHIP = "IP_OWNERSHIP"
    DATA_PROTECTION = "DATA_PROTECTION"
    FORCE_MAJEURE = "FORCE_MAJEURE"
    PAYMENT_TERMS = "PAYMENT_TERMS"
    AUTO_RENEWAL = "AUTO_RENEWAL"
    NOTICE_PERIODS = "NOTICE_PERIODS"
    DATE_DEADLINE = "DATE_DEADLINE"


class ContractFlagModel(BaseModel):
    """Contract term or risk flag"""
    type: FlagType
    term: Optional[str] = None
    date: Optional[str] = None  # ISO date string
    severity: FlagSeverity
    rationale: Optional[str] = None
    spans: List[SpanModel]
    anchors: List[str]


class TemplateId(str, Enum):
    CFR_SECTION_SUMMARY = "CFR_SECTION_SUMMARY"
    CPLR_STANDARD = "CPLR_STANDARD"
    UK_CASE_CITATION_LOOKUP = "UK_CASE_CITATION_LOOKUP"


class FactRequestModel(BaseModel):
    """Request for external fact checking via Bridge"""
    template_id: TemplateId
    placeholders: dict[str, str]
    bridge_audit_id: Optional[str] = None
    sources: Optional[List[dict]] = None


class ProvenanceModel(BaseModel):
    """Metadata about summary generation"""
    email_sha256: str
    generated_at: str  # ISO-8601
    private_model: str
    policy_hash: str


class SummaryModel(BaseModel):
    """Complete summary response"""
    email_id: str
    summary_bullets: List[SummaryBulletModel]
    flags: List[ContractFlagModel]
    fact_requests: List[FactRequestModel]
    provenance: ProvenanceModel


class NormalizedEmailModel(BaseModel):
    """Normalized email input for processing"""
    id: str
    plaintext: str
    html_anchors: Dict[str, Dict[str, int]]  # anchor_id -> {start, end}
    metadata: Dict[str, Any]


class SummarizeRequestModel(BaseModel):
    """Request to summarize an email"""
    email: NormalizedEmailModel