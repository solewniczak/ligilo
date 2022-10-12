FROM python:3.10.7
WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY app /app
CMD ["gunicorn", "-b", "0.0.0.0:8000", "ligilo:app"]