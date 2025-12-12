# PlooiKaart — Requirements (Implementation Spec)

## 1) Goal

Build a small web application that represents a point-based scoring system. One point is called a **plooikaart**.

## 2) Primary Concepts

- **User**: a person who has a score.
- **Meeting**: a weekly Thursday meeting for which attendance is registered.
- **Penalty**: if a user is absent without a valid reason for a meeting, they lose 1 plooikaart.
- **Audit trail**: an append-only record of what changed and why, visible to all users.

## 3) Users (seed data)

The system must start with a predefined list of users (seeded/hardcoded on first run):

- Ewoud
- Tom
- Dave
- Birger
- Bert

Each user must have (at minimum):

- `displayName`
- `username` (unique)
- `email` (unique)
- `isPilot` (boolean; default `false`)

Notes:

- Seed values for `username` and `email` must be deterministic and committed (so Copilot can implement end-to-end auth and password reset).
- Seed rule:
  - `username` equals the name (lowercase) (e.g. `Ewoud` → `ewoud`).
  - `email` defaults to `username@mail.com`.
  - Exception: Ewoud’s email is `ewoud.smets@gmail.com`.
- Initial pilot users:
  - Birger: `isPilot = true`
- Only seeded users can sign in (no public registration).

## 4) Scoring Rules

### 4.1 Scoring period

- Scoring is calculated for the **current calendar year**.
- The scoring year starts on **January 1st** and resets each January 1st.

### 4.2 Starting points

- Each user starts on January 1st with **5 plooikaarten**.

### 4.3 Pilot bonus

- A user may have `isPilot = true`.
- Pilot users receive **+5 plooikaarten** at the start of the scoring year.

### 4.4 Meeting penalty

- Meetings occur on **Thursdays**.
- For each recorded meeting, every user who is:
  - not marked **present**, AND
  - not marked **excused** (valid reason) loses **1 plooikaart**.

### 4.5 Buying / adding plooikaarten

- Scores are allowed to become negative.
- If a user’s score goes below `0`, they must buy new plooikaarten at the next meeting.
- Meeting submission must support registering a **top-up** for one or more users (e.g. “this user gets 5 plooikaarten”).
- Top-ups are allowed even if a user is not below `0`.
- Each top-up may include an optional free-text **comment** which must be stored and shown in the audit trail.

### 4.6 Score computation

Scores must be computed from persisted data (meetings + user flags + top-ups) so that the score can be recalculated deterministically.

For a given user $u$ in the current year:

$$
score(u) = 5 + (u.isPilot ? 5 : 0) + sum(topUps(u)) - count(unexcusedAbsences(u))
$$

## 5) Screens / User Flows

### 5.1 Sign in

- A user can sign in using `username` + `password`.
- If a seeded user has no password set yet, the implementation may set an initial password at seed time (acceptable) or require password reset to set one (acceptable). Either way, the flow must be implementable and documented in `.env.example` and/or README.

### 5.2 Dashboard (first page after sign-in)

Must show:

- The signed-in user’s current score in points, labeled as **plooikaarten**.
- A short explanation: “1 point = 1 plooikaart”.
- A list/leaderboard of all users and their scores.

### 5.3 Register meeting form

A signed-in user can register attendance for a meeting.

Form fields:

- **Date of the meeting** (date-only)
- **Who was present** (multi-select from all users)
- **Who had a valid reason not being present** (multi-select from all users)
- **Bought / added plooikaarten** (optional; one or more entries)
  - Per entry: user + amount (integer, e.g. `5`) + optional comment

Form rules:

- The meeting date must be a **Thursday**.
- “Present” and “Excused” lists must be **disjoint** (a user cannot be both).
- A user not in either list is considered **absent without valid reason**.
- Submitting the form persists the meeting and triggers score recalculation (derived from stored meetings).
- Only **one meeting per date** is allowed; submitting a duplicate date must show a clear validation error.
- If top-ups are provided, each top-up amount must be a positive integer and a multiple of `5`.

### 5.4 Audit trail

- All users can view the audit trail.
- The audit trail must be presented “user friendly”: chronological list, readable text, with relevant details (who, when, what changed, meeting date).
- The audit trail is ordered **newest-first**.

Minimum details per audit entry:

- Timestamp
- Actor (user who submitted)
- Action type
- Meeting date (if applicable)
- Affected users (if applicable)
- Per-user score delta for that action (e.g., `-1` for penalties)
- Comment text (when provided for top-ups)

### 5.5 Password reset

Two-step flow:

1. **Request reset**
   - User provides their username or email.
   - System delivers a reset link (see “Email delivery mode” below).
2. **Reset password**
   - User opens the link (contains a single-use token).
   - User sets a new password.

Email delivery mode (for now):

- **Dev-mode**: do not send real emails; instead **log the full reset link to the server console**.
- The reset link must be built using the configured public base URL.

Security requirements:

