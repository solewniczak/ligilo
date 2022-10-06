import os
import re

import spacy
from flask import Flask, render_template, request


class PrefixMiddleware(object):
    def __init__(self, app, prefix=''):
        self.app = app
        self.prefix = prefix

    def __call__(self, environ, start_response):
        if environ['PATH_INFO'].startswith(self.prefix):
            environ['PATH_INFO'] = environ['PATH_INFO'][len(self.prefix):]
            environ['SCRIPT_NAME'] = self.prefix
            return self.app(environ, start_response)
        else:
            start_response('404', [('Content-Type', 'text/plain')])
            return ["This url does not belong to the app.".encode()]


# create and configure the app
app = Flask(__name__)
app.config.from_mapping(
    SECRET_KEY=os.getenv('SECRET_KEY', default='dev'),
    BASE_URL=os.getenv('BASE_URL', default=''),
    PREFIX=os.getenv('PREFIX', default=''),
)

app.wsgi_app = PrefixMiddleware(app.wsgi_app, prefix=app.config['PREFIX'])


@app.route('/')
def main():
    config = {
        'prefix': app.config['PREFIX']
    }
    return render_template('index.html', config=config)


@app.route('/api/ner', methods=('POST',))
def api_ner():
    request_json = request.get_json()
    text = request_json['text']
    nlp = spacy.load('en_core_web_sm')
    doc = nlp(text)
    if len(doc.ents) == 0:
        return {'text': text}

    new_text = ''
    start = 0
    for ent in doc.ents:
        new_text += text[start:ent.start_char] + '{{' + ent.text + '|' + ent.label_ + '|}}'
        start += len(text[start:ent.start_char]) + len(ent.text)
    new_text += text[doc.ents[-1].end_char:]
    return {'text': new_text}


@app.route('/api/text/to/visual', methods=('POST',))
def api_text_to_visual():
    request_json = request.get_json()
    text = request_json['text']
    html = re.sub(r'{{([^|}]*)\|([^|}]*)\|([^|}]*)}}',
                  r'<mark><span class="mention">\1</span><span class="target">\3</span><span class="ner-class">\2</span></mark>', text)
    return {'html': html}


@app.route('/api/visual/to/text', methods=('POST',))
def api_visual_to_text():
    request_json = request.get_json()
    html = request_json['html']
    text = re.sub(r'<mark><span class="mention">([^<]*)</span><span class="target">([^<]*)</span><span class="ner-class">([^<]*)</span></mark>',
                  r'{{\1|\3|\2}}', html)
    return {'text': text}