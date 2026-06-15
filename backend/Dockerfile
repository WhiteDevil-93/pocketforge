FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV POCKETFORGE_USE_STUB_RESPONSES=true
ENV POCKETFORGE_CORS_ORIGINS=https://whitedevil-93.github.io

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]