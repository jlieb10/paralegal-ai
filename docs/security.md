# Paralegal AI Security & Compliance Guide

Paralegal AI is designed **privacy-first** for legal environments with strict compliance requirements.

---

## 1. Architecture & Data Flow Principles

### Core Privacy Model
- **Private LLM Box**: All substantive email content is processed **only** inside the Private LLM container
- **No Internet Egress**: Private LLM has no network route to the internet (enforced at infrastructure + application level)
- **Bridge-Mediated Lookups**: Optional fact-checks use the Bridge service, which enforces redaction and allowlisted query templates
- **Audit Trail**: All Bridge activity is cryptographically logged with hash chaining

### Data Flow
```
Email → Ingestion → Summarizer → Private LLM → Summary with Spans
                       ↓
                  Bridge (optional) → Connected LLM (redacted queries only)
```

---

## 2. Legal & Regulatory Alignment

### Attorney-Client Privilege
- **Content Never Leaves Firm**: All email content remains within firm-controlled infrastructure
- **No Third-Party Processing**: Private LLM runs on-premises/VPC with no external API calls
- **Work Product Protection**: Summaries generated locally maintain work product doctrine protections

### GDPR/UK GDPR Compliance
- **Art. 5(1)(c) Data Minimization**: Only processes content required for summaries
- **Art. 32 Security**: Encryption in transit (TLS 1.3) and at rest (AES-256-GCM)
- **Art. 28 Processor Agreements**: Not required when deployed fully in-house
- **No Cross-Border Transfers**: All processing within controlled jurisdiction

### US Privacy Requirements
- **CCPA Compliance**: Local processing avoids "sale" of personal information
- **State Bar Rules**: Maintains confidentiality requirements for attorney communications
- **Data Retention**: Configurable retention policies (default: 30 days for summaries)

---

## 3. Technical Security Controls

### Network Segmentation
- **Private Network**: LLM and Summarizer in isolated subnet with no default route
- **Bridge DMZ**: Bridge service in separate subnet with controlled egress
- **Ingress Control**: Only webhook endpoints exposed to internet

### Encryption & Key Management
- **Data at Rest**: AES-256-GCM for database and object storage
- **Data in Transit**: TLS 1.3 everywhere with certificate pinning
- **Key Rotation**: HSM/KMS integration for production deployments
- **Envelope Encryption**: Separate data and key encryption keys

### Access Control
- **Enterprise SSO**: Azure AD (Entra ID) / Google Workspace OIDC
- **Role-Based Access**: Partner, Paralegal, Admin roles with principle of least privilege
- **API Authentication**: Service-to-service JWT tokens with short expiry
- **Audit Logging**: All access attempts logged with user context

### Privacy by Design
```typescript
// Example: Redaction before Bridge crossing
const redactionResult = redactionService.redact(query);
if (!redactionResult.is_safe) {
  throw new Error('PII detected - query rejected');
}
// Only redacted, template-based queries allowed
```

---

## 4. Audit & Tamper Evidence

### Hash-Chained Logging
- **Cryptographic Integrity**: Each audit entry contains hash of previous entry
- **Merkle Root Checkpoints**: Daily root calculation for tamper detection
- **Immutable Append**: WORM-style storage for audit trail

### Audit Schema
```json
{
  "id": "audit-123",
  "timestamp": "2024-08-16T22:00:00Z",
  "requester_service": "summarizer",
  "template_id": "CFR_SECTION_SUMMARY", 
  "placeholders_hash": "abc123...",
  "model_id": "connected-llm",
  "result_hash": "def456...",
  "previous_hash": "ghi789..."
}
```

---

## 5. Deployment Security

### Individual Deployment
- **Docker Compose**: Single-workstation deployment with GPU support
- **Local Storage**: PostgreSQL + MinIO on encrypted volumes
- **Network Isolation**: Private Docker networks with no external routes

### Enterprise Deployment
- **Kubernetes**: Hardened clusters with PodSecurityStandards
- **Network Policies**: Ingress/egress controls at CNI level
- **Secret Management**: External Secrets Operator with KMS/Vault
- **Runtime Security**: ReadOnlyRootFilesystem, non-root containers

---

## 6. Data Retention & Lifecycle

### Default Retention
- **Summaries**: 30 days (configurable)
- **Audit Logs**: 365 days (regulatory requirement)
- **Original Emails**: Governed by firm retention policy (unchanged by Paralegal AI)

### Data Deletion
- **Right to Erasure**: Automated deletion workflows
- **Secure Deletion**: Cryptographic erasure of encryption keys
- **Audit Trail**: Deletion events logged with business justification

---

## 7. Incident Response

### Privacy Breach Detection
- **Monitoring**: Failed redaction attempts trigger alerts
- **Pattern Detection**: Unusual Bridge query patterns flagged
- **Automated Response**: Suspicious activity auto-blocks with manual review

### Breach Notification
- **Internal**: CISO notification within 1 hour
- **Client**: Affected client notification within 24 hours
- **Regulatory**: Data protection authority within 72 hours (GDPR)

---

## 8. Certification & Compliance Testing

### Security Frameworks
- **ISO 27001**: Security control mapping (Annex A)
- **SOC 2 Type II**: Trust services criteria compliance  
- **NIST Cybersecurity Framework**: Control implementation matrix

### Regular Assessments
- **Penetration Testing**: Quarterly external assessment
- **Code Security**: SAST/DAST in CI/CD pipeline
- **Dependency Scanning**: Automated vulnerability assessment
- **Policy Testing**: Redaction and egress prevention validation

---

## 9. Configuration Examples

### Production Hardening
```yaml
# config/security.yaml
privacy:
  private_llm_egress: false  # NEVER true in production
  bridge_max_payload: 512    # Character limit
  redaction_required: true   # Always redact PII
  
audit:
  retention_days: 365
  hash_chain_enabled: true
  merkle_checkpoints: daily
  
encryption:
  at_rest: "AES-256-GCM"
  in_transit: "TLS-1.3"
  key_rotation_days: 90
```

---

## 10. DPIA Template

### Data Protection Impact Assessment
- **Processing Purpose**: Legal document summarization for attorney efficiency
- **Data Categories**: Professional email correspondence, contract terms
- **Legal Basis**: Legitimate interest (Art. 6(1)(f)) + Professional confidentiality
- **Retention**: Minimal necessary for legal practice efficiency
- **Third Country Transfers**: None (local processing only)
- **Data Subject Rights**: Access, rectification, erasure, portability
- **Security Measures**: As detailed in this document

### Risk Mitigation
- **High Risk**: Email content exposure → Private LLM with no egress
- **Medium Risk**: PII in external queries → Redaction + template enforcement  
- **Low Risk**: Audit trail tampering → Cryptographic hash chaining

---

**Summary**: Paralegal AI implements privacy-by-design principles with technical and organizational measures that exceed industry standards for legal technology. All client communications remain under firm control with no third-party processing or external data transfers.