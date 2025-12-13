# PlooiKaart

A scoring system application for the PlooiKaart group.

## Quick Start

1.  **Install dependencies**:

    ```bash
    npm install
    ```

2.  **Configure environment**: Copy `.env.example` to `.env` and adjust settings if necessary.

    ```bash
    cp .env.example .env
    ```

3.  **Start the app**:
    ```bash
    npm run dev:full
    ```

For detailed setup instructions, including database configuration and troubleshooting, please see [CONTRIBUTING.md](CONTRIBUTING.md).

## Features

- **Login**: Secure authentication with JWT.
- **Password Reset**: Email-based (or console-logged in dev) password reset flow.
- **Dashboard**: Real-time leaderboard and personal score tracking.
- **Meetings**: Manage weekly meetings, attendance, and top-ups.
- **Audit Trail**: Comprehensive log of all system actions.
- **PWA**: Installable as a Progressive Web App.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on how to set up your development environment and submit pull requests.

## Uploads & Azure Storage

- The backend handles uploads and streams them to Azure Blob Storage using the `AZURE_STORAGE_CONNECTION_STRING` environment variable.
- For local development, set `AZURE_STORAGE_CONNECTION_STRING` in your `.env` (see `.env.example`).
- For CI/CD and production, add the connection string to **GitHub Secrets** (Settings → Secrets and variables → Actions) and avoid committing any secrets to the repo. Prefer Managed Identity or Key Vault in production.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Material UI
- **Backend**: Node.js, Express, Mongoose, TypeScript
- **Database**: MongoDB (Cosmos DB in production)
- **Deployment**: Azure Static Web Apps & Azure Container Apps

## License

[MIT](LICENSE)
