# Deployment

## Docker

Build and run:

```bash
cp .env.example .env
docker compose up --build -d
```

Health check:

```bash
curl http://localhost:8000/api/health
```

## Reverse Proxy

Expose the API behind your domain, for example:

- `https://your-domain.com/api`
- `https://chat.your-domain.com/api`

Set `CORS_ORIGINS` to the frontend origin or origins that will embed the widget.

Example:

```bash
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

## Production Notes

- Keep `knowledge/` curated and versioned.
- Use a small, focused set of docs for best grounding.
- Consider adding authentication before exposing admin-only content through knowledge files.
- The current implementation stores sessions in memory. For multi-instance deployment, replace the session store with Redis or another shared store.

## Validation

Run the included smoke test against the deployed service:

```bash
python test_api.py
```
