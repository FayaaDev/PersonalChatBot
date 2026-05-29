# Personal Site Chatbot Starter

A generic starter for adding an AI chat assistant to a personal website.

The backend is a FastAPI service that loads knowledge from a local folder and sends grounded prompts to OpenAI. The frontend is a reusable React chat widget that can be embedded into any site.

## What You Get

- Config-driven assistant identity
- Knowledge loading from a `knowledge/` folder
- FastAPI chat API with sessions and rate limiting
- React widget with local session persistence
- Docker and local-dev setup
- Separate setup, customization, and deployment guides

## Architecture

```text
React widget -> FastAPI backend -> OpenAI API
                 |
                 -> local knowledge documents
```

## Quick Start

1. Copy the environment file.

```bash
cp .env.example .env
```

2. Add your OpenAI key and bot settings to `.env`.

3. Replace the sample files in `knowledge/` with your own documents.

4. Start the API.

```bash
pip install -r requirements-api.txt
uvicorn api:app --reload
```

5. In another terminal, run the widget locally.

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```text
.
├── api.py
├── app.py
├── core.py
├── knowledge/
├── frontend/
├── docs/
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── test_api.py
```

## Knowledge Folder

The backend reads every `.md`, `.txt`, and `.pdf` file inside `knowledge/`, recursively.

Example:

```text
knowledge/
├── about.md
├── contact.txt
└── projects/
    ├── product-launch.md
    └── case-study.pdf
```

Each file becomes part of the system prompt, labeled with its relative path.

## Key Configuration

Main environment variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `BOT_NAME`
- `BOT_ROLE`
- `BOT_OBJECTIVE`
- `BOT_TONE`
- `BOT_CALL_TO_ACTION`
- `BOT_ADDITIONAL_INSTRUCTIONS`
- `KNOWLEDGE_DIR`
- `CORS_ORIGINS`
- `SESSION_TIMEOUT_MINUTES`
- `MAX_HISTORY_LENGTH`
- `RATE_LIMIT`

## Frontend Integration

Use the widget in your React app:

```tsx
import { ChatWidget } from './components/ChatWidget';

export function App() {
  return (
    <ChatWidget
      apiBaseUrl="http://localhost:8000/api"
      assistantName="Jane's Site Assistant"
      assistantSubtitle="Answers from the portfolio knowledge base"
      assistantAvatar="JD"
      welcomeMessage="Hi, I can answer questions about Jane's work, background, and current projects."
      footerText="Responses are generated from the documents configured for this site."
      quickActions={[
        { label: 'About', prompt: 'Tell me about Jane.' },
        { label: 'Projects', prompt: 'Which projects should I look at first?' },
        { label: 'Contact', prompt: 'How can I get in touch?' },
      ]}
    />
  );
}
```

## Guides

- `docs/SETUP.md`: install and run locally
- `docs/CUSTOMIZATION.md`: persona, knowledge, and widget configuration
- `docs/DEPLOYMENT.md`: Docker and production notes

## Verification

Run the API smoke test after starting the backend:

```bash
python test_api.py
```

## Notes

- This starter does not do retrieval search yet. It injects the full knowledge folder into the prompt.
- Keep your knowledge files focused and curated for best results.
- If no knowledge files are present, the assistant will explicitly say setup is incomplete.
