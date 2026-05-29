/**
 * API communication layer for the chat widget
 */

import { ChatApiRequest, ChatApiResponse } from './types';

const DEFAULT_API_BASE_URL = '/api';
const STATIC_REPLY = "Static mode is enabled, so this widget is returning a placeholder response.";
const STATIC_MODE = import.meta.env.VITE_CHATBOT_STATIC_MODE === 'true';

class ChatApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ChatApiError';
  }
}

export class ChatApi {
  private baseUrl: string;
  private abortController: AbortController | null = null;

  constructor(baseUrl: string = DEFAULT_API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Send a chat message to the API
   */
  async sendMessage(request: ChatApiRequest): Promise<ChatApiResponse> {
    if (STATIC_MODE) {
      return {
        reply: STATIC_REPLY,
        sessionId: request.session_id || 'static-chat-session',
      };
    }

    // Cancel any previous request
    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();

    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ChatApiError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json() as { reply: string };
      return {
        reply: data.reply,
        sessionId: response.headers.get('X-Session-Id') || request.session_id || '',
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ChatApiError('Request was cancelled');
      }

      if (error instanceof ChatApiError) {
        throw error;
      }

      throw new ChatApiError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Reset the chat session
   */
  async resetSession(sessionId: string): Promise<void> {
    if (STATIC_MODE) {
      void sessionId;
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ChatApiError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }
    } catch (error) {
      if (error instanceof ChatApiError) {
        throw error;
      }
      throw new ChatApiError(
        error instanceof Error ? error.message : 'Failed to reset session'
      );
    }
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<boolean> {
    if (STATIC_MODE) {
      return true;
    }

    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Cancel any ongoing request
   */
  cancelRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

// Default export for convenience
export default ChatApi;
