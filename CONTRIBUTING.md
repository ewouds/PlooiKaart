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
    - `AZURE_STORAGE_CONNECTION_STRING`: Connection string for Azure Storage (preferred for local development). Example: `DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net`.
      - For production, prefer using **Azure Key Vault** or **Managed Identity** instead of storing keys in plain text.
      - Do **not** commit secrets. Add them to GitHub repository Secrets if CI needs them.
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

- **Uploads failing with 403/AuthenticationFailed**: We no longer embed SAS tokens in the frontend. The backend now accepts file uploads and streams them to Azure Storage using `AZURE_STORAGE_CONNECTION_STRING`.
  - Locally: set `AZURE_STORAGE_CONNECTION_STRING` in your `.env`.
  - In CI/CD: add a repository secret named `AZURE_STORAGE_CONNECTION_STRING` (or `AZURE_STORAGE_CONNECTION_STRING_PROD`) in **Settings > Secrets and variables > Actions**. Do not commit this value to the repository.
  - If you must allow client-side uploads (not recommended), implement a server endpoint that issues a short-lived SAS for a specific blob.

### Adding the secret to GitHub

1. Go to your repository on GitHub.
2. Click **Settings** → **Secrets and variables** → **Actions**.
3. Click **New repository secret**.
4. Enter **Name**: `AZURE_STORAGE_CONNECTION_STRING`.
5. Enter the **Value** (connection string) and **Add secret**.

Optional: If you want the CI workflow to fail when the secret is missing, create a repository variable named `REQUIRE_AZURE_STORAGE_SECRET` and set it to `true` under **Settings → Secrets and variables → Actions → Variables**. The workflow includes a pre-check that will error if the variable is `true` and the secret is not present.

Thank you for contributing!
