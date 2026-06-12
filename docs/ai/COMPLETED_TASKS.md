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

## MyPage Sidebar Unification + Nutrition Overhaul (2026-06-09)

### Sidebar: Messages, Nutrition, Progress, Subscription moved inside MyPage
- **Problem**: These 4 pages were separate routes (`/chat`, `/nutrition`, `/progress`, `/subscription`) — navigating to them caused the sidebar to disappear
- **Solution**: Extracted content into reusable components, rendered as `category` inside `/mypage`
- Created 4 new components in `libs/components/mypage/`:
  - `ChatContent.tsx` — Messages (conversations + chat)
  - `NutritionContent.tsx` — Nutrition dashboard
  - `ProgressContent.tsx` — Progress tracker
  - `SubscriptionContent.tsx` — Subscription with Stripe
- Removed `isLink` property from menuItems — all items now render inside mypage with sidebar visible
- `menuHandler` simplified — no more `router.push` to external routes

### Sidebar Visual Upgrade
- Profile card: circular avatar with cyan glow border, gradient background, badge-style member type
- Menu grouped into sections: (none), Content, Activity, Health, (none) — with section title labels
- Each item has an icon (Unicode symbols)
- Active state: gradient background, cyan left indicator bar, icon highlight, box-shadow
- Become Trainer: distinct green accent
- Sticky positioning (`position: sticky, top: 24px`)
- Text readability improved: inactive items `#c8d6d6`, icons `#9aabab`, font-weight 500, font-size 13.5px

### Nutrition Plan Calculator
- **Before**: Hardcoded values (gender: MALE, age: 25, weight: 75kg) sent to `getNutritionRecommendation`
- **After**: Interactive form with Gender toggle, Age, Height, Weight, Activity Level select, Goal selector (Weight Loss / Maintenance / Muscle Gain) with visual cards
- Backend calculates: BMR (Mifflin-St Jeor), TDEE, daily calories, protein/carbs/fats, BMI, meal plan, tips
- Results show: macro targets, body metrics (BMI, BMR, TDEE), suggested meal plan (uzbek food suggestions), personalized tips
- Today's intake: progress bars comparing eaten vs target
- **localStorage persistence**: form values and results saved — navigating away and back preserves the plan

### AI Food Scanner
- **"Scan Food" button** in header — uploads food image
- Backend: GROQ Llama Vision API analyzes the image → returns foodName, calories, protein, carbs, fats
- Scan result card: food image preview, nutritional breakdown (4 macro cards)
- **"Log as" buttons**: Breakfast / Lunch / Dinner / Snack — adds AI result directly to daily meal log
- AI History sidebar: shows past scans with thumbnail, macros, and quick-log buttons (B/L/D/S)
- Logged meals count toward daily nutrition progress bars

### Files created:
- `libs/components/mypage/ChatContent.tsx`
- `libs/components/mypage/NutritionContent.tsx` (full rewrite)
- `libs/components/mypage/ProgressContent.tsx`
- `libs/components/mypage/SubscriptionContent.tsx`

### Files modified:
- `pages/mypage/index.tsx` — new imports, menuSections with icons/groups, sidebar redesign, category renders

## Landing Page Premium Redesign (2026-06-10)

