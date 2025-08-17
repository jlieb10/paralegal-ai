FROM vllm/vllm-openai:latest

# Copy configuration
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Environment variables
ENV MODEL_NAME="microsoft/DialoGPT-medium"
ENV PORT=8000
ENV HOST=0.0.0.0
ENV NO_EGRESS=true

# Network isolation - disable external access
ENV http_proxy=""
ENV https_proxy=""
ENV HTTP_PROXY=""
ENV HTTPS_PROXY=""

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]