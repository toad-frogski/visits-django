FROM python:3-slim

WORKDIR /app

RUN pip install --no-cache-dir --no-warn-script-location \
  paho-mqtt requests

COPY main.py .

CMD ["python", "main.py"]
