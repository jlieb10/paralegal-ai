#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { readFileSync } from 'fs';

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function header(message) {
  log(`\n${colors.bold}=== ${message} ===${colors.reset}`, colors.blue);
}

function runCheck(description, checkFn) {
  try {
    const result = checkFn();
    if (result === true) {
      success(description);
      return true;
    } else if (typeof result === 'string') {
      warning(`${description}: ${result}`);
      return false;
    } else {
      error(`${description}: Failed`);
      return false;
    }
  } catch (err) {
    error(`${description}: ${err.message}`);
    return false;
  }
}

function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  if (major >= 20) {
    return true;
  } else {
    return `Node.js ${version} found, but >=20 required. Use: nvm install 20 && nvm use 20`;
  }
}

function checkPnpm() {
  try {
    const version = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    const major = parseInt(version.split('.')[0]);
    if (major >= 9) {
      return true;
    } else {
      return `pnpm ${version} found, but >=9 required. Run: npm install -g pnpm@latest`;
    }
  } catch {
    return 'pnpm not found. Install with: npm install -g pnpm';
  }
}

function checkPorts() {
  const portsToCheck = [3000, 8001, 8002];
  const busyPorts = [];

  for (const port of portsToCheck) {
    try {
      // Try to connect to the port
      const { spawn } = require('child_process');
      const output = execSync(`netstat -tuln 2>/dev/null | grep :${port} || echo ""`, { encoding: 'utf8' });
      if (output.trim()) {
        busyPorts.push(port);
      }
    } catch {
      // Port check failed, assume available
    }
  }

  if (busyPorts.length === 0) {
    return true;
  } else {
    return `Ports in use: ${busyPorts.join(', ')}. Kill processes with: kill $(lsof -ti:PORT)`;
  }
}

function checkEnvFile() {
  if (existsSync('.env')) {
    return true;
  } else {
    return 'No .env file found. Copy from .env.example: cp .env.example .env';
  }
}

function checkRequiredDeps() {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    if (!existsSync('node_modules') || !existsSync('pnpm-lock.yaml')) {
      return 'Dependencies not installed. Run: pnpm install';
    }
    return true;
  } catch {
    return 'package.json not found or invalid';
  }
}

function checkBuildOutputs() {
  const buildPaths = [
    'apps/landing/.next',
    'apps/bridge/dist',
    'packages/schemas/dist'
  ];

  const missing = buildPaths.filter(path => !existsSync(path));
  
  if (missing.length === 0) {
    return true;
  } else {
    return `Build outputs missing: ${missing.join(', ')}. Run: pnpm run build`;
  }
}

async function main() {
  header('Paralegal AI Environment Doctor');
  
  let allPassed = true;
  const checks = [
    ['Node.js Version (>=20)', checkNodeVersion],
    ['pnpm Version (>=9)', checkPnpm],
    ['Required Dependencies', checkRequiredDeps],
    ['Environment File', checkEnvFile],
    ['Port Availability (3000, 8001, 8002)', checkPorts],
    ['Build Outputs', checkBuildOutputs]
  ];

  for (const [description, checkFn] of checks) {
    const passed = runCheck(description, checkFn);
    if (!passed) allPassed = false;
  }

  header('Summary');
  if (allPassed) {
    success('All checks passed! 🎉');
    info('Ready to run:');
    info('  Development: pnpm run dev');
    info('  Production:  pnpm run build && pnpm run start:prod');
  } else {
    error('Some checks failed. Please fix the issues above before continuing.');
    process.exit(1);
  }
}

main().catch(console.error);