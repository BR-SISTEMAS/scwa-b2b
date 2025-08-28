# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Context

This is a B2B support chat system for Brazilian businesses with multi-tenant architecture, real-time messaging, queue management, and LGPD compliance. The project follows a strict XML-driven development methodology defined in `project-manual.xml`.

## Critical Files to Read First

**ALWAYS read `project-manual.xml` before starting any work.** This file contains:
- Complete sprint and task definitions
- Database schema specifications
- API endpoint mappings
- Agent operating procedures
- Naming conventions and file structures

## Development Workflow

### Task Execution Protocol

1. **Identify current task**: Parse `project-manual.xml` to find next pending task
2. **Create task folder**: `/tasks/T{S}.{NNN}/` with tracking files
3. **Implement with suffixes**: All created/modified files must include task ID (e.g., `chat_T3.003.tsx`)
4. **Validate locally**: Run linters and tests before committing
5. **Git operations**: Follow branch/commit conventions from manual
6. **Update README**: Append task summary after completion

### Naming Conventions

- **Task IDs**: `T{Sprint}.{Number}` (e.g., T1.001)
- **Branches**: `sprint/S{S}_task_T{S}.{NNN}-{short-desc}`
- **Commits**: `[S{S}][T{S}.{NNN}] - description`
- **PR titles**: `PR: S{S} - T{S}.{NNN} - description`
- **File suffixes**: `filename_T{S}.{NNN}.ext`

## Technology Stack

### Frontend
- **Framework**: Next.js (React) with TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO client hooks
- **Testing**: Playwright (E2E)

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO
- **Auth**: JWT with bcrypt/argon2
- **Testing**: Jest (unit tests)

### Infrastructure
- **Container**: Docker with docker-compose
- **CI/CD**: GitHub Actions
- **MCP Providers**: filesystem, github, context7, playwright, manual-xml

## Common Commands

### Development
```bash
# Frontend development server
cd frontend && npm run dev

# Backend development server
cd backend && npm run start:dev

# Database operations
npx prisma migrate dev --preview-feature
node ./database/seed/seed.js

# Build both applications
npm run build --prefix frontend
npm run build --prefix backend

# Docker environment
docker compose up --build
```

### Testing
```bash
# Run Playwright E2E tests
npx playwright test --project=chromium

# Unit tests (from respective directories)
npm test

# Linting
npm run lint
```

## Project Structure

```
/
├── project-manual.xml     # Sprint/task definitions (DO NOT MODIFY)
├── README.md             # Living sprint log document
├── docker-compose.yml    # Container orchestration
├── .env.example         # Environment variables template
├── ops/
│   ├── warp.yaml       # Warp workflows
│   ├── mcp-server/     # MCP server configs
│   ├── tests/playwright/ # E2E test specs
│   └── erp/           # ERP integration mappings
├── frontend/           # Next.js application
│   └── src/
│       ├── pages/     # Route components with task suffixes
│       ├── components/ # Reusable UI components
│       ├── hooks/     # Custom React hooks
│       └── styles/    # Theme tokens and global styles
├── backend/           # NestJS application
│   └── src/
│       └── modules/   # Feature modules
│           ├── auth/  # JWT authentication
│           ├── users/ # User management
│           ├── chats/ # Conversation logic
│           ├── tickets/ # Support tickets
│           └── metrics/ # Analytics
├── database/          # Prisma schemas and migrations
│   ├── migrations/    # Schema evolution
│   └── seed/         # Test data
└── tasks/            # Auto-created task folders
    └── T{S}.{NNN}/   # Task artifacts
        ├── created_files.txt
        ├── changes.diff
        ├── run_logs.txt
        └── test_results.xml
```

## Core Database Tables

The system uses PostgreSQL with these primary tables (see `project-manual.xml` for complete schema):

- **companies**: Multi-tenant company records
- **users**: Company-scoped users with roles (user/agent/manager/admin)
- **conversations**: Chat sessions with queue management
- **messages**: JSON-stored messages with attachments
- **tickets**: Support ticket records
- **evaluations**: Conversation ratings
- **audit_logs**: LGPD compliance tracking
- **metrics_cache**: Pre-computed analytics

## API Architecture

### Public Endpoints
- `/api/auth/*` - Authentication flows
- `/api/conversations/*` - Client chat operations
- `/api/conversations/{id}/attachments` - File uploads

### Internal Endpoints
- `/api/agents/*` - Agent queue and assignment
- `/api/manager/*` - Management dashboard
- `/api/export/*` - PDF/XML exports
- `/api/audit/*` - Compliance logs

## MCP Integration Requirements

When working on tasks:

1. **filesystem MCP**: List/validate files before modifications
2. **context7 MCP**: Consult for library usage and best practices
3. **playwright MCP**: Execute UI flow tests after implementations
4. **github MCP**: Use for commits, branches, and PRs
5. **manual-xml MCP**: Parse for task definitions and requirements

## Security & Compliance

### LGPD/GDPR Requirements
- Password hashing with bcrypt/argon2
- Field-level encryption for sensitive data (CPF/CNPJ)
- Audit logging for all sensitive operations
- Data export and deletion endpoints
- Consent recording and retention policies

### Security Checklist per Sprint
- TLS enforcement for production
- Dependency vulnerability scanning
- SAST in CI pipeline
- Secret management via environment variables
- Personal data retention policy metadata

## Sprint Progression

The project follows 7 sprints (S0-S6):

1. **S0**: Repository initialization and infrastructure
2. **S1**: Backend foundation with auth and user management
3. **S2**: Frontend foundation with theming
4. **S3**: Chat core functionality and real-time features
5. **S4**: Agent workflows and manager panel
6. **S5**: History, exports, and LGPD compliance
7. **S6**: Security hardening and production readiness

## Task Validation Requirements

### Quality Gates
- Lint errors must be fixed before commit
- Unit test coverage ≥ 70% for backend modules
- All critical E2E flows must pass (login, chat, export)
- No critical security vulnerabilities in dependencies
- PR review required before merge to main

### Task Completion Checklist
- [ ] Task folder created under `/tasks/`
- [ ] Files include task ID suffix
- [ ] Local validation passed (lint, build, test)
- [ ] E2E tests executed via Playwright MCP
- [ ] Git commit follows convention
- [ ] README.md updated with task summary
- [ ] Audit log entry created for changes

## Environment Variables

Key configuration (see `.env.example` for complete list):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Authentication token signing
- `SOCKET_PORT` - WebSocket server port
- `S3_BUCKET` - File storage configuration
- `SMTP_HOST` - Email service for exports
- `RETENTION_DAYS` - LGPD data retention period

## Working with the Manual

The `project-manual.xml` is the single source of truth for:
- Sprint and task definitions with acceptance criteria
- Database schema specifications
- API endpoint contracts
- File naming conventions
- Agent operating procedures
- Quality gates and validation rules

**Never modify project-manual.xml** - it's the immutable specification for the entire project lifecycle.
