# RMM MCP Server

Model Context Protocol server for Azure DevOps integration.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Azure DevOps credentials:

```bash
copy .env.example .env
```

Edit `.env`:
```env
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/YOUR-ORGANIZATION
AZURE_DEVOPS_PAT=YOUR-PERSONAL-ACCESS-TOKEN
AZURE_DEVOPS_PROJECT=YOUR-PROJECT-NAME
PORT=3001
```

### 3. Start Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## Endpoints

- `GET /health` - Health check
- `POST /api/mcp/execute` - Execute MCP tool
- `POST /api/mcp/query` - Execute custom query
- `GET /api/mcp/tools` - List available tools

## Available Tools

- `get_release_context` - Get release information with work items and tests
- `get_sprint_context` - Get sprint information with work items
- `get_work_items` - Get specific work items by IDs

## Documentation

See [AI_INTEGRATION.md](../AI_INTEGRATION.md) for complete documentation.
