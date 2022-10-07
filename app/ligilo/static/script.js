const init = (config) => {
    const requestUri = (path, params={}, baseUri=config.prefix) => {
        if (Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams(params);
            return baseUri + path + '?' + searchParams
        } else {
            return baseUri + path
        }
    };

    document.querySelector('button[name=md]')
        .addEventListener('click', async event => {
            if (document.querySelector('#ligilo-column-ed textarea').value !== '') {
                alert('Target textarea is not empty. Content will not be loaded.');
                return;
            }
            const text = document.querySelector('#ligilo-column-text textarea').value;
            const uri = requestUri('/api/ner');
            const response = await fetch(uri,{
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({'text': text})
            });
            const result = await response.json();
            document.querySelector('#ligilo-column-ed textarea').value = result.text;
            document.querySelector('#ligilo-column-ed .visual').innerHTML = result.html;
    });

    document.querySelector('button[name=ed-view][value=text]')
        .addEventListener('click', async event => {
            if (document.querySelector('#ligilo-column-ed textarea').style.display === 'none') {
                const html = document.querySelector('#ligilo-column-ed .visual').innerHTML;
                const uri = requestUri('/api/html/to/text');
                const response = await fetch(uri,{
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({'html': html})
                });
                const result = await response.json();
                document.querySelector('#ligilo-column-ed textarea').style.display = '';
                document.querySelector('#ligilo-column-ed .visual').style.display = 'none';
                document.querySelector('#ligilo-column-ed textarea').value = result.text;
            }
    });

    document.querySelector('button[name=ed-view][value=visual]')
        .addEventListener('click', async event => {
            if (document.querySelector('#ligilo-column-ed .visual').style.display === 'none') {
                const text = document.querySelector('#ligilo-column-ed textarea').value;
                const uri = requestUri('/api/text/to/html');
                const response = await fetch(uri, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({'text': text})
                });
                const result = await response.json();
                document.querySelector('#ligilo-column-ed textarea').style.display = 'none';
                document.querySelector('#ligilo-column-ed .visual').style.display = '';
                document.querySelector('#ligilo-column-ed .visual').innerHTML = result.html;
            }
    });

    const reloadTargetSelectorResults = async query => {
        const uri = requestUri('/w/api.php',
                {'origin': '*',
                        'action': 'query',
                        'format': 'json',
                        'formatversion': 2,
                        'prop': 'info|pageprops|pageimages|description',
                        'generator': 'prefixsearch',
                        'gpssearch': query,
                        'gpslimit': 10,
                        'ppprop': 'disambiguation',
                        'redirects': 'true',
                        'pithumbsize': 80,
                        'pilimit': 10
                }, 'https://en.wikipedia.org')
        const response = await fetch(uri, {method: 'GET'});
        const result = await response.json();
        const targetSelectorTable = document.querySelector('#ligilo-target-selector table');
        targetSelectorTable.innerHTML = '';
        const sortedPages = result.query.pages.sort((a, b) => {
            return a.index - b.index;
        });
        result.query.pages.forEach(page => {
            const imgSrc = page.hasOwnProperty('thumbnail') ? page.thumbnail.source : '';
            targetSelectorTable.innerHTML += '<tr data-target="' + page.title + '">' +
                '<td><img alt="" src="' + imgSrc + '" /></td>' +
                '<td><a href="https://en.wikipedia.org/wiki/' + page.title + '" target="_blank">' + page.title + '</a>' +
                '<span>' + page.description + '</span></td>' +
            '</tr>';
        });
    };

    let currentMark = null; //reference to currently edited mention
    document.addEventListener('click', async event => {
        if (event.target.closest('mark')) { // open popup when clicking on <mark> element
            currentMark = event.target.closest('mark'); // update global reference

            const mention = event.target.parentNode.querySelector('.mention').textContent;
            const target = event.target.parentNode.querySelector('.target').textContent;
            const searchBoxValue = target === '' ? mention : target;

            await reloadTargetSelectorResults(searchBoxValue);
            document.querySelector('#ligilo-target-selector input[name=search]').value = searchBoxValue;

            const targetSelector = document.querySelector('#ligilo-target-selector');
            targetSelector.style.display = '';  //show target selector

            const top = event.pageY+15;
            let left = event.pageX;
            // correct position if out of screen
            if (left+targetSelector.offsetWidth > window.innerWidth) {
                left -= (left+targetSelector.offsetWidth-window.innerWidth)
            }
            targetSelector.style.top = top + 'px';
            targetSelector.style.left = left + 'px';
        } else if (event.target.closest('tr[data-target]')) {
            currentMark.querySelector('.target').innerText = event.target.closest('tr[data-target]').dataset.target;
        } else if (!event.target.closest('#ligilo-target-selector')) { // close popup when clicked outside
            document.querySelector('#ligilo-target-selector').style.display = 'none';
        }
    });

    document.querySelector('#ligilo-target-selector input[name=search]')
        .addEventListener('input', async event => {
            await reloadTargetSelectorResults(event.target.value);
        });
};
