"""
Core chatbot functionality shared by the API and demo app.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os

from dotenv import load_dotenv
from openai import OpenAI
from pypdf import PdfReader


load_dotenv(override=True)

SUPPORTED_KNOWLEDGE_EXTENSIONS = {".md", ".pdf", ".txt"}


@dataclass
class BotConfig:
    name: str
    role: str
    objective: str
    tone: str
    call_to_action: str
    additional_instructions: str
    knowledge_dir: Path
    model: str

    @classmethod
    def from_env(cls) -> "BotConfig":
        return cls(
            name=os.getenv("BOT_NAME", "Site Assistant"),
            role=os.getenv("BOT_ROLE", "an AI assistant for a personal website"),
            objective=os.getenv(
                "BOT_OBJECTIVE",
                "Help visitors understand the site owner's background, projects, interests, and ways to get in touch.",
            ),
            tone=os.getenv("BOT_TONE", "professional, warm, and concise"),
            call_to_action=os.getenv(
                "BOT_CALL_TO_ACTION",
                "When it fits naturally, encourage visitors to explore the site or reach out using the contact details provided in the knowledge base.",
            ),
            additional_instructions=os.getenv("BOT_ADDITIONAL_INSTRUCTIONS", "").strip(),
            knowledge_dir=Path(os.getenv("KNOWLEDGE_DIR", "knowledge")),
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        )


def load_text_document(path: Path) -> str:
    return path.read_text(encoding="utf-8").strip()


def load_pdf_document(path: Path) -> str:
    reader = PdfReader(str(path))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text.strip())
    return "\n\n".join(pages).strip()


def load_knowledge_documents(knowledge_dir: Path) -> str:
    if not knowledge_dir.exists() or not knowledge_dir.is_dir():
        return ""

    documents = []
    for path in sorted(knowledge_dir.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in SUPPORTED_KNOWLEDGE_EXTENSIONS:
            continue

        if path.suffix.lower() == ".pdf":
            content = load_pdf_document(path)
        else:
            content = load_text_document(path)

        if content:
            relative_path = path.relative_to(knowledge_dir)
            documents.append(f"## {relative_path}\n{content}")

    return "\n\n".join(documents)


class PersonalSiteChatbot:
    """Config-driven chatbot for personal sites."""

    def __init__(self):
        self.openai = OpenAI()
        self.config = BotConfig.from_env()
        self.knowledge = load_knowledge_documents(self.config.knowledge_dir)

    def system_prompt(self) -> str:
        prompt = [
            f"You are {self.config.name}, {self.config.role}.",
            self.config.objective,
            f"Write in a {self.config.tone} tone.",
            "Answer using only the information in the provided knowledge base and the active conversation.",
            "If the answer is not supported by the knowledge base, say that you are not sure instead of inventing details.",
            "Be helpful and specific, but do not claim experiences, credentials, or facts that are not in the knowledge base.",
            self.config.call_to_action,
        ]

        if self.config.additional_instructions:
            prompt.append(self.config.additional_instructions)

        if self.knowledge:
            prompt.append(f"Knowledge base:\n\n{self.knowledge}")
        else:
            prompt.append(
                "Knowledge base: No documents are loaded yet. Be transparent that setup is incomplete and ask the owner to add files to the configured knowledge directory."
            )

        return "\n\n".join(prompt)

    def chat(self, message, history=None):
        """Chat interface compatible with FastAPI and Gradio."""
        if history is None:
            history = []

        messages = [{"role": "system", "content": self.system_prompt()}]
        messages.extend(history)
        messages.append({"role": "user", "content": message})

        response = self.openai.chat.completions.create(
            model=self.config.model,
            messages=messages,
        )

        return response.choices[0].message.content or ""
