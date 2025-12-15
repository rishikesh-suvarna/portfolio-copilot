# Portfolio Copilot

A personal investment dashboard built on **Zerodha Kite Connect**, with a Python backend and a modern React frontend.

The goal of this project is:
**portfolio visibility first → realtime monitoring → alerts → investment insights**.

---

## Tech Stack

### Backend

- Python 3
- FastAPI
- Zerodha Kite Connect (REST + WebSocket)
- Uvicorn

### Frontend

- React (Vite)
- TanStack Router
- TanStack Query
- Tailwind CSS v4

---

## Project Structure

```plaintext
portfolio-copilot/
├── apps/
│   ├── api/            # FastAPI backend
│   │   ├── app/
│   │   │   ├── core/
│   │   │   ├── kite/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   └── .venv/
│   └── web/            # React + Vite frontend
│       └── src/
└── README.md
```

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- Zerodha account with Kite Connect enabled

---

## Backend Setup

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi "uvicorn[standard]" kiteconnect python-dotenv pydantic-settings
```

---

## Create `.env` file in `apps/api/app/` with the following content:

```bash
KITE_API_KEY=your_api_key
KITE_API_SECRET=your_api_secret
REDIRECT_URL=http://localhost:5173/auth/kite/callback
```

---

# Run the API server

```bash
cd apps/api
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

---

## Heatlh Check

```bash
curl http://localhost:8000/health
```

---

## Frontend Setup

```bash
cd apps/web
yarn
yarn dev
```

---

## Access the Frontend

Open your browser and navigate to `http://localhost:5173`

---

## Kite Apps Configuration

```bash
Redirect URL:
http://localhost:5173/auth/kite/callback
```

---
