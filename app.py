"""
Optional Gradio demo for the personal-site chatbot starter.
"""

import gradio as gr

from core import PersonalSiteChatbot


chatbot = PersonalSiteChatbot()


def chat(message, history):
    formatted_history = []
    for user_message, assistant_message in history:
        formatted_history.append({"role": "user", "content": user_message})
        formatted_history.append({"role": "assistant", "content": assistant_message})
    return chatbot.chat(message, formatted_history)


if __name__ == "__main__":
    gr.ChatInterface(chat).launch()
