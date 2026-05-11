ARG PYTHON_IMAGE_VERSION=3.14
ARG ENVIRONMENT=production

FROM python:${PYTHON_IMAGE_VERSION}-slim AS builder

# set environment variables
ENV DJANGO_SETTINGS_MODULE=main.settings \
  PATH="/venv/bin:$PATH" \
  PYTHONDONTWRITEBYTECODE=1 \
  PYTHONUNBUFFERED=1 \
  UV_CACHE_DIR=/root/.cache/uv \
  UV_COMPILE_BYTECODE=1 \
  UV_FROZEN=1 \
  UV_LINK_MODE=copy \
  UV_NO_MANAGED_PYTHON=1 \
  UV_PROJECT_ENVIRONMENT=/venv \
  UV_PYTHON_DOWNLOADS=never \
  UV_REQUIRE_HASHES=1 \
  UV_VERIFY_HASHES=1 \
  VIRTUAL_ENV=/venv

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# install build dependencies
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  build-essential pkg-config python3-dev libldap2-dev libsasl2-dev libmariadb-dev-compat


WORKDIR /app

RUN --mount=type=cache,target=/app/.cache/uv \
  --mount=type=bind,source=uv.lock,target=uv.lock \
  --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
  if [ "$ENVIRONMENT" = "production" ]; then \
    uv sync --frozen --no-dev; \
  else \
    uv sync --frozen; \
  fi

COPY . .

RUN python manage.py collectstatic --noinput


FROM python:${PYTHON_IMAGE_VERSION}-slim

ARG PYTHON_IMAGE_VERSION
ARG PORT=8000

ENV DJANGO_SETTINGS_MODULE=main.settings \
  PATH="/venv/bin:$PATH" \
  PORT=${PORT} \
  PYTHONDONTWRITEBYTECODE=1 \
  PYTHONUNBUFFERED=1 \
  VIRTUAL_ENV=/venv

EXPOSE ${PORT}

WORKDIR /app

VOLUME [ "/var/run/python" ]

RUN apt-get update && apt-get install -y --no-install-recommends libldap2 libmariadb3 libexpat1

COPY --from=builder /venv /venv
COPY --from=builder /app /app

CMD ["python", "-m", "uvicorn", "main.asgi:application", "--uds", "/var/run/python/asgi.sock"]