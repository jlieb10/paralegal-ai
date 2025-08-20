from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from .schemas import SummarizeRequestModel, SummaryModel
from .service import SummarizerService
from .linker import generate_html_anchors

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Paralegal AI Summarizer",
    description="Privacy-first email summarization service",
    version="0.1.0",
    docs_url="/docs" if os.getenv("DEBUG") else None,
    redoc_url=None
)

# CORS middleware for development
if os.getenv("DEBUG"):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Initialize service
summarizer = SummarizerService(
    private_llm_url=os.getenv("PRIVATE_LLM_URL", "http://private-llm:8000/v1")
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "summarizer"}


@app.post("/summarize", response_model=SummaryModel)
async def summarize_email(request: SummarizeRequestModel) -> SummaryModel:
    """Summarize an email with linked bullets and contract flags"""
    try:
        logger.info(f"Summarizing email: {request.email.id}")
        
        # Generate HTML anchors if not provided
        if not request.email.html_anchors:
            request.email.html_anchors = generate_html_anchors(request.email.plaintext)
        
        # Generate summary
        summary = await summarizer.summarize_email(request.email)
        
        logger.info(f"Summary generated: {len(summary.summary_bullets)} bullets, {len(summary.flags)} flags")
        
        return summary
        
    except Exception as e:
        logger.error(f"Error summarizing email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "paralegal-ai-summarizer",
        "version": "0.1.0",
        "status": "operational",
        "privacy": "Private LLM - no internet egress"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "summarizer.main:app", 
        host="0.0.0.0", 
        port=8001, 
        reload=os.getenv("DEBUG") == "true"
    )