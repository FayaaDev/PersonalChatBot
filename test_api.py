#!/usr/bin/env python3
"""
Smoke test script for the personal-site chatbot API.
Run this after starting the backend locally or in a container.
"""

from datetime import datetime
import time

import requests


API_BASE_URL = "http://localhost:8000"
TEST_MESSAGES = [
    "What should I know about this site owner?",
    "Which projects or areas of work are highlighted here?",
    "What is the best way to get in touch?",
]


def test_health_check():
    print("Testing health check...")
    try:
        response = requests.get(f"{API_BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            print(f"Health check passed: {response.json()}")
            return True
        print(f"Health check failed: {response.status_code}")
        return False
    except Exception as exc:
        print(f"Health check error: {exc}")
        return False


def test_chat_conversation():
    print("Testing chat conversation...")
    session_id = None

    for index, message in enumerate(TEST_MESSAGES, 1):
        print(f"Sending message {index}: {message}")
        payload = {"message": message}
        if session_id:
            payload["session_id"] = session_id

        try:
            start_time = time.time()
            response = requests.post(
                f"{API_BASE_URL}/api/chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30,
            )
            response_time = time.time() - start_time

            if response.status_code != 200:
                print(f"Chat failed: {response.status_code} - {response.text}")
                return False

            data = response.json()
            session_id = response.headers.get("X-Session-Id")
            print(f"Response ({response_time:.2f}s): {data['reply'][:120]}...")
        except Exception as exc:
            print(f"Chat error: {exc}")
            return False

        time.sleep(1)

    return True


def test_session_reset():
    print("Testing session reset...")
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/chat",
            json={"message": "Hello"},
            timeout=10,
        )
        if response.status_code != 200:
            print("Failed to create session for reset test")
            return False

        session_id = response.headers.get("X-Session-Id")
        reset_response = requests.post(
            f"{API_BASE_URL}/api/chat/reset",
            json={"session_id": session_id},
            timeout=10,
        )
        if reset_response.status_code == 200:
            print("Session reset successful")
            return True

        print(f"Session reset failed: {reset_response.status_code}")
        return False
    except Exception as exc:
        print(f"Session reset error: {exc}")
        return False


def test_cors():
    print("Testing CORS configuration...")
    try:
        response = requests.options(
            f"{API_BASE_URL}/api/chat",
            headers={"Origin": "http://localhost:5173"},
            timeout=5,
        )
        cors_headers = {
            "access-control-allow-origin": response.headers.get("access-control-allow-origin"),
            "access-control-allow-methods": response.headers.get("access-control-allow-methods"),
            "access-control-allow-headers": response.headers.get("access-control-allow-headers"),
        }
        print(f"CORS headers: {cors_headers}")
        return True
    except Exception as exc:
        print(f"CORS test error: {exc}")
        return False


def main():
    print("Starting personal-site chatbot API tests")
    print(f"Test started at: {datetime.now()}")
    print(f"Testing API at: {API_BASE_URL}")
    print("=" * 50)

    tests = [
        ("Health Check", test_health_check),
        ("Chat Conversation", test_chat_conversation),
        ("Session Reset", test_session_reset),
        ("CORS Configuration", test_cors),
    ]

    results = {}
    for test_name, test_func in tests:
        print(f"\n{'=' * 20} {test_name} {'=' * 20}")
        try:
            results[test_name] = test_func()
        except Exception as exc:
            print(f"{test_name} failed with exception: {exc}")
            results[test_name] = False

    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)

    passed = sum(1 for result in results.values() if result)
    total = len(results)
    for test_name, result in results.items():
        status = "PASS" if result else "FAIL"
        print(f"{status} - {test_name}")

    print(f"\nOverall Result: {passed}/{total} tests passed")
    return passed == total


if __name__ == "__main__":
    success = main()
    raise SystemExit(0 if success else 1)
