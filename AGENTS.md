# AGENTS.md — Agent instructions for Gymora

Gymora is a premium fitness platform. This file guides AI coding agents (Claude Code, Cursor, Codex, Copilot, etc.) working in this repo. Follow these patterns to keep the codebase coherent.

## Architecture

Three runtimes, two repos:

- **`apps/gymora-api/`** — NestJS 10, GraphQL code-first, Mongoose, Socket.IO
- **`apps/gymora-batch/`** — NestJS scheduled jobs; shares schemas with gymora-api
- **`gymora-front/`** — Next.js 14 (pages router), Apollo Client, Socket.IO client — lives as a sibling directory outside this monorepo

The two repos are independent deployments. They share no code at runtime — only conventions.

## Backend conventions

### Folder structure

```
apps/gymora-api/src/
  components/<entity>/
    <entity>.module.ts     # Mongoose forFeature + provider wiring
    <entity>.resolver.ts   # GraphQL @Query / @Mutation
    <entity>.service.ts    # Business logic; injects models and other services
  components/components.module.ts  # Central module registry — every entity module goes here
  libs/
    dto/<entity>/
      <entity>.ts          # @ObjectType — the read shape
      <entity>.input.ts    # @InputType — the create shape
      <entity>.update.ts   # @InputType — partial update (optional)
    enums/gymora.enum.ts   # All domain enums; each must call registerEnumType()
    types/common.ts        # Shared utility types
  schemas/<Entity>.model.ts  # Mongoose Schema; PascalCase filename; export default
```

### Adding an entity

Always follow this order: **schema → DTO → service → resolver → module → register in components.module.ts**. Never skip a step or register a module before its schema exists.

### Schema rules

- Use `{ timestamps: true }` on every schema — gives `createdAt` / `updatedAt` automatically.
- Add `deletedAt: Date` for soft-deletable entities; always filter `{ deletedAt: { $exists: false } }` in queries.
- Add MongoDB indexes for every field used in `.find()` filters or sort operations.
- Use `{ _id: false }` on subdocument schemas to allow clean `$set` dot-notation updates.

### DTO rules

- Every `@Field()` scalar must be explicitly typed: `@Field(() => String)`, `@Field(() => Float)`, `@Field(() => Int)`, `@Field(() => Boolean)`, `@Field(() => Date)`.
- Never use bare `@Field()` without a type function.
- Optional fields use `{ nullable: true }` and `?` on the property.
- `@ObjectType` fields must include `createdAt` and `updatedAt` when the frontend queries them.

### Service rules

- Services own all business logic. Resolvers are thin — they validate auth, extract the caller identity, and delegate.
- Always override `memberId` from the JWT, never from client input: `{ ...input, memberId: memberId.toString() }`.
- Never trust a client-supplied ownership ID (trainerId, courseId, etc.) — always verify via a DB lookup that the authenticated user owns the resource.
- Use `findOneAndUpdate` with `{ new: true }` so the updated document is returned.
- For counters (`memberCourses`, `memberWorkouts`, etc.), use `{ $inc: { field: 1 } }` — never read-modify-write.

### GraphQL conventions

- `@Query` for reads. `@Mutation` for writes. No exceptions.
- Paginated list operations return `{ list: Entity[], metaCounter: [{ total: number }] }` using `$facet`.
- Public queries (no auth required but optionally decode token) use `@UseGuards(WithoutGuard)`.
- Authenticated queries use `@UseGuards(AuthGuard)`.
- Role-restricted mutations use `@Roles(MemberType.X)` + `@UseGuards(RolesGuard)`.
- The authenticated caller's identity is always extracted with `@AuthMember('_id')`.
- Enum values used in GraphQL must be registered with `registerEnumType()` in `gymora.enum.ts`.

### Auth guards

- `AuthGuard` — GraphQL-only. Rejects unauthenticated requests.
- `WithoutGuard` — GraphQL-only. Passes through unauthenticated requests but decodes the token if present (for `meLiked`, `meFollowed`, etc.).
- `RolesGuard` — GraphQL-only. Checks `memberType` against `@Roles()`.
- There are no REST auth guards — file upload endpoints live in resolvers via `graphql-upload`.

### File uploads

