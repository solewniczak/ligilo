const init = (config) => {
    const requestUri = (path, params) => {
        if (params && Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams(params);
            return config.prefix + path + '?' + searchParams
        } else {
            return config.prefix + path
        }
    };

    document.querySelector('#ligilo-column-buttons button[name=spacy-ner]')
        .addEventListener('click', (event) => {
            const text = document.querySelector('#ligilo-column-text textarea').value;
            const uri = requestUri('/api/ner');
            fetch(uri,{
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({'text': text})
            }).then(response => response.json())
            .then(result => {
                document.querySelector('#ligilo-column-ed textarea').value = result.text;
            });
    });
};
