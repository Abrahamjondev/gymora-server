# Gymora Frontend — Completed Tasks

## Migration: Nestar → Gymora

### Phase A: Branding (2026-06-08)
- Replaced all "Nestar" references with "Gymora" across 14+ files
- Updated `package.json` name, SEO meta tags, page titles, footer, join page
- Apollo client default URLs: `localhost:3007` → `localhost:3003`
- `.gitignore` comment updated

### Phase B1: Enums Alignment (2026-06-08)
- `MemberType.AGENT` → `MemberType.TRAINER`
- `CommentGroup`: removed PROPERTY/COMMENT, added TRAINER/COURSE/WORKOUT
- `LikeGroup`: PROPERTY → WORKOUT/COURSE/TRAINER
- `ViewGroup`: PROPERTY → WORKOUT/COURSE/TRAINER
- `BoardArticleCategory`: FREE/RECOMMEND/NEWS/HUMOR → FITNESS_TIPS/NUTRITION/WORKOUT_GUIDE/CHALLENGE/SUCCESS_STORY
- `NotificationType`: LIKE/COMMENT → SYSTEM/WORKOUT/NUTRITION/SUBSCRIPTION/CHAT
- Created 7 new enum files: workout, course, trainer, nutrition, subscription, payment, recommendation

### Phase B2: Types Alignment (2026-06-08)
- Extracted `MeLiked` and `TotalCounter` from `property.ts` to `common.ts`
- Updated 4 import paths (board-article, comment, follow, member)
- `Member.memberProperties` → `memberCourses` + `memberWorkouts`
- `CustomJwtPayload` updated
- `MemberUpdate` — removed `memberType`, `memberStatus`, `deletedAt`
- `AdminMemberUpdate` → `MemberUpdateByAdmin`
- Created type files: workout/, course/, trainer/

### Phase B3: GraphQL Operations (2026-06-08)
- Replaced `memberProperties` with `memberCourses`/`memberWorkouts` in all queries (14 occurrences)
- Replaced property queries with workout queries: GET_WORKOUT, GET_WORKOUTS, GET_MEMBER_WORKOUTS
- Replaced agent query: GET_AGENTS → GET_TRAINER_MEMBERS
- Fixed mutation names: `likeTargetBoardArticle` → `likeBoardArticle`, `removeBoardArticleByAdmin` → `deleteBoardArticleByAdmin`
- Fixed `UPDATE_MEMBER_BY_ADMIN` input type: `MemberUpdate` → `MemberUpdateByAdmin`
- Added admin queries/mutations: workouts, courses, trainers
- Fixed `ArticleMemberData` fields (only _id, memberNick, memberImage, memberType)

