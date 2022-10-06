const init = (config) => {
    const requestUri = (path, params) => {
        if (params && Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams(params);
            return config.prefix + path + '?' + searchParams
        } else {
            return config.prefix + path
        }
    };

    document.querySelector('button[name=md]')
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

    document.querySelector('button[name=ed-view][value=text]')
        .addEventListener('click', (event) => {
            if (document.querySelector('#ligilo-column-ed textarea').style.display === 'none') {
                const html = document.querySelector('#ligilo-column-ed .visual').innerHTML;
                const uri = requestUri('/api/visual/to/text');
                fetch(uri,{
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({'html': html})
                }).then(response => response.json())
                    .then(result => {
                        document.querySelector('#ligilo-column-ed textarea').style.display = '';
                        document.querySelector('#ligilo-column-ed .visual').style.display = 'none';
                        document.querySelector('#ligilo-column-ed textarea').value = result.text;
                    });
            }
    });

    document.querySelector('button[name=ed-view][value=visual]')
        .addEventListener('click', (event) => {
            if (document.querySelector('#ligilo-column-ed .visual').style.display === 'none') {
                const text = document.querySelector('#ligilo-column-ed textarea').value;
                const uri = requestUri('/api/text/to/visual');
                fetch(uri, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({'text': text})
                }).then(response => response.json())
                    .then(result => {
                        document.querySelector('#ligilo-column-ed textarea').style.display = 'none';
                        document.querySelector('#ligilo-column-ed .visual').style.display = '';
                        document.querySelector('#ligilo-column-ed .visual').innerHTML = result.html;
                    });
            }
    });

    document.addEventListener('click', (event) => {
        if (event.target.parentNode.nodeName === 'MARK') {
            const mention = event.target.parentNode.querySelector('.mention').textContent;
            const target = event.target.parentNode.querySelector('.target').textContent;
            const uri = 'https://en.wikipedia.org/w/api.php?origin=*&action=query&format=json&formatversion=2&prop=info|pageprops|pageimages|description&generator=prefixsearch&gpssearch=' + mention + '&gpslimit=10&ppprop=disambiguation&redirects=true&pithumbsize=80&pilimit=10'
            fetch(uri, {
                    method: 'GET'
                }).then(response => response.json())
                    .then(result => {
                        console.log(result);
                    });
        }
    });
};
