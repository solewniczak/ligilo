# Ligilo

Ligilo is a simple web-based application, that was created to simplify the development of the elgold dataset.
The final version of the dataset can be obtained here: https://doi.org/10.34808/9wvq-th71

Ligilo allows us to perform an NER over textual input, correct the NER results, and finally link the selected mentions 
with Wikipedia articles. The application uses Wikipedia search API to allow the user to search for potential links
directly in the application interface.

## Usage

Ligilo can be run directly using a Python interpreter or with Docker.

### Directly

The elgold toolset was tested with Python 3.10, but it
should also work with future Python versions.

1. Install pip requirements: `pip install -r requirements.txt`.
2. Go to the app directory: `cd app`
3. Run the application: `FLASK_APP=ligilo flask run`

### Docker

1. Modify environmental variables `BASE_URL` and `PREFIX` in `docker-compose.yml` as required.
2. Run the application: `docker compose up`

## Licence

Ligilo is released under the MIT license.

The elgold dataset is licensed under CC-BY 4.0.