- Images and videos are handled in resolvers using `graphql-upload` (`GraphQLUpload`, `FileUpload`). This is the established pattern — do not replace it with REST endpoints.
- Uploaded files are stored on the local server disk under `uploads/`. The returned value is a relative path.
- The frontend constructs the full URL as `${NEXT_PUBLIC_API_URL}/${relativePath}`.
- File upload mutations require `context: { headers: { 'apollo-require-preflight': 'true' } }` on the frontend.

### Real-time

- The Socket.IO gateway (`socket.gateway.ts`) requires a valid JWT on connect. Unauthenticated connections are rejected immediately.
- All real-time state (connection registry, online status) is in-memory in `ChatService`. It is not persisted to the database.
- Incoming chat messages are saved to the database, then pushed to the recipient's active sockets. Both must happen — do not skip the push.

### Batch jobs

- Each job in `gymora-batch` has a single responsibility. Implement the business logic in `BatchService`; the job class only calls it inside a try/catch with logging.
- Batch shares schemas by importing directly from `gymora-api/src/schemas/`. Never duplicate a schema.
- When adding a new job: create the job class, implement the service method, register the job in `BatchModule`.

## Frontend conventions

### Folder structure

```
gymora-front/
  pages/
    index.tsx                # Landing
    account/join.tsx         # Auth
    <entity>/index.tsx       # Public list
    <entity>/detail.tsx      # Public detail
    mypage/<section>.tsx     # Authenticated user sections
  apollo/
    user/query.ts            # All user-facing GraphQL queries
    user/mutation.ts         # All user-facing GraphQL mutations
    admin/query.ts           # Admin-only queries
    admin/mutation.ts        # Admin-only mutations
    store.ts                 # userVar — Apollo reactive var for auth state
    client.ts                # Apollo client setup
  libs/
    components/gymora/       # Shared UI components
    enums/                   # TypeScript enums (mirror backend enums exactly)
    types/<entity>/          # TypeScript interfaces (mirror backend DTOs)
    hooks/                   # Custom hooks (e.g., useChat for Socket.IO)
    sweetAlert.ts            # Notification helpers
```

### Page conventions

- Every route is a folder: `pages/<route>/index.tsx`. Never place loose `.tsx` files at the root of `pages/` except the four Next.js reserved files (`_app`, `_document`, `404`, `index`).
- Public pages with top navigation use `<GymNavbar />` + `<GymFooter />`.
- Authenticated sections (mypage) use `<GymSidebar />` in a flex layout.
- Always export `getStaticProps` with `serverSideTranslations` for i18n support.
- Auth state comes from `useReactiveVar(userVar)`. Never read the JWT directly in a page.

### Apollo conventions

- Every `useQuery` should specify `fetchPolicy: 'cache-and-network'` unless there is a specific reason to use another policy.
- Pass `skip: !someCondition` to avoid firing queries before required data is available.
- After a mutation that changes data shown by an active query, either call `refetch()` or use `refetchQueries`.
- Error messages are surfaced via `sweetMixinErrorAlert(err?.graphQLErrors?.[0]?.message || 'fallback')`.
- Success confirmations use `sweetMixinSuccessAlert('Short message.')`.

### UI / design system

- `GIcon` is the only icon component. Never use emoji in the UI. Icon names are fixed strings; see `GIcon.tsx` for the full list.
- `GymAvatar`, `GymStars` are the only avatar and rating components.
- `WorkoutCard`, `CourseCard`, `TrainerCard` are the shared entity cards — use them wherever those entities appear in lists.
- CSS custom properties (`var(--bg)`, `var(--primary)`, `var(--text)`, etc.) define the design system. Never hard-code colors.
- The design target is a premium athletic platform — no emoji in copy, no gamification elements, no fake metrics, no hardcoded statistics presented as live data.

### TypeScript

- Frontend TypeScript enums must match backend enum values exactly — they are sent as strings over GraphQL.
- Types in `libs/types/<entity>/` mirror the backend `@ObjectType` fields. Keep them in sync when adding `@Field()` declarations to the backend.

## Domain rules

### Membership and access

- `memberType` controls capabilities: `USER` can access content; `TRAINER` can publish content; `ADMIN` can moderate.
- Becoming a trainer is done through `createTrainer` — the backend automatically elevates `memberType` to `TRAINER`. There is no separate admin signup.
- Only `ACTIVE` members are publicly visible. Blocked or deleted members must not appear in public-facing queries.

