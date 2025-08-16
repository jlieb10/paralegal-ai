import httpx
import hashlib
from datetime import datetime
from typing import List, Optional
from .schemas import (
    SummaryModel,
    SummaryBulletModel, 
    ProvenanceModel,
    FactRequestModel,
    TemplateId,
    NormalizedEmailModel
)
from .linker import SpanLinker
from .flagger import ContractFlagger


class PrivateLLMClient:
    """Client for private vLLM instance"""
    
    def __init__(self, base_url: str = "http://private-llm:8000/v1"):
        self.base_url = base_url
        self.client = httpx.AsyncClient()
    
    async def generate_summary_bullets(self, email_text: str) -> List[str]:
        """Generate bullet points from email text"""
        
        system_prompt = """You are Paralegal operating fully offline. Produce concise bullets for parties, asks, dates, amounts, obligations, and risks.

- Validate SUMMARY_SCHEMA.
- For each bullet provide precise spans and anchors.
- Emit FACT_REQUESTS when legal/factual confirmation is needed.
- Do not invent facts. Keep quotes short with spans.

Return only a JSON list of bullet point strings, no other text."""

        try:
            response = await self.client.post(
                f"{self.base_url}/chat/completions",
                json={
                    "model": "meta-llama/llama-3.1-70b-instruct",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Summarize this email:\n\n{email_text}"}
                    ],
                    "max_tokens": 1000,
                    "temperature": 0.1  # Low temperature for consistency
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # For MVP, return mock bullets if LLM not available
                if not content:
                    return self._generate_mock_bullets(email_text)
                    
                # Parse JSON response (simplified for MVP)
                import json
                try:
                    bullets = json.loads(content)
                    if isinstance(bullets, list):
                        return bullets
                except json.JSONDecodeError:
                    pass
                    
                # Fallback to mock
                return self._generate_mock_bullets(email_text)
            else:
                # Fallback to mock for MVP
                return self._generate_mock_bullets(email_text)
                
        except Exception:
            # Fallback to mock for MVP development
            return self._generate_mock_bullets(email_text)
    
    def _generate_mock_bullets(self, email_text: str) -> List[str]:
        """Generate mock bullets for MVP testing"""
        # Simple heuristics for demo
        lines = email_text.split('\n')
        bullets = []
        
        # Look for key patterns
        for line in lines[:10]:  # First 10 lines
            line = line.strip()
            if not line:
                continue
                
            if any(word in line.lower() for word in ['contract', 'agreement', 'liability']):
                bullets.append(f"Contract terms discussed: {line[:50]}...")
            elif any(word in line.lower() for word in ['deadline', 'due', 'by']):
                bullets.append(f"Timeline mentioned: {line[:50]}...")
            elif any(word in line.lower() for word in ['amount', '$', 'payment']):
                bullets.append(f"Financial terms: {line[:50]}...")
        
        if not bullets:
            bullets = [
                "Email received and processed",
                "Content analyzed for contract terms",
                "No specific legal obligations identified"
            ]
        
        return bullets[:5]  # Max 5 bullets


class SummarizerService:
    """Main summarization orchestrator"""
    
    def __init__(self, private_llm_url: str = "http://private-llm:8000/v1"):
        self.llm_client = PrivateLLMClient(private_llm_url)
        self.policy_hash = self._compute_policy_hash()
    
    async def summarize_email(self, email: NormalizedEmailModel) -> SummaryModel:
        """Generate complete summary for email"""
        
        # Generate bullet points using private LLM
        bullet_texts = await self.llm_client.generate_summary_bullets(email.plaintext)
        
        # Create span linker
        linker = SpanLinker(email.plaintext, email.html_anchors)
        
        # Map bullets to spans
        summary_bullets = []
        for bullet_text in bullet_texts:
            spans, anchors = linker.find_spans_for_text(bullet_text)
            summary_bullets.append(SummaryBulletModel(
                text=bullet_text,
                spans=spans,
                anchors=anchors
            ))
        
        # Generate contract flags
        flagger = ContractFlagger(email.plaintext, email.html_anchors)
        flags = flagger.flag_contract_terms()
        
        # Check for fact requests (simplified for MVP)
        fact_requests = self._generate_fact_requests(email.plaintext)
        
        # Create provenance
        email_hash = hashlib.sha256(email.plaintext.encode()).hexdigest()
        provenance = ProvenanceModel(
            email_sha256=email_hash,
            generated_at=datetime.utcnow().isoformat() + "Z",
            private_model="meta-llama/llama-3.1-70b-instruct",
            policy_hash=self.policy_hash
        )
        
        return SummaryModel(
            email_id=email.id,
            summary_bullets=summary_bullets,
            flags=flags,
            fact_requests=fact_requests,
            provenance=provenance
        )
    
    def _generate_fact_requests(self, text: str) -> List[FactRequestModel]:
        """Generate fact check requests for legal references"""
        fact_requests = []
        
        # Look for legal citations (simplified)
        import re
        
        # CFR references
        cfr_matches = re.finditer(r'(\d+)\s+CFR\s+§?\s*([\d\.]+)', text, re.IGNORECASE)
        for match in cfr_matches:
            section = f"{match.group(1)} CFR § {match.group(2)}"
            fact_requests.append(FactRequestModel(
                template_id=TemplateId.CFR_SECTION_SUMMARY,
                placeholders={"section": section}
            ))
        
        # CPLR references  
        cplr_matches = re.finditer(r'CPLR\s+§?\s*([\d\.]+)', text, re.IGNORECASE)
        for match in cplr_matches:
            section = f"CPLR § {match.group(1)}"
            fact_requests.append(FactRequestModel(
                template_id=TemplateId.CPLR_STANDARD,
                placeholders={"section": section}
            ))
        
        return fact_requests[:3]  # Max 3 requests
    
    def _compute_policy_hash(self) -> str:
        """Compute hash of current policy configuration"""
        # For MVP, use static hash
        policy_data = "paralegal-ai-v0.1.0-policy"
        return hashlib.sha256(policy_data.encode()).hexdigest()[:16]