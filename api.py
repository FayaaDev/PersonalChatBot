"""
FastAPI backend for the personal-site chatbot starter.
"""

from contextlib import asynccontextmanager
from datetime import datetime, timedelta
import asyncio
import os
import time
import uuid
from typing import Dict, List, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from core import PersonalSiteChatbot


load_dotenv(override=True)


class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    timestamp: datetime


class SessionResetRequest(BaseModel):
    session_id: str


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str = "2.0.0"


class SessionManager:
    def __init__(self, timeout_minutes: int = 30, max_history_length: int = 20):
        self.sessions: Dict[str, Dict] = {}
        self.timeout_minutes = timeout_minutes
        self.max_history_length = max_history_length

    def create_session(self) -> str:
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "history": [],
            "created_at": datetime.now(),
            "last_activity": datetime.now(),
        }
        return session_id

    def get_session(self, session_id: str) -> Optional[Dict]:
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "history": [],
                "created_at": datetime.now(),
                "last_activity": datetime.now(),
            }
        else:
            self.sessions[session_id]["last_activity"] = datetime.now()

        return self.sessions[session_id]

    def add_to_history(self, session_id: str, user_message: str, bot_response: str):
        session = self.get_session(session_id)
        if session:
            session["history"].append(
                {
                    "user": user_message,
                    "bot": bot_response,
                    "timestamp": datetime.now(),
                }
            )

            if len(session["history"]) > self.max_history_length:
                session["history"] = session["history"][-self.max_history_length :]

    def reset_session(self, session_id: str):
        if session_id in self.sessions:
            self.sessions[session_id]["history"] = []
            self.sessions[session_id]["last_activity"] = datetime.now()

    def cleanup_expired_sessions(self):
        cutoff = datetime.now() - timedelta(minutes=self.timeout_minutes)
        expired_sessions = [
            sid for sid, data in self.sessions.items() if data["last_activity"] < cutoff
        ]
        for sid in expired_sessions:
            del self.sessions[sid]
        return len(expired_sessions)


session_manager = SessionManager(
    timeout_minutes=int(os.getenv("SESSION_TIMEOUT_MINUTES", "30")),
    max_history_length=int(os.getenv("MAX_HISTORY_LENGTH", "20")),
)

chatbot = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global chatbot

    try:
        chatbot = PersonalSiteChatbot()
        print("Initialized personal-site chatbot")
    except Exception as exc:
        print(f"Failed to initialize chatbot: {exc}")
        raise

    cleanup_task = asyncio.create_task(periodic_cleanup())

    yield

    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass


async def periodic_cleanup():
    while True:
        try:
            await asyncio.sleep(300)
            cleaned = session_manager.cleanup_expired_sessions()
            if cleaned > 0:
                print(f"Cleaned {cleaned} expired sessions")
        except asyncio.CancelledError:
            break
        except Exception as exc:
            print(f"Error during session cleanup: {exc}")


app = FastAPI(
    title="Personal Site Chatbot API",
    description="Configurable AI chatbot for a personal website",
    version="2.0.0",
    lifespan=lifespan,
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

request_counts: Dict[str, List[float]] = {}
RATE_LIMIT = int(os.getenv("RATE_LIMIT", "20"))
RATE_WINDOW = 60


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host


def check_rate_limit(client_ip: str) -> bool:
    now = time.time()

    if client_ip not in request_counts:
        request_counts[client_ip] = []

    request_counts[client_ip] = [
        req_time for req_time in request_counts[client_ip] if now - req_time < RATE_WINDOW
    ]

    if len(request_counts[client_ip]) >= RATE_LIMIT:
        return False

    request_counts[client_ip].append(now)
    return True


async def rate_limit_dependency(request: Request):
    client_ip = get_client_ip(request)
    if not check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please try again later.",
        )


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="healthy", timestamp=datetime.now())


@app.post("/api/chat", response_model=ChatResponse, dependencies=[Depends(rate_limit_dependency)])
async def chat_endpoint(chat_request: ChatRequest):
    global chatbot

    if not chatbot:
        raise HTTPException(status_code=500, detail="Chatbot service not initialized")

    try:
        session_id = chat_request.session_id or session_manager.create_session()
        session = session_manager.get_session(session_id)

        if not session:
            raise HTTPException(status_code=400, detail="Invalid session")

        history = []
        for item in session["history"]:
            history.append({"role": "user", "content": item["user"]})
            history.append({"role": "assistant", "content": item["bot"]})

        response = chatbot.chat(chat_request.message, history)
        session_manager.add_to_history(session_id, chat_request.message, response)

        return ChatResponse(
            reply=response,
            session_id=session_id,
            timestamp=datetime.now(),
        )
    except Exception as exc:
        print(f"Chat error: {exc}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {exc}")


@app.post("/api/chat/reset", dependencies=[Depends(rate_limit_dependency)])
async def reset_session(reset_request: SessionResetRequest):
    try:
        session_manager.reset_session(reset_request.session_id)
        return {"status": "success", "message": "Session reset successfully"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Reset failed: {exc}")


@app.get("/api/sessions/stats")
async def session_stats():
    total_sessions = len(session_manager.sessions)
    active_sessions = sum(
        1
        for session in session_manager.sessions.values()
        if datetime.now() - session["last_activity"] < timedelta(minutes=5)
    )

    return {
        "total_sessions": total_sessions,
        "active_sessions": active_sessions,
        "timestamp": datetime.now(),
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url),
        },
    )


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))

    uvicorn.run(
        "api:app",
        host=host,
        port=port,
        reload=True,
        log_level="info",
    )
