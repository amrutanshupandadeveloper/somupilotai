# SomuPilot AI

SomuPilot AI is a MERN full-stack foundation for a personal AI agent dashboard. This starter includes a React + Vite + Tailwind frontend and an Express + MongoDB backend with a health check endpoint.

## Project Structure

```text
somupilot-ai/
├── client/
├── server/
├── .gitignore
└── README.md
```

## Getting Started

### 1. Install dependencies

```bash
npm install

cd server
npm install

cd ../client
npm install
```

### 2. Configure environment variables

Create `.env` files from the provided examples:

```bash
server/.env
client/.env
```

### 3. Run the development servers

Run both frontend and backend together from the root:

```bash
npm start
```

Or run them separately.

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

## API Health Check

```http
GET /api/health
```

Response:

```json
{
  "success": true,
  "message": "SomuPilot AI API is running"
}
```
