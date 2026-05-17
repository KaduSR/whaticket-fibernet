# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `npm run build`
- Develop: `npm run dev`
- Deploy (VPS): `./deploy.sh`
- Generate Prisma Client: `npx prisma generate --schema=apps/web/prisma/schema.prisma`

## Architecture & Structure
The project is a monorepo containing a single application in `apps/web` built with Next.js 16 (App Router).

### Core Components
- **AI Orchestrator**: Located in `apps/web/src/lib/llm/orchestrator.ts`. Manages the flow between incoming messages, AI personas, and tool execution.
- **Message Debounce**: Implemented in `apps/web/src/lib/debounce.ts` using Redis. Uses a sliding window to coalesce fragmented WhatsApp messages before triggering the AI.
- **ERP Integration**: Handled by `apps/web/src/lib/ixc/client.ts` for communication with IXC Provedor API.
- **Channel Adapters**: Located in `apps/web/src/lib/channels/`, specifically `evolution.ts` for managing Evolution API (WhatsApp) sessions.
- **Database**: PostgreSQL managed via Prisma ORM (`apps/web/prisma/schema.prisma`).

### Infrastructure
- **Deployment**: Uses Docker with Next.js standalone output for production efficiency.
- **Caching**: Redis is used both for the message debounce mechanism and general application caching.
- **VCS**: Monorepo structure utilizing npm workspaces.
