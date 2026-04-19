# Robert

Building tools at the intersection of AI agents and developer infrastructure.

## Featured project

### [mcp-lint](https://github.com/robert19001-cmyk/mcp-lint)

[![npm version](https://img.shields.io/npm/v/mcp-lint?color=crimson)](https://www.npmjs.com/package/mcp-lint)
[![npm downloads](https://img.shields.io/npm/dm/mcp-lint)](https://www.npmjs.com/package/mcp-lint)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/robert19001-cmyk/mcp-lint/blob/main/LICENSE)

**Linter + runtime preflight firewall for MCP tool schemas.**

- Lints MCP tool schemas for cross-client compatibility across **8 MCP clients** (Claude, Cursor, Gemini, VS Code Copilot, Windsurf, Cline, OpenAI Agents SDK, Continue.dev)
- **17 rules** covering known client quirks
- **Preflight firewall** — intercepts agent tool calls before execution, scores risk, enforces YAML policy, supports safe rewrites
- TypeScript, Node ≥20, MIT

```bash
npm install -g mcp-lint
mcp-lint check tools.json
mcp-lint preflight action.json --policy preflight.yml
```

> **Lint catches bad schemas. Preflight catches bad actions.**

---

## Stack I use

TypeScript · Next.js · Node.js · Vitest · Commander · MCP

## Contact

Open an issue or start a discussion on [mcp-lint](https://github.com/robert19001-cmyk/mcp-lint/discussions).
