FROM python:3.10.7
WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

RUN python -m spacy download en_core_web_sm

COPY app /app
CMD ["gunicorn", "-b", "0.0.0.0:8000", "ligilo:app"]