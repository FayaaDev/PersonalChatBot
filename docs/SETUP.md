# Setup

## Requirements

- Python 3.11+
- Node.js 18+
- An OpenAI API key

## Backend

1. Create a virtual environment.

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies.

```bash
pip install -r requirements-api.txt
```

3. Create `.env`.

```bash
cp .env.example .env
```

4. Set at least:

```bash
OPENAI_API_KEY=your_openai_api_key_here
BOT_NAME=Your Site Assistant
```

5. Add your own files to `knowledge/`.

6. Start the API.

```bash
uvicorn api:app --reload
```

The API will be available at `http://localhost:8000/api`.

## Frontend Widget

1. Install dependencies.

```bash
cd frontend
npm install
```

2. Start the Vite dev server.

```bash
npm run dev
```

3. Point the widget to your backend.

Use `apiBaseUrl="http://localhost:8000/api"` during local development.

## Docker

```bash
cp .env.example .env
docker compose up --build
```

The compose setup mounts `./knowledge` into the container as read-only.

## Smoke Test

After the backend is running:

```bash
python test_api.py
```
