# AGENTS.md

## Project mission

We are building a Swedish SaaS platform for small electrical companies.

The product is not a generic ERP system. It is an operational platform for smaller electrical contractors, focused on the flow from customer request to work order, field execution, time/material reporting, documentation, and invoice draft.

Primary target users:
- Small Swedish electrical companies with 1-15 employees
- Owners/managers
- Administrators
- Electricians/technicians in the field

The product should feel practical, fast, mobile-first, and designed for real electricians.

## Product principle

Do not build a complete business system.
Build the fastest way for a small electrical company to go from incoming job to finished invoice basis.

## Language

The user interface must be in Swedish.

Code, comments, and documentation may be in English unless the file is user-facing.

## Tech stack

Use:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Row Level Security
- React Hook Form where forms become non-trivial
- Zod for validation

Avoid unless explicitly approved:
- Redux
- Microservices
- Kubernetes
- Overly complex state management
- Premature abstraction
- Unnecessary paid dependencies

## UX principles

The mobile electrician experience is the most important part of the product.

Prioritize:
- Large buttons
- Few clicks
- Clear statuses
- Minimal typing
- Fast access to phone number, address, job description, time reporting, material reporting, and photos
- Offline-friendly thinking, even if not implemented initially

Avoid:
- Long forms
- Dense tables on mobile
- Hidden critical actions
- Desktop-first workflows

## Core MVP scope

The MVP should include:

1. Login
2. Company/account context
3. Customer management
4. Work order management
5. Assigning work orders to electricians
6. Electrician mobile view: "Mina jobb"
7. Work order status changes
8. Time reporting
9. Material reporting
10. Notes and photo documentation
11. Invoice draft generation

Do not build:
- Full accounting
- Payroll
- Full inventory system
- Advanced project management
- AI features before the core workflow works
- Native mobile app before the web MVP is validated

## Roles

Supported roles:
- admin
- manager
- electrician

Rules:
- Admin and manager can view and manage all company data.
- Electrician can only view assigned work orders.
- All business data must be scoped by company_id.

## Data model expectations

Every business object must include:
- id
- company_id
- created_at
- updated_at where relevant

Important entities:
- companies
- profiles
- customers
- sites
- work_orders
- time_entries
- material_entries
- work_order_notes
- work_order_photos
- invoice_drafts

## Security rules

Never expose data across companies.

Use Supabase Row Level Security for company-scoped records.

Do not hardcode secrets.

Do not commit `.env` files.

Use `.env.example` for required environment variables.

## Development workflow

Before implementing a feature:
1. Read relevant docs in `/docs`
2. Explain the intended change briefly
3. Keep the change small
4. Update or add tests when reasonable
5. Run lint/typecheck if available

After modifying code:
- Run `npm run lint` if configured
- Run `npm run typecheck` if configured
- Run tests if configured
- Mention any commands that could not be run

## Product behavior

When in doubt, choose the simpler workflow that matches a small Swedish electrical company.

Prefer real-world field usability over enterprise completeness.

## Project agents

Additional project agent definitions live in `/docs/agents`.

Available agents:
- `product-architect` - Use for product modeling, workflow design, data modeling, and MVP scoping.
- `frontend-builder` - Use for building mobile-first Next.js UI components and pages.
- `backend-builder` - Use for Supabase, PostgreSQL, RLS, API routes, validation, and server-side logic.
- `reviewer` - Use to review product correctness, security, code quality, and MVP discipline.

## Naming

Use domain language:
- customer = kund
- site = arbetsplats/anläggning
- work order = arbetsorder
- electrician = montör/elektriker
- invoice draft = fakturaunderlag