### Content ownership

- Every piece of trainer-published content (courses, lessons, workouts) must be verified to belong to the authenticated trainer before any write operation. Ownership is always checked server-side — never trust a client-supplied owner ID.
- Soft-deleted content (`deletedAt` set) must never appear in public listings. Always filter it out.

### Freemium content

- Workouts have a `isFree` flag. Free workouts are visible to all authenticated users. Paid workouts are linked to a course and their exercise details are hidden for non-enrolled users.
- There is a configurable limit on free preview workouts per trainer. The limit is enforced server-side.

### Course progression

- Purchasing a course immediately unlocks the first lesson.
- Each subsequent lesson unlocks a fixed interval after the previous lesson is completed.
- `completeLesson` must verify both enrollment and that the lesson is actually unlocked before marking it done.

### Nutrition

- Meal logs and daily nutrition totals are kept in sync atomically. Adding a log increments the daily total; deleting a log decrements it. Never let them drift.
- Nutrition recommendations are computed on the fly — no database write occurs.

### Payments and subscriptions

- The server validates the payment amount against canonical plan prices on every payment request. A client cannot alter the price.
- A `Subscription` document is only created after a `Payment` document with `PAID` status exists and is referenced by `paymentId`.
- Duplicate active subscriptions for the same member are prevented server-side before creating a new one.

### Reviews

- A trainer review requires the reviewer to have purchased one of that trainer's courses.
- A course review requires the reviewer to be enrolled in that course.
- A workout review is open to all authenticated users.
- After every review is created, the target's aggregate rating is recalculated from all reviews.
- Duplicate reviews (same member + same target) are rejected.

## Workflow

1. Read the relevant service, resolver, and schema before editing. Understand the existing pattern before writing new code.
2. When adding a feature: follow the established entity pattern — never skip layers.
3. When fixing a bug: check whether the same bug pattern exists in other entities and fix all instances.
4. Keep changes small and focused. Do not reorganize folder structure unless all consumers are updated in the same change.
5. Do not `git commit` unless explicitly asked.

## Validation

Before declaring backend work done, verify:

```bash
npx tsc -p apps/gymora-api/tsconfig.app.json --noEmit
npx tsc -p apps/gymora-batch/tsconfig.app.json --noEmit
npm run build
```

Before declaring frontend work done, verify:

```bash
cd ../gymora-front && npx tsc --noEmit
```

Do not run the dev servers — assume they are already running with watch mode active.

## Things to avoid

- Do not display fields that exist in the schema but are never updated by any service — they will always be `0` or empty.
- Do not add `console.log` to production code paths.
- Do not use `graphql-upload` workarounds — it is the established upload mechanism in this project.
- Do not soft-delete content without also decrementing the relevant counter on the owner's member document.
- Do not create subscriptions without a verified payment reference.
- Do not add fake metrics, hardcoded statistics, or placeholder analytics to the frontend.
- Do not mix indentation — this repo uses tabs.

## Quick reference

| Need                   | Look in                                                                           |
| ---------------------- | --------------------------------------------------------------------------------- |
| Add a GraphQL query    | `gymora-front/apollo/user/query.ts`                                               |
| Add a GraphQL mutation | `gymora-front/apollo/user/mutation.ts`                                            |
| Add a backend entity   | `schemas/` → `libs/dto/` → `components/<entity>/` → `components.module.ts`        |
| Add a new enum value   | `libs/enums/gymora.enum.ts` (add to enum + `registerEnumType` already registered) |
| Add a page             | `gymora-front/pages/<route>/index.tsx`                                            |
| Add a mypage section   | `gymora-front/pages/mypage/<section>.tsx` + `GymSidebar.tsx` nav entry            |
| Add a batch job        | `apps/gymora-batch/src/jobs/` + `BatchService` method + `BatchModule` providers   |
| Understand auth flow   | `components/auth/` — `AuthGuard`, `WithoutGuard`, `RolesGuard`, `@AuthMember`     |
| Understand upload flow | `member.resolver.ts` `imageUploader` / `lesson.resolver.ts` `videoUploader`       |
| Find env variables     | `.env` in the monorepo root                                                       |
