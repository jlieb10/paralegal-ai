import re
from typing import List, Optional
from .schemas import (
    ContractFlagModel, 
    FlagType, 
    FlagSeverity,
    SpanModel
)
from .linker import SpanLinker


class ContractFlagger:
    """Identifies contract terms and risk flags"""
    
    def __init__(self, plaintext: str, html_anchors: dict[str, dict[str, int]]):
        self.plaintext = plaintext
        self.linker = SpanLinker(plaintext, html_anchors)
        
        # Contract term patterns
        self.patterns = {
            FlagType.LIABILITY_CAP: [
                r'liability.*cap.*\$?([\d,]+)',
                r'limit.*liability.*\$?([\d,]+)',
                r'maximum.*liability.*\$?([\d,]+)'
            ],
            FlagType.INDEMNITY: [
                r'indemnify',
                r'hold.*harmless',
                r'defend.*against'
            ],
            FlagType.TERMINATION: [
                r'terminate.*agreement',
                r'end.*contract',
                r'termination.*clause'
            ],
            FlagType.GOVERNING_LAW: [
                r'governed.*by.*law',
                r'laws.*of.*state',
                r'jurisdiction.*of'
            ],
            FlagType.VENUE: [
                r'venue.*shall.*be',
                r'courts.*of.*jurisdiction',
                r'exclusive.*jurisdiction'
            ],
            FlagType.PAYMENT_TERMS: [
                r'payment.*due.*(\d+).*days',
                r'invoice.*within.*(\d+)',
                r'net.*(\d+).*days'
            ],
            FlagType.DATE_DEADLINE: [
                r'due.*by.*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})',
                r'deadline.*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})',
                r'must.*complete.*by.*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})'
            ]
        }
    
    def flag_contract_terms(self) -> List[ContractFlagModel]:
        """Identify all contract flags in text"""
        flags = []
        
        for flag_type, patterns in self.patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, self.plaintext, re.IGNORECASE)
                for match in matches:
                    flag = self._create_flag(flag_type, match)
                    if flag:
                        flags.append(flag)
        
        return flags
    
    def _create_flag(self, flag_type: FlagType, match: re.Match) -> Optional[ContractFlagModel]:
        """Create a flag from a regex match"""
        start_pos = match.start()
        end_pos = match.end()
        matched_text = match.group(0)
        
        # Create span
        span = SpanModel(start=start_pos, end=end_pos)
        
        # Find closest anchor
        anchor = self.linker._find_closest_anchor(start_pos)
        anchors = [anchor] if anchor else []
        
        # Extract specific values
        term = None
        date = None
        
        if flag_type == FlagType.LIABILITY_CAP and match.groups():
            term = f"${match.group(1)}"
        elif flag_type == FlagType.DATE_DEADLINE and match.groups():
            date = match.group(1)
        
        # Determine severity
        severity = self._determine_severity(flag_type, matched_text)
        
        # Generate rationale
        rationale = self._generate_rationale(flag_type, matched_text)
        
        return ContractFlagModel(
            type=flag_type,
            term=term,
            date=date,
            severity=severity,
            rationale=rationale,
            spans=[span],
            anchors=anchors
        )
    
    def _determine_severity(self, flag_type: FlagType, text: str) -> FlagSeverity:
        """Determine flag severity based on type and content"""
        high_risk_types = {
            FlagType.LIABILITY_CAP,
            FlagType.INDEMNITY,
            FlagType.TERMINATION
        }
        
        medium_risk_types = {
            FlagType.DATE_DEADLINE,
            FlagType.PAYMENT_TERMS,
            FlagType.GOVERNING_LAW,
            FlagType.VENUE
        }
        
        if flag_type in high_risk_types:
            return FlagSeverity.HIGH
        elif flag_type in medium_risk_types:
            return FlagSeverity.MEDIUM
        else:
            return FlagSeverity.LOW
    
    def _generate_rationale(self, flag_type: FlagType, text: str) -> str:
        """Generate explanation for why this was flagged"""
        rationales = {
            FlagType.LIABILITY_CAP: "Liability limitation clause requires review for adequacy",
            FlagType.INDEMNITY: "Indemnification provision may create significant risk exposure",
            FlagType.TERMINATION: "Termination clause affects contract stability and exit options",
            FlagType.GOVERNING_LAW: "Governing law selection affects dispute resolution options",
            FlagType.VENUE: "Venue selection impacts litigation convenience and costs",
            FlagType.PAYMENT_TERMS: "Payment terms affect cash flow and collection risk",
            FlagType.DATE_DEADLINE: "Critical deadline requires calendar tracking and compliance",
        }
        
        return rationales.get(flag_type, "Contract term flagged for review")