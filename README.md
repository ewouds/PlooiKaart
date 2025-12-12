# PlooiKaart

A scoring system application.

## Setup

1.  Install dependencies:

    ```bash
    npm install
    ```

2.  Configure environment:

    - Copy `.env.example` to `.env`.
    - Update `MONGODB_URI` if needed.

3.  Start MongoDB:
    - Ensure you have a MongoDB instance running (e.g., via Docker or local installation).
    - Connection string defaults to `mongodb://localhost:27017/plooikaart`.

## Running

Start both the backend server and the frontend client:

```bash
npm run dev:full
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Features

- **Login**: Use seeded users (e.g., `ewoud` / `password` - wait, password needs reset first).
- **Password Reset**: Since seeded users have no password, go to "Forgot Password", enter username/email. In dev-mode, the reset link is logged to the server console. Click it to set a password.
- **Dashboard**: View your score and the leaderboard.
- **Meetings**: Register Thursday meetings, mark attendance, and add top-ups.
- **Audit Trail**: View history of actions.

## Seeded Users

- Ewoud (`ewoud`)
- Tom (`tom`)
- Dave (`dave`)
- Birger (`birger`) - Pilot (+5 points)
- Bert (`bert`)

## Tech Stack

- **Frontend**: React, Vite, TypeScript
- **Backend**: Node.js, Express, Mongoose, TypeScript
- **Database**: MongoDB
