# Gymora Skills

Use these skills for repeatable Gymora workflows. They preserve the project's NestJS (backend) / Next.js (frontend) architecture and the conventions in `AGENTS.md`.

| Skill            | Purpose                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| `add-entity`     | Add a new backend entity end to end (schema → DTO → service → resolver → module → components.module.ts). |
| `add-frontend`   | Add a new page or Apollo query/mutation to the gymora-front Next.js app.                                 |
| `fix-errors`     | Fix TypeScript compile errors, GraphQL schema conflicts, or NestJS dependency injection failures.        |
| `add-batch-job`  | Add a new cron job to gymora-batch (service method + job class + module registration).                   |
| `payment-stripe` | Work with the Stripe + Payme payment flow (plan prices, initiatePayment, subscription creation).         |

Each skill lives at `skills/<skill-name>/SKILL.md`.

> Architecture conventions and domain rules live in `AGENTS.md`.
