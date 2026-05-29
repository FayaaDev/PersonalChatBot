# Customization

## Assistant Identity

Configure the assistant with environment variables:

```bash
BOT_NAME=Jane's Site Assistant
BOT_ROLE=an AI assistant for Jane Doe's portfolio
BOT_OBJECTIVE=Help visitors understand Jane's background, featured work, writing, and contact details.
BOT_TONE=clear, thoughtful, and approachable
BOT_CALL_TO_ACTION=When helpful, invite visitors to read more on the site or use the contact details listed in the knowledge base.
BOT_ADDITIONAL_INSTRUCTIONS=Prefer short paragraphs and cite project names exactly as written in the knowledge files.
```

## Knowledge Folder

The backend reads every supported file inside `KNOWLEDGE_DIR` recursively.

Supported file types:

- `.md`
- `.txt`
- `.pdf`

Recommended structure:

```text
knowledge/
├── about.md
├── contact.md
├── writing.md
└── projects/
    ├── flagship-project.md
    └── consulting-case-study.pdf
```

Tips:

- Keep one topic per file.
- Put contact details in a dedicated file.
- Remove stale documents so the model does not repeat old information.
- Use markdown headings and bullets to make facts easier for the model to follow.

## Widget Props

The React widget is configurable without editing the component source.

Important props:

- `apiBaseUrl`
- `assistantName`
- `assistantSubtitle`
- `assistantAvatar`
- `welcomeMessage`
- `placeholder`
- `footerText`
- `quickActions`
- `storageKey`
- `position`
- `theme`
- `maxWidth`
- `maxHeight`

Example:

```tsx
<ChatWidget
  apiBaseUrl="https://your-domain.com/api"
  assistantName="Portfolio Guide"
  assistantSubtitle="Knows the bio, projects, and contact info"
  assistantAvatar="PG"
  welcomeMessage="Ask me about the work, background, or how to get in touch."
  placeholder="Ask about projects, experience, or writing..."
  footerText="Answers are generated from the documents configured for this site."
  quickActions={[
    { label: 'Bio', prompt: 'Give me a quick overview of this person.' },
    { label: 'Work', prompt: 'What work or projects stand out most?' },
    { label: 'Contact', prompt: 'How can I reach out?' },
  ]}
/>
```

## Prompt Behavior

The backend prompt is intentionally conservative:

- it answers from the loaded documents
- it uses the active conversation history
- it avoids inventing unsupported facts
- it tells the user when setup is incomplete or the answer is uncertain

If you want stronger guardrails, put them in `BOT_ADDITIONAL_INSTRUCTIONS`.
