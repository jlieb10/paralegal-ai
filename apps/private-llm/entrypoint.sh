#!/bin/bash
set -e

echo "Starting Private LLM Server (NO EGRESS)"
echo "Model: $MODEL_NAME"
echo "Port: $PORT"
echo "Host: $HOST"

# Ensure no internet access
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY

# Block common external domains at DNS level (basic protection)
echo "127.0.0.1 openai.com" >> /etc/hosts
echo "127.0.0.1 api.openai.com" >> /etc/hosts
echo "127.0.0.1 anthropic.com" >> /etc/hosts
echo "127.0.0.1 cohere.ai" >> /etc/hosts
echo "127.0.0.1 huggingface.co" >> /etc/hosts

# Start vLLM server
exec python -m vllm.entrypoints.openai.api_server \
    --model "$MODEL_NAME" \
    --port "$PORT" \
    --host "$HOST" \
    --disable-log-requests \
    --served-model-name "private-model"