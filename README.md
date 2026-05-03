# Robert

Building canister-native products, AI agent tooling, and developer infrastructure.

[![ICP mainnet app](https://img.shields.io/badge/ICP-mainnet-6b46ff)](https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/)
[![mcp-lint npm](https://img.shields.io/npm/v/mcp-lint?color=crimson)](https://www.npmjs.com/package/mcp-lint)
[![GitHub](https://img.shields.io/badge/GitHub-robert19001--cmyk-101114)](https://github.com/robert19001-cmyk)

## Current Focus

- Internet Computer applications with Motoko, asset canisters, Internet Identity, and canister-first architecture.
- AI agent safety tooling for MCP schemas, runtime preflight checks, and cross-client compatibility.
- Practical products that are inspectable, documented, and deployed.

## Featured Projects

### [SovereignDesk AI](https://github.com/robert19001-cmyk/sovereign-desk-icp)

[![CI](https://github.com/robert19001-cmyk/sovereign-desk-icp/actions/workflows/ci.yml/badge.svg)](https://github.com/robert19001-cmyk/sovereign-desk-icp/actions/workflows/ci.yml)
[![Live on ICP](https://img.shields.io/badge/live-ICP%20mainnet-6b46ff)](https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/robert19001-cmyk/sovereign-desk-icp/blob/main/LICENSE)

Canister-native client operations workspace deployed on ICP mainnet.

- Motoko persistent backend canister.
- Vite frontend served from an ICP asset canister.
- Internet Identity gated write operations.
- Operator, client portal, signed read-only, and public read-only access modes.
- Redacted public demo endpoint.
- On-chain operator access request flow.
- Approval workflow, audit trail, and AI Employee draft endpoint.
- Trust Center with canister IDs, controller, module hashes, dashboard links, and verification command.

Live app:
https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/

### [mcp-lint](https://github.com/robert19001-cmyk/mcp-lint)

[![npm version](https://img.shields.io/npm/v/mcp-lint?color=crimson)](https://www.npmjs.com/package/mcp-lint)
[![npm downloads](https://img.shields.io/npm/dm/mcp-lint)](https://www.npmjs.com/package/mcp-lint)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/robert19001-cmyk/mcp-lint/blob/main/LICENSE)

Linter and runtime preflight firewall for MCP tool schemas.

- Lints MCP tool schemas for compatibility across major MCP clients.
- Includes rules for Claude, Cursor, Gemini, VS Code Copilot, Windsurf, Cline, OpenAI Agents SDK, and Continue.dev.
- Runtime preflight checks score agent tool-call risk before execution.
- TypeScript, Node.js, CLI-first developer workflow.

```bash
npm install -g mcp-lint
mcp-lint check tools.json
mcp-lint preflight action.json --policy preflight.yml
```

## Stack

Motoko · Internet Computer · Internet Identity · TypeScript · Node.js · Vite · Next.js · Vitest · MCP

## Contact

Email: robert19001@gmail.com

Open an issue or start a discussion on one of the public repositories.
