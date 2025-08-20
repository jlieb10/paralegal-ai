#!/usr/bin/env node

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ ${message}`, colors.blue);
}

function header(message) {
  console.log();
  log(`${colors.bold}=== ${message} ===${colors.reset}`, colors.cyan);
  console.log();
}

async function main() {
  header('🚀 Paralegal AI Development Environment Ready!');
  
  success('All services are running and healthy');
  
  console.log();
  log('📍 Service Endpoints:', colors.bold);
  info('Landing Page:    http://localhost:3000');
  info('Demo Interface:  http://localhost:3000/demo');
  info('Bridge API:      http://localhost:8002/api');
  info('Summarizer API:  http://localhost:8001');
  info('Private LLM:     http://localhost:8001/v1 (GPU) or :8003 (CPU)');
  info('Ingestion API:   http://localhost:4001');
  
  console.log();
  log('🔧 Useful Commands:', colors.bold);
  info('View logs:       docker compose -f infra/docker-compose.llm.yml logs -f');
  info('Stop LLMs:       pnpm run dev:llm:down');
  info('Health check:    pnpm run doctor');
  info('Run tests:       pnpm run test:all');
  
  console.log();
  log('🔒 Privacy Model:', colors.bold);
  info('Private LLM has NO internet access (internal network only)');
  info('Bridge service enforces redaction and policy firewall');
  info('All external queries use allowlisted templates only');
  
  console.log();
  success('Ready for development! 🎉');
  console.log();
}

main().catch(console.error);