### Phase B4: Auth & Store (2026-06-08)
- `apollo/store.ts`: `memberProperties` → `memberCourses`/`memberWorkouts`
- `libs/auth/index.ts`: updateUserInfo/deleteUserInfo updated
- `libs/config.ts`: removed property-specific constants
- Fixed signup: removed `memberType` from `MemberInput` (backend doesn't accept it)
- Fixed login/signup error handling: removed `logOut()` from catch, proper error throw

### Backend: Admin APIs (2026-06-08)
- Added to gymora backend: `getAllTrainersByAdmin`, `getAllWorkoutsByAdmin`, `getAllCoursesByAdmin`
- Added mutations: `updateTrainerByAdmin`, `deleteTrainerByAdmin`, `updateWorkoutByAdmin`, `deleteWorkoutByAdmin`, `updateCourseByAdmin`, `deleteCourseByAdmin`
- All use `@Roles(MemberType.ADMIN)` + `@UseGuards(RolesGuard)`

### Backend: Article Permissions (2026-06-08)
- `createBoardArticle`: `@Roles(MemberType.TRAINER, MemberType.ADMIN)` — USER cannot write articles

---

## Phase C: UI Migration — Dark Theme (2026-06-08 – 2026-06-09)

### Global Changes
- MUI Theme: light → dark (#131314 bg, #1c1b1c paper, #00dce5 primary)
- SCSS: app.scss, variables.scss, homepage.scss — all dark
- Font: Poppins → Hanken Grotesk + JetBrains Mono
- Layouts: LayoutHome, LayoutBasic, LayoutFull — replaced old Top/Footer with GymNavbar/GymFooter
- Created: `GymNavbar.tsx` (dark glassmorphism navbar with auth state)
- Created: `GymFooter.tsx` (dark footer)

### Pages Built (all with dark theme, backend-connected)

| Page | Route | Backend Operations |
|------|-------|-------------------|
| Landing | `/` | GET_WORKOUTS, GET_TRAINER_MEMBERS, GET_BOARD_ARTICLES |
| Workout List | `/workout` | GET_WORKOUTS, LIKE_WORKOUT |
| Workout Detail | `/workout/detail` | GET_WORKOUT, GET_COMMENTS, LIKE_WORKOUT, CREATE_COMMENT, GET_WORKOUT_REVIEWS, CREATE_REVIEW |
| Trainer List | `/trainer` | GET_TRAINER_MEMBERS, LIKE_TARGET_MEMBER |
| Trainer Detail | `/trainer/detail` | GET_MEMBER, GET_TRAINER_BY_MEMBER_ID, GET_COURSES_BY_TRAINER_ID, GET_WORKOUTS_BY_MEMBER_ID, GET_TRAINER_REVIEWS, CREATE_REVIEW, SUBSCRIBE, UNSUBSCRIBE, LIKE_TARGET_MEMBER |
| Course List | `/course` | GET_COURSES |
| Course Detail | `/course/detail` | GET_COURSE, GET_COURSE_REVIEWS, CREATE_REVIEW, PURCHASE_COURSE |
| Login/Signup | `/account/join` | signup, login |
| Community List | `/community` | GET_BOARD_ARTICLES, LIKE_TARGET_BOARD_ARTICLE |
| Community Detail | `/community/detail` | GET_BOARD_ARTICLE, GET_COMMENTS, CREATE_COMMENT, UPDATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE |
| Member Profile | `/member` | GET_MEMBER, GET_WORKOUTS_BY_MEMBER_ID, SUBSCRIBE, UNSUBSCRIBE, LIKE_TARGET_MEMBER |
| My Page | `/mypage` | GET_DASHBOARD_STATS, GET_MEMBER_WORKOUTS, GET_MEMBER_PURCHASED_COURSES, GET_TRAINER_COURSES, GET_NOTIFICATIONS, MARK_NOTIFICATION_READ, CREATE_WORKOUT, CREATE_TRAINER, UPDATE_MEMBER |
| Nutrition | `/nutrition` | GET_MEAL_HISTORY, GET_NUTRITION_RECOMMENDATION, ADD_MEAL_LOG, DELETE_MEAL_LOG |
| Progress | `/progress` | GET_PROGRESS_TIMELINE, ADD_PROGRESS |
| Subscription | `/subscription` | GET_MEMBER_SUBSCRIPTIONS, GET_PAYMENT_HISTORY |
| Chat | `/chat` | GET_CONVERSATIONS, GET_MESSAGE_HISTORY, SEND_MESSAGE |
| Support | `/cs` | Static FAQ |
| About | `/about` | Static |
| Admin Workouts | `/_admin/workouts` | GET_ALL_WORKOUTS_BY_ADMIN, DELETE_WORKOUT_BY_ADMIN |
| Admin Courses | `/_admin/courses` | GET_ALL_COURSES_BY_ADMIN, DELETE_COURSE_BY_ADMIN |
| Admin Trainers | `/_admin/trainers` | GET_ALL_TRAINERS_BY_ADMIN, DELETE_TRAINER_BY_ADMIN |
| Admin Users | `/_admin/users` | GET_ALL_MEMBERS_BY_ADMIN (existing, AGENT→TRAINER fixed) |
| Admin Community | `/_admin/community` | GET_BOARD_ARTICLES_BY_ADMIN, DELETE_BOARD_ARTICLE_BY_ADMIN (existing) |

### Old Nestar Routes → Redirects
- `/property` → `/workout`
- `/property/detail` → `/workout/detail`
- `/agent` → `/trainer`
- `/agent/detail` → `/member`
- `/_admin/properties` → `/_admin/workouts`

### MyPage Features (role-based menu)
- **All users**: Dashboard, My Profile, My Courses (purchased), Notifications, Nutrition, Progress
- **TRAINER only**: My Workouts, Create Workout, Trainer Courses, My Articles, Write Article
- **ADMIN only**: My Articles, Write Article
- **USER only**: Become Trainer (createTrainer form)

### Bug Fixes
- MUI CssBaseline white flash → dark background from first render
- Like/Follow/Comment: refetch + manual state update pattern (Apollo onCompleted unreliable with refetch)
- GET_MEMBER: added `meLiked` field (was missing)
- Image upload: fixed `REACT_APP_API_GRAPHQL_URL` env mapping in next.config.js
- Community articles not showing: fixed `articleCategory` useEffect dependency
- ArticleMemberData: trimmed to actual backend fields (_id, memberNick, memberImage, memberType)
- Signup: removed `memberType` from MemberInput (backend rejects it)
- Auth error handling: removed `logOut()` from catch (caused page reload before error shown)
- `Definer:` prefix stripped from error messages in UI

### Design System (Stitch)
- Source: "Gymora Fitness Platform" project (dark theme)
- Colors: #131314 (bg), #1c1b1c (surface), #e9feff (primary), #00dce5 (accent), #ff8a00 (secondary), #b9caca (muted text)
- Fonts: Hanken Grotesk (display/body), JetBrains Mono (labels/mono)
- Components: bento cards, glassmorphism navbar, grayscale-to-color hover, pill filters, star ratings

---

## Bug Fix Round (2026-06-09)

### Fixed:
1. MyPage menu — added `/chat` (Messages) and `/subscription` (Subscription) links
2. Removed old Nestar property/agent SCSS imports from `scss/pc/main.scss`
3. Cleaned 6 console.log statements from admin pages
4. TypeScript: 0 errors confirmed


## Refetch Bug Fixes (2026-06-09)

### Fixed refetch + state update pattern in:
1. `/progress` — addProgress refetch → setTimeline manual update
2. `/community/detail` — like article refetch → setBoardArticle update
3. `/community/detail` — create comment refetch → setComments + setTotal update
4. `/community/detail` — delete comment refetch → setComments + setTotal update
5. `/community` — like article in list refetch → setBoardArticles + setTotalCount update
6. `/mypage` — mark notification read refetch → setNotifications update

### Root cause:
Apollo Client `refetch()` doesn't always trigger `onCompleted`. Manual `const { data } = await refetch()` + `setState(data)` pattern required for immediate UI update.

## Advanced Filtering System (2026-06-09)

### /workout — Enhanced Filters:
- **Search bar** — text search across workout titles/descriptions
- **Difficulty pills** — ALL / Beginner / Intermediate / Advanced
- **Access filter** — All / 🆓 Free / 💎 Premium (isFree toggle)
- **Muscle group** — Chest / Back / Legs / Shoulders / Arms / Core / Full Body (targetMuscle)
- **Sort dropdown** — Newest / Most Liked / Most Viewed / Top Ranked / Highest Burn
- **Active filters summary** — shows applied filters with ✕ Clear all button
- All filters combine: difficulty + muscle + access + text + sort

### /course — Enhanced Filters:
- **Search bar** — text search across course titles/descriptions
- **Category pills** — All Goals / Strength / Cardio / Yoga / Mobility / Nutrition
- **Difficulty chips** — Any / Beginner / Intermediate / Advanced
- **Sort dropdown** — Top Ranked / Highest Rated / Price / Newest / Duration
- All filters combine: category + difficulty + text + sort

### Backend search fields used:
- WorkoutSearch: workoutDifficulty, targetMuscle, text, isFree
- CourseSearch: courseCategory, courseDifficulty, text

## Business Logic: All Workouts Free (2026-06-09)

### Changed:
All workouts are now FREE — no premium/paid workouts. Business model: free workouts → paid courses.

### Removed from frontend:
1. `/workout` — removed Free/Premium access filter pills
2. `/workout` — removed isFree badge from workout cards
3. `/workout/detail` — removed "FREE/PREMIUM" text from hero
4. `/mypage` (Create Workout) — removed Free/Premium toggle, workouts always free
5. `/mypage` (My Workouts) — removed FREE/PREMIUM badge
6. `/_admin/workouts` — simplified isFree column to always show "✅ Free"

### Business flow:
User → sees trainer's FREE workouts → likes them → buys trainer's PAID course

## Minor: Remove duration sort from courses (2026-06-09)
- Removed "Duration" option from course sort dropdown
- Remaining sorts: Top Ranked, Highest Rated, Price, Newest

## Premium Redesign: Landing Page + Navbar (2026-06-09)

### GymNavbar — Premium marketplace navbar:
- Logo: Gradient icon (G) with cyan glow shadow + lowercase "gymora" text
- Center nav: Pill container with glass background, active items have cyan dot indicator
- Scroll effect: transparent → solid glass on scroll (0.4s transition)
- Height: 64→72px, maxWidth: 1200→1280px
- Auth state: notification bell + avatar with type badge (USER/TRAINER) + nick
- Guest state: "Log in" text + "Get Started" gradient button with glow
- All transitions: cubic-bezier(0.4, 0, 0.2, 1) for premium feel
- Self-contained spacer (72px div) — layouts no longer need paddingTop

### HeroSection — Premium landing hero:
- Background: radial gradient glow (cyan, subtle) behind heading
- Badge: cyan-tinted glass pill with pulsing dot (animation: pulse 2s infinite)
- Heading: responsive clamp(32px, 5vw, 56px), gradient text on "Real results."
- Subtitle: slightly transparent text (0.85 opacity) for depth
- Primary button: gradient bg + glow shadow + translateY(-2px) hover lift
- Secondary button: glass bg + cyan border on hover + lift
- Stats row: 4 centered stats (200+ Programs, 50K+ Athletes, etc.)
- All elements: staggered fadeInUp animation (0.1s delay between elements)

### Global CSS (app.scss):
- Added @keyframes: fadeInUp, fadeIn, pulse, shimmer
- Added smooth scroll behavior (html { scroll-behavior: smooth })

## Premium Landing Page Redesign (2026-06-09)

### Structure: Hero → Hot Workouts → Top Courses → Elite Trainers → Footer

### HotWorkouts (NEW component):
- Backend: GET_WORKOUTS sorted by workoutRank DESC, limit 6
- Layout: Top 2 large cards (16/10 aspect) + bottom 4 compact cards (4-col grid)
- Each card has rank badge (#1, #2, etc.), target muscle + difficulty tags, kcal + views + likes
- Staggered fadeInUp animation, translateY(-4px) hover lift
- Dynamic — updates automatically when workout ranks change

### TopCourses (NEW component):
- Backend: GET_COURSES sorted by courseRank DESC, limit 4
- 4-column grid with category-colored accents (STRENGTH=orange, CARDIO=cyan, YOGA=purple, MOBILITY=green)
- Hover: colored border glow matching category, translateY(-4px) lift with shadow
- Price badge on image, rating star, duration + difficulty meta
- Dynamic — updates when course ranks change

### EliteTrainers (REDESIGNED):
- Backend: GET_TRAINER_MEMBERS sorted by memberRank DESC, limit 5
- Layout: Featured trainer (3/4 large card) + 4 small cards (2x2 grid)
- Featured: full bio, workout count, follower count, "Top Trainer" badge
- Small cards: 1:1 aspect, grayscale → color on hover, name + stats overlay
- Dynamic — updates when trainer ranks change

### LandingFooter (REDESIGNED):
- Logo matches navbar (gradient G icon + lowercase "gymora")
- Column titles: JetBrains Mono uppercase with 0.12em spacing
- Link hover: subtle color transition to light cyan
- Darker background (#0a0a0b) for visual separation

### Removed:
- SubscriptionPlans from landing (moved to /subscription page)
- CommunityBoards from landing (accessed via /community nav)
- FeaturedWorkouts (replaced by HotWorkouts)
- All hardcoded stats replaced with backend queries

## Balanced Grid Redesign (2026-06-09)

### HotWorkouts — 3-column balanced grid:
- All 6 cards: same size (16/9 aspect), 14px radius, 16px gap
- Featured (#1, #2): cyan border glow + "Trending" badge (inside card, not larger)
- Other cards (#3-#6): same card, just no badge
- Hover: translateY(-3px) + shadow, image scale(1.05)

### EliteTrainers — 4-column balanced grid:
- All 4 cards: same size (4/5 aspect), 14px radius, 16px gap
- #1 trainer: green border glow + "Top Trainer" badge (inside card, not larger)
- Other trainers: same card, rank badge only
- Grayscale(0.6) → color on hover, name + desc overlay

### Design principle:
- Featured = badge/border highlight, NOT size difference
- All sections use consistent card language
- Workout: 3-col, Course: 4-col, Trainer: 4-col
- Same hover pattern everywhere: translateY(-3px) + border glow + shadow

## Hero Section — Animated Mesh Background (2026-06-09)

### Problem: Large empty black areas on left/right sides
### Solution: 5-layer animated background system

Layers (bottom to top):
1. **Mesh gradient base** — animated 6-stop gradient (deep-blue/teal/cyan), `background-size: 400%`, 25s infinite loop
2. **Top-right cyan orb** — 700px radial glow, `blur(60px)`, `floatOrb1` 30s drift animation
3. **Bottom-left teal orb** — 600px radial glow, `blur(50px)`, `floatOrb2` 25s drift animation
4. **Center accent** — elliptical cyan radial at content center
5. **Grain noise** — SVG fractalNoise texture at 0.03 opacity for depth

Additional:
- Bottom fade gradient — smooth transition to page background (#0d0d0e)
- Section: `min-height: 90vh`, flex centered
- Badge: `backdropFilter: blur(12px)` glass effect
- Secondary button: `backdropFilter: blur(8px)` glass effect

Animations added to app.scss:
- `meshGradient` — 25s, 4-stop background-position shift
- `floatOrb1` — 30s, translate + scale drift
- `floatOrb2` — 25s, different drift pattern

All pure CSS, GPU-friendly transforms, no dependencies.

## 100% Backend Coverage (2026-06-09)

### All 93/93 backend operations now in frontend Apollo (excluding 3 internal: sayHello, checkAuth, checkAuthRoles)

### New Apollo operations added (26):
Queries: GET_LESSONS_BY_COURSE, GET_LESSON_PROGRESS, GET_FREE_WORKOUT_COUNT, GET_AI_ANALYZE_HISTORY, GET_RECOMMENDATIONS, GET_ONLINE_STATUS, GET_PARTNER_ONLINE_STATUS, GET_LESSONS_BY_ADMIN
Mutations: COMPLETE_LESSON, CREATE_LESSON, UPDATE_LESSON, DELETE_LESSON, CREATE_COURSE, CREATE_COURSE_CHECKOUT_SESSION, CONFIRM_COURSE_PAYMENT, CREATE_SUBSCRIPTION, INITIATE_PAYMENT, ANALYZE_FOOD_IMAGE, IMAGE_UPLOADER, VIDEO_UPLOADER, IMAGES_UPLOADER, CREATE_NOTIFICATION, DELETE_LESSON_BY_ADMIN

### New UI features:
1. Course Detail — Lesson progress tracking (complete lesson button, completed status)
2. Course Detail — Stripe checkout (paid courses redirect to Stripe, free courses enroll directly)
3. MyPage — Create Course form (trainer: title, desc, category, difficulty, price, duration)
4. Nutrition — AI food analysis history section (sidebar)
5. All admin lesson operations in admin queries

### Coverage: 93/93 = 100%

## Final Cleanup (2026-06-09)

### Fixed:
1. MyFavorites — renamed `likeTargetProperty` → `likeWorkout`, removed duplicate comment
2. Removed 26 console.log/console.warn statements from 15 component files
3. Zero AGENT references remaining
4. Zero duplicate Apollo exports
5. Zero emojis in source code

### Final state:
- TypeScript: 0 errors
- Console.log: 0 remaining
- AGENT refs: 0 remaining
- Duplicate exports: 0
- Emoji: 0
- Backend coverage: 93/93 (100%)
- Stitch screens: 20/20 (100%)

## MyPage Full Redesign (2026-06-09)

### Design fixes:
- Background: #131314 → #0d0d0e (deeper)
- MaxWidth: 1200 → 1280, padding: 24 → 32
- Sidebar: avatar borderRadius circle → 12px rounded, border subtle 0.1 opacity
- Menu: removed bullet dots, clean text only, unread notification badge counter
- Card styles: consistent cardStyle with hover translateY(-3px) + border glow
- All sections: fadeInUp animation on render
- Buttons: gradient styles (cyan for workout, orange for course, green for trainer)
- Label style: extracted reusable constant

### Logic fixes:
- Added GET_RECOMMENDATIONS query → dashboard shows personalized recommendations with target badges
- Notification unread count badge in sidebar menu
- Read/unread notification visual distinction improved (opacity-based)
- Quick actions: 3-column grid (Nutrition, Progress, Community) with hover lift
- Subscription summary: orange accent (was cyan)
- Empty states: softer text color rgba(185,202,202,0.5)

### Structural:
- Recommendation section: target badge + reason + item count
- Trainer Courses: separate "+ Create" button with orange gradient
- Create buttons: gradient matching section color (workout=cyan, course=orange, trainer=green)

## Subscription Page — Real Stripe Payment (2026-06-09)

### Stripe Integration:
1. Installed `@stripe/stripe-js` + `@stripe/react-stripe-js`
2. Added `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.development`
3. Added key to `next.config.js` env mapping

### Payment Flow (end-to-end working):
1. User selects plan (Monthly $14.99 / Yearly $119.88) — visual toggle with cyan highlight + checkmark
2. Clicks "Subscribe to [Plan] Plan" button
3. Frontend calls `initiatePayment(amount, currency, plan, provider)` → backend creates Stripe PaymentIntent
4. **Payment modal** opens with Stripe CardElement (dark theme, premium UI)
5. User enters card details (test: 4242 4242 4242 4242)
6. `stripe.confirmCardPayment(clientSecret)` → Stripe processes payment
7. On success → `createSubscription(paymentId, plan, price)` → backend activates subscription
8. UI updates: active plan card, payment history refreshed

### Smart Provider Detection:
- If `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set → sends `paymentProvider: 'STRIPE'` → real Stripe PaymentIntent flow
- If key is missing → sends `paymentProvider: 'PAYME'` → backend falls to mock mode → instant PAID → subscription created
- Backend `sk_test_` key = test mode (no real charges), `sk_live_` = production

### UI Features:
- Plan selection: clickable cards with cyan border glow + circular checkmark indicator
- Payment modal: glassmorphism overlay, CardElement with dark theme, lock icon "Secured by Stripe"
- ZIP code hidden (`hidePostalCode: true`)
- Test card hint shown in modal
- Cancel/Pay buttons, processing state, error display
- Active subscription banner with plan name, price, expiry date
- Payment history with status colors (PAID=green, PENDING=orange)

### Mutations updated:
- `CREATE_SUBSCRIPTION` response: added `price`, `startedAt`, `expiresAt`, `paymentId` fields

### Files modified:
- `pages/subscription/index.tsx` — full rewrite with Stripe Elements
- `apollo/user/mutation.ts` — CREATE_SUBSCRIPTION response fields
- `.env.development` — NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
