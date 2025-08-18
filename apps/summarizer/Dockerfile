FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Configure pip to handle SSL issues in Docker environments
RUN pip config set global.trusted-host pypi.org && \
    pip config set global.trusted-host pypi.python.org && \
    pip config set global.trusted-host files.pythonhosted.org

# Copy requirements first for better caching
COPY apps/summarizer/pyproject.toml ./

# Install dependencies with fallback for SSL issues
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org -e .[dev] || \
    pip install --no-cache-dir --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org fastapi uvicorn[standard] pydantic httpx python-multipart pytest pytest-asyncio black ruff

# Copy application code
COPY apps/summarizer/src/ ./src/

# Create non-root user
RUN useradd --create-home --shell /bin/bash paralegal
RUN chown -R paralegal:paralegal /app
USER paralegal

# Environment variables
ENV PYTHONPATH=/app/src
ENV NO_EGRESS=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

EXPOSE 8001

CMD ["python", "-m", "uvicorn", "summarizer.main:app", "--host", "0.0.0.0", "--port", "8001"]