import pytest
import asyncio
from src.summarizer.service import SummarizerService
from src.summarizer.schemas import NormalizedEmailModel
from src.summarizer.linker import generate_html_anchors


@pytest.fixture
def sample_email():
    """Sample email for testing"""
    plaintext = """Dear Counsel,

I am writing to follow up on our contract negotiations. The liability cap provision needs review - we propose limiting liability to 1x the fees paid under this agreement.

Please note that we need execution by August 30, 2025 to meet the project deadline.

The indemnification clause on page 12 also requires discussion, as it may create excessive exposure for our client.

Best regards,
John Doe"""
    
    html_anchors = generate_html_anchors(plaintext)
    
    return NormalizedEmailModel(
        id="test-email-123",
        plaintext=plaintext,
        html_anchors=html_anchors,
        metadata={
            "from": "john.doe@example.com",
            "to": ["counsel@lawfirm.com"],
            "subject": "Contract Review Follow-up",
            "date": "2024-08-16T10:00:00Z"
        }
    )


@pytest.mark.asyncio
async def test_summarizer_service_basic(sample_email):
    """Test basic summarization functionality"""
    service = SummarizerService()
    
    summary = await service.summarize_email(sample_email)
    
    # Verify structure
    assert summary.email_id == "test-email-123"
    assert len(summary.summary_bullets) > 0
    assert len(summary.flags) >= 0  # May or may not find flags
    assert summary.provenance.email_sha256
    assert summary.provenance.generated_at
    assert summary.provenance.private_model == "meta-llama/llama-3.1-70b-instruct"


@pytest.mark.asyncio
async def test_contract_flagging(sample_email):
    """Test contract term flagging"""
    service = SummarizerService()
    
    summary = await service.summarize_email(sample_email)
    
    # Should find some contract flags in the test email
    assert len(summary.flags) > 0
    
    # Check for expected flag types
    flag_types = [flag.type for flag in summary.flags]
    assert "LIABILITY_CAP" in flag_types or "INDEMNITY" in flag_types or "DATE_DEADLINE" in flag_types


def test_span_linking(sample_email):
    """Test span linking functionality"""
    from src.summarizer.linker import SpanLinker
    
    linker = SpanLinker(sample_email.plaintext, sample_email.html_anchors)
    
    # Test finding spans for a bullet
    spans, anchors = linker.find_spans_for_text("liability cap provision needs review")
    
    assert len(spans) > 0
    assert spans[0].start >= 0
    assert spans[0].end > spans[0].start
    assert spans[0].end <= len(sample_email.plaintext)


def test_html_anchor_generation():
    """Test HTML anchor generation"""
    text = """First paragraph here.

Second paragraph here.

Third paragraph here."""
    
    anchors = generate_html_anchors(text)
    
    assert len(anchors) == 3
    
    # Check anchor structure
    for anchor_id, pos in anchors.items():
        assert 'start' in pos
        assert 'end' in pos
        assert pos['start'] >= 0
        assert pos['end'] > pos['start']