- Reset tokens must be **random**, **single-use**, and **expire**.
- Passwords must be stored hashed (never plaintext).
- The reset endpoint must not reveal whether a username/email exists (return a generic confirmation message).

## 6) Data Persistence (Azure Document DB, MongoDB compatible)

All persistent data must be stored in a document database on Azure that is compatible with **MongoDB 8.0**.

Implementation note:

- Azure Cosmos DB for MongoDB (vCore or RU-based Mongo API) is acceptable as long as it is compatible with MongoDB 8.0.

### 6.1 Collections (logical)

The solution must persist at least:

- `users`
- `meetings`
- `auditEvents`
- `passwordResetTokens`

### 6.2 Minimal schemas (shape)

`users`:

- `_id`
- `displayName`
- `username`
- `email`
- `isPilot`
- `passwordHash`
- `createdAt`, `updatedAt`

`meetings`:

- `_id`
- `date` (date-only; unique per year)
- `presentUserIds` (array)
- `excusedUserIds` (array)
- `topUps` (array)
  - each: `userId`, `amount`, `comment` (optional)
- `createdByUserId`
- `createdAt`

`auditEvents` (append-only):

- `_id`
- `timestamp`
- `actorUserId`
- `type` (e.g. `MEETING_SUBMITTED`, `PASSWORD_RESET_REQUESTED`, `PASSWORD_RESET_COMPLETED`)
- `data` (JSON payload; includes meeting date and per-user deltas when relevant)

`passwordResetTokens`:

- `_id`
- `userId`
- `tokenHash` (hash the token before storing)
- `expiresAt`
- `usedAt` (nullable)
- `createdAt`

## 7) Configuration (.env)

All secrets/settings must be provided via environment variables.

Required (names may be chosen but must be documented in `.env.example`):

- MongoDB connection: connection string, database name
- Auth/session signing secret
- Public app base URL used in reset links

Email (dev-mode):

- No SMTP/SendGrid/Graph settings are required in dev-mode; only the public base URL is required to generate the reset link.

Do not commit real credentials.

## 8) API Contract (backend)

Because the app requires database access and email delivery, it must have a backend API.

Minimum endpoints (names can vary, but behaviors must match):

- `POST /auth/login`
- `POST /auth/logout`
- `GET /me` (current user)
- `GET /scores` (scores for all users or at least current user)
- `POST /meetings` (submit meeting attendance)
- `GET /audit` (audit trail)
- `POST /password-reset/request`
- `POST /password-reset/confirm`

All endpoints (except password reset request/confirm and login) require authentication.

## 9) Acceptance Criteria

### 9.1 Scoring

- A user with `isPilot = false` and no meetings has score `5`.
- A user with `isPilot = true` and no meetings has score `10`.
- For a submitted Thursday meeting, every user absent-unexcused loses exactly 1 point.
- If a user is listed as excused, they do not lose a point for that meeting.
- Scores are allowed to be negative.
- Submitting a meeting with a top-up of `+5` for a user increases that user’s score by `5`.

### 9.2 Meeting submission

- Submitting a meeting with a non-Thursday date is rejected with a clear error.
- Submitting a meeting where a user is both present and excused is rejected.
- Submitting a meeting for a date that already exists is rejected.
- Submitting a meeting with a top-up amount that is not a positive multiple of `5` is rejected.

### 9.3 Audit

- Submitting a meeting creates at least one audit entry that includes the meeting date and which users were penalized.
- If a meeting includes top-ups, the audit trail shows which users received how many plooikaarten and any entered comment.
- The audit trail is visible for all signed-in users and is ordered **newest-first**.

### 9.4 Password reset

- Requesting a password reset always returns a generic confirmation message.
- The user receives a reset link by email containing a single-use token.
- Using an expired/used token fails.
- After successful reset, the user can log in with the new password.

## 10) Out of Scope

- User self-registration / invites
- Role-based access control / admin UI
- Editing or deleting meetings (meetings are immutable once submitted)
- Automatic meeting creation (meetings exist only once submitted)

## 11) Open Questions (to confirm before implementation)

1. Should scores be allowed to go below 0, or must they be clamped at 0?
   - Answer: Scores can go below 0. If a user goes below 0, they must buy new plooikaarten at the next meeting (recorded as a top-up during meeting registration; optional comment stored in audit).
2. What should the seeded `username`/`email` values be for each user (or should they live in `.env`)?
   - Answer: `username` is the name in lowercase. `email` is `username@mail.com`, except Ewoud uses `ewoud.smets@gmail.com`.
3. Should the dashboard show only “my score” (minimum) or also a scoreboard of all users?
   - Answer: Also show a scoreboard/leaderboard of all users.
4. What email provider should be used (SMTP, SendGrid, Microsoft Graph), or is dev-mode “log email to console” acceptable?
   - Answer: Dev-mode for now: log the reset link to the server console.
