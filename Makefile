PYTHON ?= python3
PIP ?= $(PYTHON) -m pip

.PHONY: install api demo test

install:
	$(PIP) install -r requirements-api.txt

api:
	$(PYTHON) -m uvicorn api:app --reload

demo:
	$(PYTHON) app.py

test:
	$(PYTHON) test_api.py