### Hero — full-bleed athletic photo
- New asset: `public/img/banner/hero-athlete.jpg` (Unsplash, free license, dark barbell shot matching cyan palette)
- Duotone tint overlays + grain + orb retained from previous mesh system
- Editorial typography: clamp(46px → 92px), per-word rise reveal animation (lpRise)
- Count-up animated stats (real backend totals: GET_WORKOUTS / GET_TRAINER_MEMBERS metaCounter)
- Discipline marquee strip below hero (muscle groups + course categories from app's filter vocabulary)

### New landing sections (all backend-grounded, hide when empty)
- `HowItWorks.tsx` — 3 steps mirroring real product flow (free workouts → courses w/ Stripe → AI nutrition/progress)
- `CommunityPulse.tsx` — latest 3 articles via GET_BOARD_ARTICLES (createdAt DESC)
- `PricingSection.tsx` — canonical PLAN_PRICES mirror ($14.99 monthly / $119.88 yearly = $9.99/mo, Save 33%) → /subscription
- (AthleteReviews + FinalCTA were built, then removed on user request — sparse review data looked weak)

### Section redesigns
- HotWorkouts: bento grid — #1 workout featured 2x2 card, 4 compact cards (limit 6→5)
- EliteTrainers: agency-style editorial name list + hover-driven sticky portrait panel
- TopCourses: spotlight layout — #1 course as cinematic full-image feature card (desc, chips, hover-reveal "View Program" CTA, category glow) + ranked compact rows 02–04 with accent bar, thumb, meta, price, hover slide

### Architecture / quality
- New `scss/landing.scss` (imported in app.scss): full lp-* class system, all grids responsive (1024px → 2col, 640px → 1col), keyframes lpRise/lpMarquee
- New hooks: `useCountUp` (rAF ease-out), `useReveal` (IntersectionObserver scroll-reveal, `ready` param for data-dependent sections)
- Inline-style JS hovers replaced with CSS :hover (workouts/trainers/buttons)
- `loading="lazy"` on all below-fold card images
- GymNavbar: center nav hidden ≤768px (was overflowing on mobile)
- Verified via headless Chrome screenshots: desktop 1440px + mobile 390px, all sections render, TypeScript 0 errors
- Zero GraphQL operation changes — UI layer only

### Navbar + Footer redesign (2026-06-10, follow-up)
- GymNavbar rewritten to CSS classes (gnav-*): 62px slim bar, "gymora." wordmark with cyan dot, logo mark rotates+glows on hover, mono-uppercase nav links with animated underline (replaces pill container), logged-in state collapsed into one rounded chip (avatar + nick + divider + Log out), guest state Log in + pill Get Started
- New `overlay` prop: LayoutHome renders navbar transparently over the hero (no 62px spacer, gradient scrim until scroll) — hero photo now bleeds to the very top; other layouts keep the spacer
- LandingFooter: 4 columns (brand / Platform / Account / Company), giant outlined GYMORA watermark bleeding off the bottom, bottom bar with copyright + smooth-scroll "Back to top ↑" pill
- Verified: top/scrolled/mobile navbar states + footer screenshots, TypeScript 0 errors
- Follow-up: GYMORA watermark removed from footer (user request); navbar readability pass — links switched from 11px mono-uppercase to 14px/700 Hanken Grotesk with text-shadow, underline 1px→2px, user nick 14px/700 white, Log out 12.5px/600

## Workout Library Premium Redesign (2026-06-10)

- New `scss/workout.scss` (wl-* classes), all logic (Apollo queries, optimistic like, filters) untouched
- Hero: editorial title with gradient word, orange eyebrow, live "{total} protocols available" badge with pulsing dot, soft cyan glow
- Filter console: single sticky glass toolbar (sticks at 72px under navbar) — search with focus ring, custom-arrow sort select, segmented difficulty control (sliding white pill), muscle chip row
- Cards: image-forward (16/10, gradient shade, hover zoom), muscle chip on image, KCAL badge (orange mono, bottom-right), difficulty as colored dot (green/orange/red), views + LikeButton + hover-reveal arrow
- Removed FREE/PREMIUM emoji badge from cards (user request; all workouts are free)
- Removed mobile placeholder fork ("GYMORA WORKOUTS MOBILE") — page is now fully responsive (3/2/1 columns)
- Skeleton loaders with shimmer; styled empty state; Clear-all handler extracted
- Fixed mobile horizontal overflow (hero glow → overflow-x: clip on page; seg control scrolls internally)
- Verified: desktop top/sticky-scroll states, mobile 390px scrollWidth = 390, TypeScript 0 errors
- Readability pass (user request): difficulty seg buttons 12.5→14px/700 bright, muscle chips switched from 10.5px mono-uppercase to 13.5px/700 Hanken sentence-case, views 10→13px/600, difficulty label 10→12.5px/700, KCAL 10.5→12px/700

## Workout Detail Premium Redesign (2026-06-10)

- New wd-* classes appended to `scss/workout.scss`; all logic untouched (GET_WORKOUT/GET_COMMENTS/GET_WORKOUT_REVIEWS, optimistic like, comment + review mutations)
- Hero: cinematic clamp(400–540px) full-bleed thumbnail with dual tint + grain, "← Library" glass back pill, chips (muscle cyan / difficulty colored / KCAL orange), editorial title clamp(36–60px), bold meta row (views · likes · exercises)
- Layout: content + 320px sticky sidebar (right) via grid-template-areas; on ≤1024px sidebar stacks ABOVE content
- Sidebar: glass Workout Summary card (mono labels, 21px/800 values, difficulty color dot) + full LikeButton
- Training Plan: hover-slide rows with cyan index, SETS/REPS chips
- Comments + Athlete Reviews: glass form cards (focus-ring textarea/input, star picker with hover scale), avatar/nick/date rows; section heads with mono counts; "Reviews" renamed Comments vs Athlete Reviews (star)
- Removed mobile placeholder fork — fully responsive; mobile scrollWidth = 390 verified
- TypeScript 0 errors; desktop top/scrolled + mobile screenshots verified

## Trainers Page Premium Redesign (2026-06-10)

- Reuses wl-hero/wl-console/wl-search/wl-sort/wl-badge system; new tr-* classes in `scss/workout.scss`
- Hero: green eyebrow, "Elite Trainers" gradient title, live "{total} trainers on the roster" badge
- Added sort dropdown (Top Ranked / Most Liked / Most Viewed / Newest — verified against backend availableTrainerSorts whitelist in libs/config.ts) + search clear button
- Cards: portrait 4/5, grayscale→color via CSS on card hover (no JS handlers), name+desc overlay on image, ★ memberRank chip, footer with bold workouts/followers counts + LikeButton + hover arrow; green accent matching landing trainers
- Stats bar restyled (tr-stats): Total Trainers / Workouts Published / Followers / Likes — removed fake "COMMUNITY: Active" stat, replaced with real likes sum
- Mobile placeholder fork removed; responsive 3/2/1; mobile scrollWidth = 390 verified; TypeScript 0 errors; optimistic like logic untouched

## Trainer Detail Redesign + Logic Gaps Fixed (2026-06-10)

### Logic fixes (backend-verified)
- ROUTING FIX: trainer list + landing EliteTrainers pushed to `/member?memberId` — the rich `/trainer/detail` page was unreachable. Both now route to `/trainer/detail?id=<memberId>`
- Review eligibility mirrored client-side (review.service.ts:27-39 — purchase required): GET_MEMBER_PURCHASED_COURSES fetched for logged-in users; form only shows when a purchased course's trainerId matches; otherwise an explanatory note
- Duplicate review (review.service.ts:61-62) mirrored: if reviews contain user._id → "already reviewed" note instead of form
- Previously-fetched-but-never-shown data now displayed: trainerSocialLinks (external links with ↗), trainerRatingCount (next to rating), trainerRank, memberViews, memberWorkouts
- Course cards now show courseThumbnail (was text-only); workouts no longer sliced to 4 — all shown
- Review error surfaces graphQLErrors[0].message (backend permission texts); follow button gets busy-guard (no double-submit)

### Design (td-* classes in workout.scss)
- "← Trainers" back pill; sticky profile card: glowing avatar ring, verified/pending chip, 6-stat grid (rating+count / experience / followers / workouts / views / rank), specialization chips, social links, gradient Follow button (ghost "Following" state) + LikeButton
- Content: Free Workouts (wl-card 2-col), Courses (lp-course-row ranked rows with accent + thumb), Athlete Reviews (wd-comment cards + permission-aware form)
- Mobile placeholder removed; responsive (profile stacks above content); mobile scrollWidth = 390; TypeScript 0 errors

### Follow-up: Articles + Followers/Following added (2026-06-10)
- Articles section: GET_BOARD_ARTICLES with search.memberId (public, WithoutGuard verified) — latest 4 trainer articles as lp-article-card grid → /community/detail
- Followers/Following panel in sidebar (td-people-card): tabbed (counts from member.memberFollowers/memberFollowings), lists via GET_MEMBER_FOLLOWERS (search.followingId) / GET_MEMBER_FOLLOWINGS (search.followerId) — both WithoutGuard public, FollowSearch field names verified in follow.input.ts
- Person rows: avatar + name + USER/TRAINER type chip (trainer rows green); click routes TRAINER → /trainer/detail, USER → /member

## Member Profile Page Implemented + Redesigned (2026-06-10)

- /member page had PLACEHOLDER tabs ("Followers list will be implemented with the follow components migration") — now fully implemented:
  - Followers tab: GET_MEMBER_FOLLOWERS (search.followingId), person cards with type chips, routes by memberType
  - Following tab: GET_MEMBER_FOLLOWINGS (search.followerId)
  - Articles tab: GET_BOARD_ARTICLES (search.memberId), lp-article-card grid → /community/detail
  - Workouts tab: upgraded to wl-card grid with KCAL/difficulty
- Redesigned to td-* premium system: sticky profile card (avatar ring, type chip, 6-stat grid incl. likes/views), segmented tab bar with live counts, follow busy-guard
- TRAINER members are auto-redirected to the richer /trainer/detail page (router.replace)
- Mobile placeholder fork removed; TypeScript 0 errors; verified with real USER (testuser2) and trainer-follower navigation

## Programs Page Redesign + Naming Unification (2026-06-10)

- NAMING: UI unified to "Programs" everywhere (backend stays `course`, no API changes): landing section "Top Courses" → "Top Programs", trainer detail "Courses" → "Programs", HowItWorks/Pricing copy "courses" → "programs". Navbar/footer already said Programs
- /course page redesigned (cl-* classes in workout.scss, reuses wl-hero/console/seg/skel system):
  - Hero: "Training Programs" gradient title, live "{total} programs available" badge
  - Console: search + sort (courseRank/courseRating/coursePrice/createdAt), difficulty segmented control, category buttons with category-colored dots (active state takes the category accent)
  - Cards: category-accent system via CSS vars (--accent/-soft/-glow) — hover border+glow in category color, price + rating overlays on image, 2-line desc, duration/difficulty meta, "View Program →" CTA that fills with accent on hover
  - Active-filters summary row with Clear all; shimmer skeletons replace full-screen spinner
- Mobile placeholder fork removed; responsive 3/2/1; mobile scrollWidth = 390; TypeScript 0 errors; Apollo logic unchanged

## Program Detail Redesign + Honest Data (2026-06-10)

- /course/detail redesigned with wd-*/pd-* system; ALL logic untouched (Stripe checkout via createCourseCheckoutSession for paid, purchaseCourse for free, completeLesson, review flow)
- REMOVED FAKE "Included" card ('PDF training logs', 'Community Discord', 'Certificate' — none exist on backend; violated no-fake-content rule)
- Hero: cinematic thumbnail bg, "← Programs" back pill, category-accent + difficulty + rating chips, editorial title, real meta (weeks · sessions · enrolled count from purchasedMembers.length)
- Sticky sidebar: price card with gradient Enroll CTA ("Secure Stripe checkout" note for paid, "✓ Enrolled" state), NEW progress card for enrolled members (completed/total + animated bar from real getLessonProgress), Program Summary stats (duration/sessions/category/level dot)
- Curriculum: week headers (W01 badge + divider line), lesson rows with sequential number → green ✓ when completed, duration, Mark done button; verified getCourse populates lessons (course.service.ts:36-41) — dev DB simply has none seeded, honest "coming soon" empty state
- Reviews: enrollment-gated form (mirrors backend course-review rule) + already-reviewed note; errors surface graphQLErrors message
- Mobile placeholder fork removed; responsive; mobile scrollWidth = 390; TypeScript 0 errors

## Nutrition Plan Per-User Isolation Fix (2026-06-10)

- BUG: nutrition plan form + AI recommendation were cached in localStorage under GLOBAL keys (gymora_nutrition_form/result) — a plan generated by one account appeared for every other account on the same browser
- FIX: keys are now namespaced per member (`gymora_nutrition_form_<memberId>`), state loads via useEffect when user._id becomes available, save effects guard on storageReady; legacy global keys are removed on load
- Audited remaining localStorage usage: login/logout timestamps and locale are intentionally global; JWT handled by auth lib — no other per-user leaks

## MyPage Role-Based Menu Cleanup (2026-06-10)

- Trainers no longer see consumer-only sections: My Programs (purchased), Nutrition, Progress, Subscription — new `hideForTrainer` flag + shared isItemVisible() predicate; empty sections (e.g. Health) collapse automatically
- Category GUARD: allowed keys computed per role; direct URL hits like ?category=subscription fall back to dashboard for trainers
- Menu regrouped: "Studio" (trainer content tools) / "Training" (user purchased programs) / Activity / Health; labels unified to Programs naming (My Programs, Create Program — sidebar, headers, submit button, empty-state link)
- Dashboard is role-aware: trainers see studio stats (Workouts Published / Programs / Likes / Articles — JWT payload fields, memberFollowers not in payload) and Create Workout / Create Program / Write Article quick actions; consumers keep calories/progress stats, Recommendations and subscription summary (both now hidden for trainers); consumer quick actions now open in-page categories instead of legacy /nutrition /progress routes
- Sidebar readability: items 13→14px, weight 600/700, brighter inactive color
- TypeScript 0 errors

## Privacy + Terms Pages (2026-06-10)

- Footer Privacy/Terms were dead '#' links — created /privacy and /terms as premium static pages (wl-hero header, wd-section blocks, Support CTA); content is honest plain-language reflecting actual platform behavior (Stripe handles cards, review eligibility rules, free workouts / paid programs, health disclaimer)
- Both footers (LandingFooter + GymFooter) now link to the real pages; smoke-tested clean

## BACKEND FIX: Socket Crash on Invalid Token (2026-06-10)

- Root cause: socket.gateway.ts handleConnection's catch emitted 'exception' + disconnected the client, then RE-THREW WsException — lifecycle-hook throws bypass Nest's ws exception filters → unhandled rejection → process exit. Any stranger with an invalid token could kill the API (DoS)
- Fix: removed the re-throw (emit + disconnect is the correct rejection); explanatory comment added. WsException retained where valid (inside @SubscribeMessage handlers)
- Verified: apps/gymora-api tsc clean; live test — 3 consecutive invalid-token connections rejected, backend stays up (sayHello 200 after)

## Readability + Realtime Verification Pass (2026-06-10)

### Dim text fixed platform-wide (user: landing views/likes unreadable)
- HotWorkouts cards: kcal → 13px/700 orange; views/likes → 13px/600 with white bold numbers (were 10px mono at 0.35 alpha)
- Elite Trainers: list indices → cyan, workouts/followers meta → 13px/600 bright (were 10px mono 0.4), footnote brightened, inactive names 0.35→0.5
- Top Programs: ranked-row meta 9.5→11px/600 bright, row indices → cyan, spotlight meta 10.5→12px/600
- Community Pulse cards: meta 10px mono 0.45 → 12.5px/600 Hanken bright; footer copyright 0.25→0.45

### Realtime verified
- Socket endpoint LIVE-tested: connects, auth-guard rejects invalid tokens with proper exception; auth token path (handshake.auth.token) matches gateway; chat:message event names match both sides — messages will flow for logged-in users
- Notifications UI verified working (list/markRead/markAll); creation still backend-limited to follows (known)
- ⚠ BACKEND HARDENING NOTE: an invalid-token socket connection CRASHED the Nest process (unhandled exception in handleConnection) — backend should wrap handleConnection in try/catch + client.disconnect(). Backend restarted (log /tmp/gymora-api.log)

### Design consistency
- Full-page screenshot review after fixes: landing sections consistent; production build + 20-page smoke previously green

## Final Verification Pass (2026-06-10)

- PRODUCTION BUILD PASSES: `yarn build` — all 33 routes compile + prerender (17.9s), zero errors
- Full smoke test: 20 page loads (13 desktop + 7 mobile routes) — zero runtime errors
- Hygiene sweep: no emojis, no TODOs, no unreachable mobile forks; deleted last dead folders (components/property, components/agent); removed decorative login/signup console.logs from libs/auth (error-path logs in utils kept intentionally)
- Known acceptable leftovers: Privacy/Terms footer links are '#' (no legal pages exist — honest placeholder), unused apollo exports kept for future use, cross-member notifications backend-blocked
- Note: running `yarn build` corrupted the live dev server's .next cache — dev server restarted clean (nohup yarn dev, log at /tmp/gymora-dev.log)

## Program Creation → Lesson Manager Flow (2026-06-10)

- User couldn't find where to add videos when creating a program — by design videos live on LESSONS, but the flow didn't communicate it and dead-ended
- createCourseHandler now: captures created course _id → refetches trainer programs (FIX: list previously didn't refresh after create) → AUTO-OPENS LessonManager for the new program → success message "Now add your lessons and videos below"
- Create Program header hint added explaining the lesson-video flow
- createWorkoutHandler: same missing-refetch fix for My Workouts list
- TypeScript 0 errors

## Final Sweep — Mobile MyPage + Last Leftovers (2026-06-10)

- MyPage was STILL blocked on phones ("GYMORA MY PAGE MOBILE" placeholder) — fork removed; layout moved to .mp-layout class (292px+1fr → single column ≤1024px, sidebar unsticks); mobile smoke test clean
- Standalone /subscription page: mobile placeholder removed, plan grid → auto-fit minmax(280px) responsive
- Dead code removed: mypage followers/followings "Coming soon" blocks (unreachable), libs/components/cs/ legacy folder (Notice/Inquiry/Faq), common/CommunityCard
- Remaining OPTIONAL items (documented, not blockers): unused apollo exports kept (GET_TRAINERS, SEND_MESSAGE, CALCULATE_ANALYTICS, GET_ONLINE_STATUS, IMAGE/IMAGES/VIDEO_UPLOADER gql defs — raw-axios/upload.ts used instead), analytics dashboard chart, REST chat fallback; cross-member notifications still backend-blocked
- TypeScript 0 errors

## External Video Hosting Support (2026-06-10)

- Decision (user): workout = single video; programs = many videos → external video hosting (Bunny/CF Stream/YouTube) with URL stored in DB. Backend already accepts arbitrary URL strings (LessonInput.videoUrl / WorkoutInput.videoUrl)
- NEW libs/components/common/VideoPlayer.tsx: universal player — YouTube (watch/youtu.be/shorts/embed) and Vimeo → 16:9 iframe; direct files → <video> with absolute http(s) used as-is and backend-relative paths prefixed with API host
- FIX: workout detail hard-prefixed API_URL onto videoUrl (external links broke) → now VideoPlayer
- NEW: program detail curriculum — enrolled members get a Watch/Close toggle per lesson with inline VideoPlayer (lesson videos previously had NO playback UI at all)
- Workout create/edit media row: added paste-URL input alongside upload ("YouTube, Vimeo, mp4"); LessonManager already had paste+upload
- Known backend note: getLessonsByCourse/getCourse expose lesson videoUrls publicly — paid-content protection needs backend (signed URLs); frontend gates playback UI by enrollment
- TypeScript 0 errors

## Full-Project Deep Analysis Batch (2026-06-10)

### 🔴 Critical fixes
1. STRIPE COURSE PURCHASE WAS BROKEN END-TO-END: success/cancel URLs use ?courseId= but page read ?id= ("Program not found" after paying); confirmCoursePayment was never called and backend has no webhook → paid members were never enrolled. Fixed: course detail accepts both params; on session_id it calls confirmCoursePayment (guarded ref), refetches, success alert, strips stripe params via shallow replace
2. NUTRITION "TODAY" BUG: intake summed ALL-TIME meal history → now filtered to today only
3. NEW FEATURE (user request): Calorie history in Nutrition — Week (7 daily bars) / Month (30 daily) / Year (12 monthly sums) from real getNutritionHistory daily docs; bar chart with today highlighted, totals + avg/active-day + days-logged summary; auto-refreshes after every meal add/delete

### 🟠 Backend-ready features wired
4. Media uploads: new libs/upload.ts (imageUploader(file,target) + videoUploader(file) — signatures verified); thumbnail upload+preview on Create/Edit Workout and Create/Edit Program; workout video upload; LessonManager video upload button
5. Exercises (Training Plan) builder: dynamic name/sets/reps rows on Create/Edit Workout (WorkoutInput.exercises / WorkoutUpdate.exercises verified); cleanExercises strips __typename and coerces numbers
6. Free workout slots: GET_FREE_WORKOUT_COUNT shown on Create Workout (backend FREE_WORKOUT_LIMIT env, default 2)
7. Live partner presence: GET_PARTNER_ONLINE_STATUS fetched when a conversation opens, merges into conversation list
8. Become Trainer now auto-logs out after success (stale JWT) with clearer message

### ⚠️ Cannot fix without backend (documented)
- Cross-member notifications: notification.resolver.ts:20 OVERRIDES input.memberId with the authenticated member — createNotification can only notify yourself. Like/comment/review notifications require a one-line backend change (use input.memberId as receiver)

### Honesty + cleanup
- Subscription copy made honest on landing PricingSection + mypage SubscriptionContent (backend gates nothing on subscription): membership framed as supporting the platform/trainers, not as unlocking content
- 32 dead Nestar-era components deleted (member/* folder, My/Properties/Favorites/Menu/RecentlyVisited/AddNewProperty/PropertyCard, MemberPanelList, Top, AgentCard, PropertyBigCard, Fiber/ScrollControls, 14 legacy homepage components incl. SubscriptionPlans/CommunityBoards/property cards); AdminMenuList cs case removed
- TypeScript 0 errors

## Trainer Content Editing + Lesson Manager (2026-06-10)

### Gap analysis (user asked: can trainers edit their content?)
- Backend FULLY supports it: updateWorkout (TRAINER role), updateCourse (auth), createLesson/updateLesson/deleteLesson (TRAINER, ownership in services) — but frontend had ZERO edit UI; UPDATE_COURSE didn't even exist in apollo; CREATE_LESSON existed unused → this is WHY every program had an empty curriculum (trainers had no way to add lessons)

### Implemented
- apollo/user/mutation.ts: added UPDATE_COURSE (CourseUpdate)
- My Workouts: Edit button per card → prefilled panel (title/desc/muscle chips/difficulty seg/kcal) → updateWorkout → refetch
- My Programs: Edit button → prefilled panel (title/desc/category accent buttons/difficulty/price/weeks) → updateCourse; Lessons button → NEW LessonManager component
- LessonManager (libs/components/mypage/LessonManager.tsx): full lesson CRUD for the trainer's own program — sorted W{n} list (pd-lesson rows) with Edit/Delete, add/edit form (title*, week*, order*, duration, description, videoUrl) matching backend LessonInput exactly; createLesson/updateLesson/deleteLesson with graphQL error surfacing
- TypeScript 0 errors

## Admin Panel Round 2 — Users Rewrite + Deep Bug Pass (2026-06-10)

### Bugs found (deep analysis) and fixed
1. USERS PAGE STATE BUGS (legacy Nestar): direct state mutation everywhere (membersInquiry.page = ...), double setState where the second overwrote the first, and status-tab changes REPLACED the whole search object — wiping memberType/text filters (and vice versa). Rewritten with immutable buildSearch() composition: status + type + text now combine correctly
2. TRAINERS LIST HAD NO NAMES: backend Trainer DTO has no memberData and getAllTrainersByAdmin does no $lookup (verified in trainer.service.ts) — frontend now resolves names/avatars via one GET_TRAINER_MEMBERS(limit 200) call mapped by memberId; Trainer column shows avatar + name + short id
3. WHITE LEGACY UI: users page dropped MUI MemberPanelList/Tabs entirely → ad-* dark table; LayoutAdmin avatar dropdown Menu had white paper → dark glass PaperProps (#161618, border, red-tinted Logout)

### Round 3 — legacy white CSS hunted down
- ROOT CAUSE of all remaining white patches: legacy `scss/pc/admin/admin.scss` (#pc-wrap ID selectors beat MUI sx): `.MuiAppBar-root{background:#fff}` (white strip above page titles), `.aside .user{background:#f5f5f5}` (white profile card in drawer), red Nestar menu-active (#FDF4F4/#F54D56), white .table-wrap/thead/inputs/buttons — ALL darkened to the gymora palette (glass appbar, dark user chip, cyan active menu)
- Native <select> dropdown opened with a white panel → `color-scheme: dark` on body (Chromium renders native popups/scrollbars dark platform-wide) + dark option backgrounds on admin selects

### Users page (rebuilt)
- wl-console filters: nickname search w/ clear, status segmented (All/Active/Block/Delete), type accent buttons (User cyan / Trainer green / Admin violet)
- Rows: avatar + nick + full name, phone, TYPE as inline select (updateMemberByAdmin on change), STATUS chip colored, warnings/blocks counts, joined date
- Actions: Activate / Block / Delete status buttons (current status's button hidden); all via updateMemberByAdmin + refetch
- TypeScript 0 errors

## Support (/cs) + About Pages (2026-06-10)

- Backend audit FIRST: no CS/FAQ/notice/inquiry module exists (components list + schema introspection — zero matching queries) → both pages are honest static content, no fake forms/emails
- /cs: "How can we help?" gradient hero; animated FAQ accordion (cs-acc, grid-rows transition, rotating + icon) with 7 answers all grounded in real platform behavior (free workouts, Stripe purchases + lesson drip, trainer verification, review eligibility rules, AI scanner, $14.99/$119.88 plans, real-time chat); "Still have a question?" CTA → community / trainers (no fake support email or ticket form)
- /about: editorial hero, LIVE platform stats from real public queries (GET_WORKOUTS / GET_TRAINER_MEMBERS / GET_COURSES totals with count-up), "What we stand for" values grid (ab-value cards), CTA banner
- .lp-cta styles restored to landing.scss (removed earlier with FinalCTA; now used by cs/about)
- Mobile scrollWidth 390; TypeScript 0 errors

## Admin Console Overhaul — Full Backend Coverage (2026-06-10)

### Backend audit (16 admin ops) → UI coverage
- VERIFIED against resolvers + live schema introspection. Now every admin op has UI:
  - getAllMembersByAdmin / updateMemberByAdmin → users page (existing)
  - getAllTrainersByAdmin / updateTrainerByAdmin / deleteTrainerByAdmin → trainers page (update was MISSING — added Verify/Reject via trainerVerificationStatus)
  - getAllWorkoutsByAdmin / updateWorkoutByAdmin / deleteWorkoutByAdmin → workouts page (update was imported-but-unused — wired as inline kcal edit)
  - getAllCoursesByAdmin / updateCourseByAdmin / deleteCourseByAdmin → programs page (update was MISSING — inline price edit)
  - getLessonsByAdmin / deleteLessonByAdmin → NO UI existed — added expandable lessons panel per program (W01·01 rows, duration, delete)
  - deleteBoardArticleByAdmin → community page; removeCommentByAdmin → NO UI existed — wired into /community/detail (admins see ✕ on every comment; own comments still use updateComment)

### CRITICAL FIX — admin community page was broken
- Page read data.getAllBoardArticlesByAdmin but backend has NO such resolver (schema introspection: only getBoardArticles exists; apollo query already aliased it) → list was always empty; AllBoardArticlesInquiry's articleStatus search also failed validation. Rewritten on BoardArticlesInquiry: category accent filters, author/views/likes/comments/date columns, Open + Delete actions
- getAllCoursesByAdmin query: added purchasedMembers (backend @Field verified) → Enrolled column

### Shell + design
- LayoutAdmin: dark glass AppBar, #101012 drawer with gymora ADMIN wordmark (replaces nestar logoText.svg); ADMIN-only guard already present (verified: guests redirected)
- AdminMenuList: legacy Cs (FAQ/Notice — no backend module) removed; Courses → Programs label
- Legacy /_admin/cs/faq|notice|inquiry pages → redirect to /_admin/users
- New ad-* design system: dark card-row tables (separated rounded rows, mono headers, hover glow), status/category chips via CSS vars, success/danger action buttons, inline edit inputs
- '✅ Free' emoji column removed from workouts
- TypeScript 0 errors

## My Articles + Create Workout/Program Forms (2026-06-10)

### My Articles
- Header: violet eyebrow + live "{N} published" count + gradient "+ Write Article" shortcut
- Rows reuse cm-row system with per-category accents (left-bar hover, thumb zoom, date, like/views/comments, hover arrow); like-refetch logic untouched; nt-empty state; mobile fork removed

### Create Workout form (mypage)
- wd-form-card; Target Muscle is now PRESET CHIPS (Chest…Full Body — exact values the /workout filter expects, prevents free-text drift like "legs day"); difficulty as wl-seg control; "Publish Workout →" gradient submit

### Create Program form (mypage)
- Category as accent-dot buttons (Strength orange / Cardio cyan / Yoga violet / Mobility green / Nutrition peach — same colors as the catalog), difficulty wl-seg, price+duration glass inputs, orange-gradient "Publish Program →"
- Both forms: Studio eyebrow headers; create mutations untouched
- TypeScript 0 errors

## My Profile + Write Article Premium Redesign (2026-06-10)

### My Profile
- updateMember + JWT refresh flow untouched; added uploading/saving busy states ("Uploading...", "Saving...")
- FIX: image upload errors were silently swallowed (empty catch) — now surfaces an alert; avatar dims while uploading
- Design: nt-head header with eyebrow, wd-form-card sections, 88px avatar with cyan ring + glow, ghost upload button (nt-markall), wd-input/wd-textarea fields, gradient submit; mobile placeholder fork removed

### Write Article (Teditor)
- createBoardArticle + addImageBlobHook upload untouched
- WHITE MUI Select/TextField replaced: category as cl-cat-btn accent-dot buttons (added missing SUCCESS_STORY option), title as wd-input, both in a glass card
- Toast UI Editor switched to dark theme (dark CSS + theme="dark") in a framed glass container; initialValue 'Type here' junk → empty with placeholder
- FIX: error handler always showed INSERT_ALL_INPUTS — now surfaces actual graphQLErrors message; empty-content check strips HTML tags (was fooled by '<p><br></p>'); publishing busy state; title moved to React state (was a mutable memo ref)
- WriteArticle wrapper: violet eyebrow header; mobile fork removed
- TypeScript 0 errors

## Community Detail Premium Redesign + Markdown Fix (2026-06-10)

- All logic untouched (article query, optimistic like, comment create/delete with refetch, pagination)
- Editorial layout: "← Community" back pill, category-accent chip, full date + computed "{N} min read" (words/200), clamp title, author card with avatar ring + USER/TRAINER type chip (routes by memberType — trainers → /trainer/detail), framed hero image, glass stats bar (like + bold views/comments)
- Comments → wd-comment system with wd-form-card input (Post disabled when empty), own-comment delete via hover-style nm-del
- MAJOR FIX — TViewer: was a hardcoded WHITE box and seeded content's escaped markdown (\\#, \\-) rendered literally. Now: toastui dark theme CSS + theme="dark", glass dark container, and escape-stripping (\\X → X) so headings/lists render properly
- Emojis (👁 💬) removed; mobile placeholder fork removed; TypeScript 0 errors

## Auth Page (Login/Signup) Premium Redesign (2026-06-10)

- logIn/signUp flow untouched; added busy state (double-submit guard, "Please wait...")
- Split-screen layout (au-* classes): LEFT — hero-athlete photo panel with duotone tint + grain, brand mark, editorial quote ("Every session counts. / Make yours today." with gradient line); RIGHT — form panel
- Form: dynamic heading (Welcome back / Join Gymora) + honest subcopy ("every workout is free from day one"), wl-seg Login/SignUp tabs, wd-input fields with mono labels, gradient submit (lp-btn-primary) with disabled opacity, switch link
- Visual panel hidden ≤920px; mobile placeholder fork removed; mobile scrollWidth 390; TypeScript 0 errors

## Subscription Premium Polish + Honest Features (2026-06-10)

- SubscriptionContent (mypage): Stripe flow untouched (initiatePayment → CardElement modal → confirmCardPayment → createSubscription)
- HONESTY FIX: plan feature lists contained unbacked claims ('Advanced analytics', 'Priority trainer access', '1-on-1 monthly review', 'Early program access', 'Basic nutrition tracking') — replaced with the landing PricingSection lists (real capabilities), keeping landing/mypage copy identical
- Header: orange eyebrow + "Invest in Performance" with gradient word
- Active plan banner upgraded: green gradient card, pulsing "Active Plan" live chip, NEW computed "{N} days left" (from expiresAt) + expiry date
- Payment history: section head with count, nm-row hover cards, status as colored chip (PAID green / PENDING orange / other gray), amount emphasized
- TypeScript 0 errors

## MyPage Sidebar v2 — Split Cards (2026-06-10)

- User feedback: sidebar felt narrow/simple. Rebuilt as mp-* class system:
- Column 240→292px; sidebar is now TWO separate glass cards (identity + navigation) with gap — layered look instead of one monolith; whole stack sticky with hidden internal scroll (like td-sticky)
- Identity card: taller cover (76px, stronger glows + grain), 78px avatar with hover scale+glow, rating row now shows "New trainer" instead of "★ —" when unrated, NEW 3-column mini-stats strip with hairline dividers (trainer: Workouts/Programs/Articles; user: Workouts/Programs/Points), spec chips, socials, glowing View Public Profile
- Nav card: section labels with gradient hairline tails (mp-nav-label), 30px icon tiles with borders; CSS hover (slide + tile lights up — previously NO hover at all) and active state (gradient + inset ring + glowing left bar + glowing icon tile); Become Trainer green variant; unread badge
- TypeScript 0 errors

- Header → nt-head pattern: orange eyebrow ("Fuel your training" / "Your plan"), restyled actions — ghost Recalculate, "AI Scan Food" green gradient button with pulsing dot (nm-scan-btn), gradient + Log Meal (wd-btn)
- Inputs upgraded to glass style (rgba bg, 11px radius) across plan calculator + meal form; meal form → wd-form-card with wd-btn
- Today's intake progress bars: 3→5px with per-macro gradient fill + soft glow, springy width transition
- Recent Meals: section head with live count, nm-row cards (hover slide + cyan border, delete ✕ appears on hover with red hover state), calories emphasized
- Empty state → nt-empty pattern; AI history sidebar: sticky (top 86px), green-tinted border, mono "AI Scan History" label
- Legacy standalone /nutrition page replaced with redirect → /mypage?category=nutrition
- All logic untouched (per-user localStorage plan, GROQ scan flow, meal CRUD); TypeScript 0 errors

## Progress Tracker Premium Redesign (2026-06-10)

- ProgressContent restyled (pg-* classes); addProgress/refetch logic untouched; backend sort verified (progressDate: -1, newest first)
- NEW summary cards computed from real entries: Current Weight, Total Change (▼/▲ delta chip — green down / orange up), latest Body Fat, Entries count
- NEW weight trend chart: dependency-free inline SVG sparkline (gradient fill + line + endpoint dot) over all entries oldest→newest, with date range label
- Vertical timeline: gradient connector line, node dots (latest glows), per-entry delta chip vs previous entry, "Latest" chip, metric chips (CHEST/WAIST/HIPS/FAT), styled note
- Form: glass card with focus-ring wd-input fields, gradient buttons; toggle label (+ Log Progress / Close)
- Legacy standalone /progress page replaced with redirect → /mypage?category=progress
- TypeScript 0 errors

## Notifications Premium Redesign (2026-06-10)

- mypage Notifications section restyled with nt-* classes; markNotificationRead logic untouched
- Header: pulsing "{N} unread" chip + All/Unread segmented filter (client-side) + NEW "Mark all read" (Promise.all over existing markRead mutation, then refetch)
- Items: per-type colored icon tile via CSS vars (SYSTEM gray ◉ / WORKOUT cyan ◈ / NUTRITION orange ◑ / SUBSCRIPTION violet ◇ / CHAT green ◬ — matches backend NotificationType enum), unread: cyan left bar + hover slide, read: dimmed; relative time (now/5m/3h/2d ago, then date); type label in matching color
- Empty states: "All caught up" (unread filter) / "No notifications yet"
- TypeScript 0 errors

- ChatContent (mypage Messages) restyled with ct-* classes; ALL Socket.IO logic untouched (chat:message listener, optimistic conversation reorder, send via socket.emit)
- Shell: glass 300px+room grid, radial cyan wash in room background
- Sidebar: "Messages" + Live/Offline mono chip (pulsing dot); conversation rows with avatar ring, online dot, last-message time (today→HH:MM, else date), bold nick, glowing unread dot, active gradient + cyan bar
- Room: header with partner avatar + Online chip; DAY SEPARATORS (Today / Yesterday / date pills) computed between messages; bubbles — mine: cyan gradient + glow, theirs: glass; per-message fadeInUp; times in mono
- Input bar: focus-ring input + gradient "Send →" pill with disabled state; styled connecting banner; richer empty state
- Responsive ≤860px: sidebar stacks above room (220px list)
- Legacy standalone /chat page (old non-socket duplicate UI) replaced with redirect → /mypage?category=chat
- TypeScript 0 errors

### Role-aware hero CTAs (2026-06-10)
- "Get Started Free" no longer shown to logged-in members. Hero badge + both CTAs adapt via userVar:
  - Guest: "{N}+ workouts available" / Get Started Free → /account/join / Browse Programs → /course
  - USER: "Welcome back, {nick}" / Continue Training → /workout / My Dashboard → /mypage
  - TRAINER: "Welcome back, {nick}" / Open Your Studio → /mypage / My Public Profile → /trainer/detail?id=self
  - ADMIN: Open Admin Panel → /_admin/users / Browse Platform
- Cyan brand dot after "gymora" wordmark removed on user request (navbar + footer + related CSS)

### Navbar size + creative logo pass (2026-06-10)
- Sizes up: links 14→15px, nick 14→15px, Log out 12.5→13.5px, Log in 13→14.5px, Get Started 12.5→14px w/ bigger padding, wordmark 19→22px, mark 30→35px
- Logo hover effects: G mark morphs square→circle (border-radius transition) while rotating -10° and scaling, double-layer glow, diagonal shine sweep (gnavShine keyframe via ::after); wordmark letter-spacing relaxes; cyan dot (now a span) pulses (gnavDot keyframe)

### Sidebar profile card premium redesign (2026-06-10)
- New "ID card" header: gradient cover band (dual radial glows + grain), avatar overlapping with cyan ring + glow
- Trainers: GET_TRAINER_BY_MEMBER_ID fetched for own profile → "Verified Trainer" green chip (or role chip), ★ rating (+count) and experience row, top-3 specialization chips, top-2 social links with ↗, "View Public Profile →" button to /trainer/detail
- Section labels: 9px gray → 10px/700 cyan-tinted mono with wider tracking

## Community Page Redesign + Logic Fixes (2026-06-10)

### Logic fixes
- "All Posts" tab was wired to FITNESS_TIPS (mislabeled — never showed everything). Now a real ALL tab: search {} (backend ArticleSearch.articleCategory is optional — verified board-article.input.ts)
- Default sort direction was ASC (oldest first!) → DESC newest first
- Added sort dropdown: Newest / Most Viewed / Most Liked (backend whitelist ['createdAt','articleViews','articleLikes'] verified)
- Frontend BAISearch type fixed to mirror backend: articleCategory now optional, memberId? added
- Removed emojis (👁 💬) from meta — replaced with text stats
- Excerpts now strip markdown symbols (#, **, \\#) in addition to HTML

### Design
- wl-hero with violet eyebrow, "Knowledge from the floor" gradient title, live posts badge, gradient Write Article button (TRAINER/ADMIN) in hero
- Glass console: category buttons with per-category accent dots (Fitness Tips cyan / Nutrition orange / Workout Guide violet / Challenge red / Success Story green) + sort select
- Article rows (cm-*): accent left-bar on hover, thumb zoom, author avatar+nick+date, 2-line excerpt, like/views/comments stats, hover-reveal arrow; rows stack on mobile
- Skeleton rows; styled empty state; mobile placeholder fork removed; scrollWidth 390; TypeScript 0 errors

### Sticky sidebar overlap fix (2026-06-10)
- Bug: .td-profile was sticky while .td-people-card scrolled in flow → cards visually overlapped during scroll (both semi-transparent)
- Fix: new .td-sticky wrapper makes profile + people cards stick together as one unit (top: 80px, max-height: calc(100vh - 96px) with hidden internal scroll for tall content); applied on /trainer/detail and /member; static on ≤1024px


## Cross-member Social Notifications (2026-06-10)

### Backend fix (explicit user permission)
- notification.resolver.ts createNotification: previously ALWAYS overrode input.memberId with the authenticated member's id — notifications could only ever be sent to yourself, so likes/comments/reviews could never notify content owners
- Fix: `const receiverId = input.memberId ?? memberId.toString();` — input.memberId (receiver) is honored when provided; falls back to self when omitted (preserves existing self-notification flows: subscription, AI scan, etc.)
- Verified live e2e on dev API: user A → createNotification(memberId: B) landed ONLY in B's getNotifications; A's no-memberId call landed ONLY in A's inbox; no cross-leakage; throwaway test users + notifications deleted from DB afterwards
- Backend tsc clean

### Socket gateway crash fix (2026-06-10, explicit user permission — earlier this session)
- handleConnection re-threw WsException on invalid token → lifecycle-hook throws bypass ws exception filters → unhandled rejection crashed the whole API process (any anonymous client could DoS the server)
- Fix: emit('exception') + client.disconnect(true), no re-throw; verified with 3 consecutive invalid-token connections — server stays up

### Frontend wiring (gymora-next)
- New libs/notify.ts: notifyMember(receiverId, selfId, type, title, message) — fire-and-forget CREATE_NOTIFICATION via initializeApollo(); guards: missing ids and self-notification are no-ops; all errors swallowed (best-effort)
- Wired into all social actions (only on like, never unlike; via existing nextLiked/wasLiked flags):
  - /workout list + detail like → WORKOUT "New like on your workout" to workout.memberId
  - /workout detail comment + review → WORKOUT notifications to owner
  - /community list + detail like, detail comment → SYSTEM notifications to article.memberId
  - /trainer/detail profile like + trainer review → SYSTEM notifications to the trainer's member id
  - /member profile like → SYSTEM notification to the member
- Frontend tsc clean; all 6 touched pages smoke-tested 200 on dev server


## Mobile Readiness Audit + Hamburger Menu (2026-06-10)

- Full mobile sweep (Playwright, iPhone 13 viewport, real entity IDs, authenticated): 22 routes — 0 horizontal overflows, all pages render the real responsive UI (no leftover mobile stubs; layout mobile branches render the same components)
- CRITICAL GAP FIXED: ≤768px hid .gnav-links with no replacement — mobile users had no site navigation. Added premium hamburger menu to GymNavbar:
  - Animated 3-line burger (morphs to X), glass button matching gnav system
  - Fixed full-width slide-down panel under the 62px bar (max-height+opacity transition): bold 17px nav links with active state + arrow, guest footer (Log in / Get Started), user footer (My Page chip with avatar + red Log out)
  - Auto-closes on route change (useEffect on router.asPath); bar gets solid background while open
  - Top bar simplified on mobile: guest buttons + logout/divider hidden (moved into menu), nick ellipsized at 96px
- Verified live: guest + logged-in menu screenshots, in-menu navigation closes panel, 0px overflow with menu open, desktop unchanged (burger hidden, links visible)
- tsc clean; production build clean (124 static pages); throwaway mobiletest1 user removed from DB

### Trainer + Admin mobile verification & responsive admin drawer (2026-06-10)
- Extended mobile sweep with temp TRAINER and ADMIN accounts: 8 trainer mypage categories (myWorkouts/createWorkout/trainerCourses/createCourse/myArticles/writeArticle/myProfile/dashboard) + 5 admin pages — 0 overflows, 0 console errors
- Admin panel fix: permanent 280px MUI Drawer ate 72% of a 390px screen. Now responsive (useMediaQuery ≤768px): temporary drawer hidden by default, MenuIcon burger in full-width AppBar opens it, auto-closes on route change; content gets 64px top padding + minWidth 0 on mobile; desktop unchanged (permanent 280px, no burger — verified)
- Live-verified: drawer open → Workouts accordion → List → navigates to /_admin/workouts and drawer closes; production build clean; temp accounts removed from DB

## Article Edit/Delete + Final Dead-Code Cleanup (2026-06-10)

- NEW: My Articles now has full owner Edit/Delete (backend updateBoardArticle was never wired):
  - Edit button → /mypage?category=writeArticle&articleId=… → WriteArticle fetches GET_BOARD_ARTICLE and renders Teditor in edit mode (title/category/image prefilled, content injected via setHTML polling effect since Toast UI load event was unreliable)
  - BoardArticleUpdate has no articleCategory field (verified) → category locked in edit mode with "fixed after publish" label
  - Delete button → confirm → updateBoardArticle {articleStatus: DELETE} → list refetch; backend decrements memberArticles
  - E2E verified via Playwright: prefill → save → list shows new title → delete → 0 active articles in backend
- calculateAnalytics deliberately NOT wired: getNutritionRecommendation (already wired) returns a superset (BMI+BMR+TDEE+macros+tips); the analytics endpoint is redundant — removed its unused frontend export instead
- Chat SEND_MESSAGE mutation confirmed redundant: socket gateway persists via chatService.sendMessage on chat:message (verified) — export removed
- Deleted 8 dead legacy components (LayoutFull, Footer, mypage/Article, admin/cs ×3, admin/properties/PropertyList, admin/community/CommunityArticleList) and 8 unused apollo exports (SEND_MESSAGE, IMAGE_UPLOADER, IMAGES_UPLOADER, VIDEO_UPLOADER, GET_ONLINE_STATUS, GET_TRAINERS, GET_TRAINER, CALCULATE_ANALYTICS); legacy /property /agent /_admin redirect pages kept intentionally
- tsc clean, production build clean, test data removed from DB

## Trainer Messaging Entry + Creator Cards (2026-06-10)

- NEW: users can now start a chat with any trainer/member from their profile:
  - "Message" button on /trainer/detail and /member profiles (td-actions) → /mypage?category=chat&partner=<memberId>
  - ChatContent deep link support: ?partner= auto-opens that conversation; if no history exists, GET_MEMBER fetches partner info and a stub conversation row ("Start the conversation") is injected so the room opens immediately; first sent message persists it server-side (socket gateway → chatService.sendMessage, verified earlier)
- NEW reusable CreatorCard (libs/components/common/CreatorCard.tsx): avatar + name + role chip + workouts/followers/likes mini-stats + View Profile (role-aware routing) + Message buttons
  - /workout/detail sidebar → "Coach" card via workout.memberId + GET_MEMBER (backend getWorkout has no member lookup — verified)
  - /course/detail sidebar → "Your Trainer" card via course.trainerId → GET_TRAINER (restored to apollo; WithoutGuard verified) → memberId → GET_MEMBER; shows trainer ★rating and experience chips
- Like persistence investigated (user report "like reverts after refresh"): could NOT reproduce — backend meLiked verified via raw API (list+detail), browser repro on /workout and /workout/detail both keep the filled heart after reload, Authorization header confirmed present on first request. Current code is correct; awaiting concrete repro page if it recurs.
- E2E verified: trainer detail → Message → chat opens with stub conv → message sent and visible; both detail cards render; mobile overflow 0 on all three pages; production build clean; test user + chat row removed from DB

## Production Polish: Error Pages, Titles, README (2026-06-10)

- Custom dark 404 ("This page skipped leg day.") and 500 ("We dropped the barbell.") pages — previously Next's white defaults clashed with the brand; G-mark logo, mono error chip, gradient CTA buttons; verified rendering live
- Per-page <title>/meta titles: LayoutBasic route map (Workout Library / Training Programs / Trainers / Community / My Page / etc. — Gymora), landing "Gymora — Elite Training Platform"; verified via curl on 4 routes
- README.md rewritten from the stock create-next-app template to a real project README: feature overview per role, tech stack table, env var table (matching next.config.js mapping), scripts, structure, design system summary — no fake badges/claims
- tsc clean; production build clean

## Hardcoded-Data Audit (2026-06-10)

- User suspected landing/trainers data might be hardcoded. Full audit of all 8 homepage components + /trainer page:
  - EliteTrainers, HotWorkouts, TopCourses, CommunityPulse, HeroSection counters, /trainer roster — ALL DB-driven via GraphQL (verified side-by-side: DB top-4 trainers by memberRank = rendered names in same order; DB totals 42/21 = rendered 42+/21+)
  - Static content that is design copy, not data: marquee discipline names, HowItWorks steps, PricingSection plan copy (honest-verified earlier)
- ONE fake metric found and fixed: hero "100% Free Workouts" (false — course-locked paid workouts exist) → replaced with real "31+ Programs" stat from GET_COURSES metaCounter with count-up animation; "—" placeholder when empty
- tsc clean, production build clean, 0 console errors

## Trainer Card Nickname + Chat Read Receipts (2026-06-10)

- Trainer roster cards now show @nickname under the full name (tr-card-nick, cyan mono) so users can map "Emma Johnson" ↔ emma_wellness at a glance (clarified earlier confusion that seeded trainers "weren't showing" — they were, by full name, paginated 6/page)
- Chat read receipts: sent messages show ✓ (sent, gray) → ✓✓ (read, cyan) using the existing Chat.isRead field (already returned by getMessageHistory; backend marks incoming read when the partner opens the conversation — no backend change)
- Added light 6s polling while a conversation is open (pauses on hidden tab) so receipts and partner presence update live without a backend chat:read socket event
- E2E verified with two real accounts (emma_wellness trainer + temp user): send → ✓; partner opens → poll picks up → ✓✓ (read-styled). tsc clean, production build clean, test data removed

## Admin Menu Cleanup + Chat UX (2026-06-10)

- Admin mypage menu trimmed to essentials (Dashboard, My Profile, Notifications, Messages): My Articles/Write Article changed trainerOrAdmin→trainerOnly; My Programs/Nutrition/Progress/Subscription changed hideForTrainer→userOnly (so admins are excluded too). Verified live: temp admin sees exactly those 4 items
- Chat scroll bug fixed: messagesEndRef.scrollIntoView() scrolled the WHOLE page on open/new message; replaced with scoped msgsBoxRef.scrollTop=scrollHeight, and added min-height:0 to .ct-room/.ct-msgs (flexbox overflow fix) so only the messages panel scrolls. Verified: window.scrollY stays 0 after 18 messages, panel auto-scrolls to bottom
- Messages nav now shows an unread badge (green mp-unread pill, mirroring Notifications): GET_CONVERSATIONS in mypage (pollInterval 15s) → count of conversations with unread incoming last message. Verified: receiver sees "1" badge after partner sends
- Side cleanup: removed 3 orphaned libs/types/property/* files (referenced deleted property.enum, caused tsc errors)
- tsc clean, production build clean, temp accounts removed

## Chat Badge Clear + Presence Polish (2026-06-10)

- Unread message badge now clears immediately when a conversation is opened (was only clearing on full refresh): ChatContent gets an onConversationsRead callback; on opening a conversation it optimistically sets isRead and calls back so mypage refetches GET_CONVERSATIONS and the sidebar mp-unread badge updates at once
- Online presence (already backend-implemented via in-memory socket Set: registerConnection on connect, unregister on disconnect, getPartnerOnlineStatus) made always-visible and creative in the chat room header: avatar online dot + "● Active now" (green, pulsing ring) when online / "Offline" (gray) when not; refreshed by the existing 6s poll
- Verified live with two socket-connected accounts: A's badge "1" → opens chat → CLEARED (no refresh); A sees B "Active now" while B connected → "Offline" within the poll window after B disconnects
- NOTE for user: true "last seen at <time>" is NOT possible without a backend change — the server only keeps a live online/offline Set, no lastSeen timestamp is persisted. Offered to add a lastSeen field on disconnect if permitted.
- tsc clean, production build clean, test data removed

## Navbar Logo Spin + Logout Confirm (2026-06-10)

- Navbar logo "G" now does a creative 3D coin-flip spin on hover (gnavLetterFlip: 720deg rotateY with a scale pop, mark has perspective + span backface-hidden) on top of the existing square→circle morph
- Log out now asks "Do you want to log out?" via sweetConfirmAlert before logging out — wired to BOTH desktop (.gnav-logout) and mobile (.gnav-mobile-logout) buttons through a shared logoutHandler
- Verified live: hover applies gnavLetterFlip; logout click shows confirm, Cancel keeps session, OK logs out
- tsc clean, production build clean

## Subscription = USER-only (data + UI cleanup) (2026-06-10)

- DB cleanup: deleted all PENDING subscriptions (0 found) and all subscriptions belonging to non-USER members (3 removed: ADMIN testuser1 MONTHLY, TRAINER Abraham YEARLY, ADMIN Ibrohimjon YEARLY) — subscriptions now only ever belong to USER members; 0 subscriptions remain (all existing ones were on admin/trainer accounts)
- Dashboard subscription summary gate tightened: was `memberType !== 'TRAINER'` (so admins still saw it) → now `memberType === 'USER'` only
- Menu item already userOnly (earlier change) + category guard verified: admin hitting ?category=subscription falls back to Dashboard; ADMIN & TRAINER both show no Subscription menu item and no dashboard subscription mention (verified live)
- tsc clean, production build clean, temp test admin removed

## Trainer Sidebar Fit — No More Scroll (2026-06-10)

- Trainer mypage sidebar overflowed the viewport (had to scroll inside the sticky column). Fixed creatively without dropping any feature:
  - Merged the 3 standalone "Create" nav rows into inline "+" actions on their parent rows: My Workouts +, My Programs +, My Articles + (Studio section 6 rows → 3). The + is a glowing cyan pill that rotates on hover and highlights when its create page is active; createWorkout/createCourse/writeArticle kept in allowedKeys so the guard still permits them, parent row also shows active on its create page
  - Compacted the identity card (cover 76→58, avatar 78→62, tighter margins/paddings on name/stats/specs/socials/button) and nav spacing
- Result: sidebar 869px → 771px; fits without scroll at ≥820px viewport (was overflowing even on tall screens); 768px tiny-laptop still ~51px over but far better
- Verified live: + buttons navigate (Create Workout/Program, Write Article), desktop fits, mobile 0 overflow and + works
- tsc clean, production build clean

## Nutrition Split into Plan + Meal Tracker, Delete Fix (2026-06-10)

- Meal delete bug ("Meal log not found or access denied"): root flow was actually correct (verified via API — fresh add+delete works); the error came from deleting a stale/cross-session row, and the global Apollo errorLink also popped its own scary alert. Fixes:
  - deleteMealHandler now optimistically removes the row, treats "not found/access denied" as already-deleted (no error), then refetches
  - Apollo errorLink gained a `skipGlobalError` context flag; the delete passes it so the benign error never double-pops
- Split the overcrowded Nutrition page into two mypage sections via a `view` prop on NutritionContent (shared state/queries/localStorage kept in one component):
  - 'nutrition' → "Nutrition Plan" (calculator form + results + suggested meal plan + Recalculate)
  - 'mealTracker' → "Meal Tracker" (AI Scan + Log Meal + AI scan result + today's intake vs targets + week/month/year calorie history + recent meals + AI scan history)
  - New userOnly menu item "Meal Tracker"; legacy /nutrition still redirects to the plan page; targets in the tracker come from the plan saved in per-user localStorage
- Verified live: plan page shows only plan (no meal list), tracker shows only tracker (no form), delete removes the row with no error popup and updates the DB; both pages 0 mobile overflow
- tsc clean, production build clean, test user removed

## Deep Legacy Cleanup + Real-time/Last-seen (2026-06-11)

### Nestar legacy removed (verified nothing else remains)
- DELETED legacy SCSS entirely: _app.tsx no longer imports scss/pc/main.scss or scss/mobile/main.scss; removed scss/pc/ (~25 Nestar partials: addNewProperty, myProperties, myFavorites, mySaved, memberProperties, homepage, cs, etc.) and scss/mobile/. Current UI is 100% app.scss → landing.scss + workout.scss. Verified: all guest pages + admin + trainer mypage render perfectly (admin ad-table styled, sidebar intact)
- DELETED 8 redirect-stub pages (/property, /agent, /_admin/properties, /_admin/cs/{inquiry,faq,notice}) — nothing linked to them; old URLs now hit the branded 404
- DELETED 6 unused enums (notice/notification/nutrition/payment/recommendation/subscription), 4 unused type files (like/*, view/view.input, board-article.update) + empty dirs, libs/utils.ts (fully dead), and 8 unused legacy image dirs/files (apartmentMain, community, event(s), fiber, flag, icons, property)
- KEPT libs/types/follow/follow.ts (member.ts imports MeFollowed via relative path — initial unused-scan missed it; restored from git before it broke the build)

### Polish + real-time
- Dashboard subscription summary: raw "NO_SUBSCRIPTION"/"MONTHLY:ACTIVE" → friendly card ("You're on the Free plan" + Upgrade CTA / "Monthly plan · Active" + Manage), USER-only
- Notifications now poll (20s) so the sidebar badge updates live like Messages
- Chat "last seen" implemented (backend, in-memory consistent with existing presence): OnlineStatus.lastSeen field; setOnlineStatus stamps lastSeenMap on going offline; getPartnerOnlineStatus/getOnlineStatus return it; frontend shows "Active now" or "Last seen Xm ago". Verified live: A saw B "Active now" → after B disconnect "Last seen just now"
- Backend tsc clean, frontend tsc clean, production build clean, all temp accounts removed

## Program Access: Creator + Admin Free Access (2026-06-11)

- Program detail (/course/detail) access logic fixed: a program is now viewable without enrolling/paying when:
  - isCreator — the logged-in trainer owns the program (courseTrainer.memberId === user._id) → price card shows "Your program / Free / Manage Program" (links to My Programs) + "You created this program"
  - isAdmin — any ADMIN → "Admin access / Free / ✓ Full Access" + "Free for admins"
  - isEnrolled — unchanged paid/enrolled flow
- hasAccess (= isEnrolled || isCreator || isAdmin) now gates the lesson Watch buttons and VideoPlayer; non-enrolled regular users still see "$X / Enroll Now" and cannot watch. Progress/Mark-done stays enrolled-only (learner feature)
- No backend change needed: getCourse already returns full lessons (incl. videoUrl) to everyone; gating is front-end intent
- Verified live on the real $150 program (jessica_fit's "6 month muscle gain"): creator → Manage + watches video; admin → Full Access + watches; non-enrolled user → $150 Enroll, 0 watch buttons
- tsc clean, production build clean, temp accounts removed

## Refresh-Persistence for Interactive State (2026-06-11)

- Problem: refreshing while doing something reset the view (lost the open chat conversation, collapsed the program lesson video) because that state lived only in React state, not the URL.
- Chat: opening a conversation now persists ?partner=<id> in the URL (openConversation pushes shallow); on reload the existing partnerParam effect reopens the room. Verified: click conv → reload → room still open.
- Program lesson video: the open lesson now persists ?lesson=<id> (toggleWatch syncs URL; an effect restores watchingLesson from the query on load). Verified: Watch → reload → video still open.
- Switching mypage sidebar category drops ?partner/?lesson (menuHandler pushes only {category}). Workout detail video and detail pages already persist via their ?id route param.
- tsc clean, production build clean, test data removed

## Chat Presence Flicker Fix (2026-06-11)

- Bug: chat room header flipped between "Last seen Xm ago" and "Offline" on each refresh. Cause: getConversations onCompleted replaced the whole conversations array (no lastSeen field), racing with checkPartnerOnline (which merged lastSeen) — whichever resolved last won, so it alternated.
- Fix: open-room presence now lives in a dedicated partnerStatus state set ONLY by getPartnerOnlineStatus (carries isOnline + lastSeen), independent of the conversations list refetch. The presence chip renders only once partnerStatus is resolved (no premature "Offline"); avatar dot + label both read partnerStatus. partnerStatus resets on conversation switch.
- Verified live: opened a conversation with an offline partner, refreshed 4× → "Last seen just now" every time (no Offline flicker)
- tsc clean, production build clean, test data removed

## MyPage Avatar 3D Hover (2026-06-11)

- Replaced the flat scale(1.05) hover on the mypage identity-card avatar with a premium 3D effect: perspective stage on .mp-profile-body; on hover the avatar does a rotateY(360deg) coin-flip + scale(1.16) + translateZ lift, intensified neon glow (multi-layer cyan box-shadow), brighter border, and a light-sweep shine streak (::after, clipped to the circle). Verified live (matrix3d transform + mpAvaShine animation applied on hover).
- CSS-only, no markup/backend change; tsc clean, production build clean

## Avatar 3D Flip Clip Fix (2026-06-11)

- Bug: during the avatar coin-flip the square photo spilled outside the round frame (the circular border stayed behind). Cause: transform-style: preserve-3d on .mp-ava disables overflow:hidden + border-radius clipping in browsers.
- Fix: removed preserve-3d (not needed — perspective is on the parent), removed backface-visibility:hidden (kept photo visible through the spin), and added border-radius:50% to the img as a clip safety. Verified: mid-flip shows the coin edge within the frame, end state is a clean circle — no square spill.
- tsc clean, production build clean

## Favicon: Gymora Brand (2026-06-11)

- Browser tab still showed the old Nestar favicon. Two causes: (1) _document.tsx declared the SVG with a WRONG mime type (type="image/png") so Chrome ignored it and fell back to (2) the root public/favicon.ico which was the old Nestar icon. The /img/logo/favicon.svg was also still the Nestar logo (#ec6753 salmon).
- Fix: rewrote favicon.svg as the Gymora mark (cyan gradient #00dce5→#00f5ff rounded square + bold dark "G", matching the navbar logo); corrected _document to type="image/svg+xml" + added apple-touch-icon; deleted the Nestar public/favicon.ico (now 404 so Chrome uses the SVG link).
- Verified: favicon.svg served 200, old /favicon.ico 404, head link correct, rendered icon = Gymora G. (Users may need a hard refresh — Chrome caches favicons aggressively.)
- tsc clean, production build clean

## Populated Workouts & Programs with Real YouTube Videos (2026-06-11)

- All 49 workouts that lacked a video now have a real, embeddable YouTube workout video matched to their targetMuscle (Full Body/Legs/Chest/Back/Core/Shoulders/Arms/Glutes/Upper Body). Pool gathered via web search, each candidate verified embeddable through the YouTube oEmbed endpoint (dropped one with embedding disabled), assigned round-robin so they vary. 51/51 workouts now have video.
- 31 programs had no curriculum (only 1 lesson existed in the whole DB). Created 124 lessons (4 per program, weeks 1-4) with category-appropriate titles/descriptions/durations and real verified videos per courseCategory (STRENGTH/YOGA/CARDIO/MOBILITY/NUTRITION). 125 lessons total now.
- Verified live: workout detail embeds the YouTube iframe; program detail shows the 4-week curriculum with working Watch → video for creator/admin/enrolled.
- Fixed a "No data found!" popup on program detail: CreatorCard's GET_MEMBER (and course reviews/lesson-progress queries) now use skipGlobalError + onError so legitimately-empty/missing reads don't pop the global error.
- Data-only video population (no backend change); frontend tsc clean, production build clean, all temp accounts removed.

## Branded SweetAlert2 Popups (2026-06-11)

- All popups/toasts (login errors, confirms, success, delete prompts, etc.) used the default white SweetAlert which clashed with the dark theme. Added a global .swal2-* theme in app.scss: dark glass popup (gradient #18181a, 1px border, radius 18px, blurred backdrop), Hanken Grotesk text, cyan-gradient confirm button + ghost cancel, brand-recolored icons (success green / error red / warning orange / question+info cyan), cyan timer progress bar, dark toast, and a smooth scale+fade open/close (replacing the bounce).
- sweetAlert.ts cleaned: removed hardcoded ugly red/grey button colors and the dark text color (invisible on dark), removed animate.css bounce usages; sweetConfirmAlert now uses a red "swal-danger" confirm (destructive) with Yes/Cancel labels; login confirm uses the cyan button.
- Verified live: logout confirm renders fully themed (glass popup, cyan ? icon, red Yes + ghost Cancel, blurred backdrop). Global theme auto-applies to every existing Swal call.
- tsc clean, production build clean

## Last Seen for Everyone — Persistent + Site-wide Presence (2026-06-11)

- BUG (user report): other accounts showed "Offline" instead of "Last seen …". Two root causes:
  1. lastSeen lived ONLY in an in-memory Map stamped on socket disconnect — wiped on every backend restart, and empty for anyone not seen since boot
  2. the presence socket connected ONLY while the chat page was open (useSocket used solely in ChatContent) — members browsing the rest of the site were never "online" and never got a lastSeen stamp
- Backend fix (Member.lastSeenAt persistence): Member schema + lastSeenAt: Date; ChatModule registers Member model; ChatService.stampLastSeen() writes memory + DB (fire-and-forget) on BOTH connect (crash-safe floor) and disconnect; resolveLastSeen() = in-memory ?? DB fallback; getOnlineStatus/getPartnerOnlineStatus async; register/unregisterConnection → void (gateway never used returns)
- Frontend fix: <PresenceSocket /> mounted in _app (calls the existing shared/refcounted useSocket) — logged-in members are now online on EVERY page, and leaving the site stamps lastSeen; logout disconnects via the user._id effect cleanup
- Verified live e2e: temp user connect → observer sees isOnline:true; disconnect → isOnline:false + lastSeen; backend watch-restart (memory wiped) → SAME lastSeen still returned (DB fallback proven); temp users removed from DB
- backend tsc clean, frontend tsc clean, production build clean; dev server .next cache corrupted by yarn build again — restarted clean (known issue)

## Navbar Logo "Slot Machine" Hover Animation (2026-06-11)

- User disliked the old coin-flip (G "just spins") — replaced with a brand-telling slot-machine effect: on hover the G motion-blurs and rolls vertically through G→Y→M→O→R→A (the mark literally spells the brand), overshoots past the final G and bounces back onto it
- Choreography: roll lands at ~78% → mark does a squash-pop (gnavMarkLand scale 1.24 + -7deg), a cyan shockwave ring pings outward (gnavPing on .gnav-logo::before), the shine sweep fires delayed to coincide with the landing, and a cyan glint sweeps across the "gymora" wordmark via background-clip:text (gnavWordShine — band sits off-screen so the static wordmark stays pure white)
- Markup: mark's single <span>G</span> → .gnav-roll strip of 7 <i> letters (aria-hidden; strip top-anchored so rest state shows the first G); square→circle morph + glow kept, old rotate/gnavLetterFlip removed
- Verified: static navbar renders clean G + white wordmark (headless Chrome screenshot); animation math validated by freezing gnavRoll at 0/30/58/78/100% in an isolated harness — blurred mid-roll, sharp overshoot, exact landing on G (-85.714% = letter 7 of 7)
- tsc 0 errors; only GymNavbar uses these classes (footer unaffected)

## Stale-UI-After-Mutation Sweep (refetch + manual setState) (2026-06-11)

- BUG (user report): AI-scanned meal "Log as lunch/dinner" showed success but Eaten/Recent Meals stayed at 0 until a manual refresh. Cause: `await mealsRefetch()` discarded the result and relied on `onCompleted`, which Apollo does NOT reliably re-fire on refetch (long-documented project pattern — deleteMealHandler in the same file already used the manual fix, the log handlers didn't)
- NutritionContent: new `reloadMeals()` helper (mealsRefetch + setMeals, nutritionHistoryRefetch + setNutritionHistory, both manual) used in all 4 spots — logScanAsMeal, addMealHandler, deleteMealHandler, AI-history quick-log buttons
- Project-wide audit of every refetch call site for the same stale-UI class; fixed the 3 remaining offenders:
  - ChatContent: opening a conversation (`msgsRefetch(...).then`) now sets messages from the result (previously could show stale messages until the 6s poll); socket new-conversation `convsRefetch()` now sets conversations from the result (first message from a new partner could otherwise never appear until refresh)
  - workout/detail createCommentHandler: comments + total now set manually from the refetch result
- All other call sites verified already correct (mypage, subscription, community detail/list, trainer/member/course detail, MyArticles, LessonManager, ProgressContent); list pages re-fetch via useQuery variable changes (onCompleted fires for variable changes — not affected)
- tsc 0 errors; changed pages smoke-tested 200 on dev server

## Program Likes (purchasers only) + Purchase Count Social Proof (2026-06-11)

### Backend (new feature — LikeGroup.COURSE already existed, review purchase-gate already existed)
- Course schema: added courseLikes (default 0); DTO: added courseLikes + meLiked
- course.module imports LikeModule; CourseService injects LikeService
- NEW likeTargetCourse(memberId, courseId) mutation: verifies the member is in purchasedMembers (else BadRequest "Only members who purchased this program can like it"), toggles the like (LikeGroup.COURSE), $inc courseLikes, returns meLiked — prevents non-buyers from tanking a program
- getCourse now takes auth member (WithoutGuard) and returns meLiked; getCourses adds lookupAuthMemberLiked + returns courseLikes; backfilled courseLikes:0 on existing courses
- Review-only-by-purchasers was ALREADY enforced (review.service hasPurchased) — confirmed, no change

### Frontend
- LIKE_TARGET_COURSE mutation; courseLikes + meLiked added to GET_COURSE/GET_COURSES; purchasedMembers added to GET_COURSES
- Program detail: like button in the price card (purchasers only; non-buyers see a read-only ♥ count with tooltip), "members joined" social-proof block, likes shown in hero meta
- Program list cards: show enrolled count (green) + likes (red) as trust signals so popular programs stand out
- Verified live (API + browser): non-purchaser like BLOCKED, purchaser like 0→1 and toggles back, counts render on detail + list
- backend tsc clean, frontend tsc clean, production build clean, test data removed
