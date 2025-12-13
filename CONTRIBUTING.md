# Contributing to PlooiKaart

Thank you for your interest in contributing to PlooiKaart! This document provides guidelines and instructions for setting up your development environment and submitting contributions.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher.
- **npm**: Usually comes with Node.js.
- **MongoDB**: You need a running MongoDB instance. We recommend using Docker.
- **Git**: For version control.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/PlooiKaart.git
    cd PlooiKaart
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```

## Environment Configuration

1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
2.  Open `.env` and configure the variables:

    - `MONGODB_URI`: Connection string for your local MongoDB. Default is `mongodb://localhost:27017/plooikaart`.
    - `JWT_SECRET`: A secret string for signing tokens. You can keep the default for development.
    - `PUBLIC_URL`: The URL where the frontend is running (default: `http://localhost:5173`).
    - `PORT`: The port for the backend server (default: `3000`).
    - `VITE_API_URL`: The URL of the backend API (default: `http://localhost:3000`).
    - `VITE_AZURE_STORAGE_SAS_URL`: (Optional) SAS URL for Azure Blob Storage if you want to test profile picture uploads.
    - `SMTP_*`: (Optional) Email settings. If not provided, password reset links will be logged to the backend console.

## Database Setup

You can run MongoDB easily using Docker:

```bash
docker run -d -p 27017:27017 --name plooikaart-mongo mongo:latest
```

The application will automatically seed the database with initial users if they don't exist when the server starts.

## Running the Application

To start both the backend server and the frontend client concurrently:

```bash
npm run dev:full
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:3000](http://localhost:3000)

## Project Structure

- **`src/`**: Frontend React application (Vite).
  - `components/`: Reusable UI components.
  - `pages/`: Route components.
  - `context/`: React Context providers (Auth, Theme).
  - `api/`: Axios client setup.
- **`server/`**: Backend Node.js/Express application.
  - `models/`: Mongoose schemas.
  - `routes/`: API route handlers.
  - `middleware/`: Express middleware (Auth).
  - `utils/`: Helper functions.
- **`public/`**: Static assets.

## Code Style

We use ESLint for code linting. Please ensure your code passes linting before submitting a PR.

```bash
npm run lint
```

## Submitting a Pull Request

1.  Create a new branch for your feature or fix:
    ```bash
    git checkout -b feature/my-new-feature
    ```
2.  Make your changes and commit them with clear messages.
3.  Push your branch to your fork:
    ```bash
    git push origin feature/my-new-feature
    ```
4.  Open a Pull Request on the main repository.
5.  Describe your changes and link any relevant issues.

## Troubleshooting

- **Login fails locally**: The seeded users (ewoud, tom, etc.) do not have passwords initially. You must use the "Forgot Password" flow.
  1. Go to `/login`.
  2. Click "Forgot Password?".
  3. Enter a username (e.g., `ewoud`).
  4. Check the **backend console** for the reset link.
  5. Open the link to set a password.

- **CORS errors**: Ensure `PUBLIC_URL` in `.env` matches your frontend URL.

Thank you for contributing!
