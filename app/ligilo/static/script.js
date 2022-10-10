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

    const reloadTargetSelectorResults = async search => {
        const pilimit = 10;
        const uri = requestUri('/w/api.php',
                {'origin': '*',
                        'action': 'query',
                        'format': 'json',
                        'formatversion': 2,
                        'prop': 'info|pageprops|pageimages|description',
                        'generator': 'prefixsearch',
                        'gpssearch': search,
                        'gpslimit': 10,
                        'ppprop': 'disambiguation',
                        'redirects': 'true',
                        'pithumbsize': 80,
                        'pilimit': pilimit
                }, 'https://en.wikipedia.org')
        const response = await fetch(uri, {method: 'GET'});
        const result = await response.json();
        const query = 'query' in result ? result.query : {};
        const targetSelectorTable = document.querySelector('#ligilo-target-selector table');
        targetSelectorTable.innerHTML = '';
        const pages = 'pages' in query ? query.pages : [];
        const redirects = 'redirects' in query ? query.redirects : [];
        for (let i=1; i<=pilimit; i++) {
            const page = pages.find(page => page.index === i);
            const redirect = redirects.find(redirect => redirect.index === i);
            if (page) {
                let img = '<div class="icon default"></div>';
                if ('thumbnail' in page) {
                    img = '<img alt="" src="' + page.thumbnail.source + '" />'
                }
                const description = 'description' in page ? page.description : '';
                targetSelectorTable.innerHTML += '<tr data-target="' + page.title + '">' +
                    '<td>' + img + '</td>' +
                    '<td><a href="https://en.wikipedia.org/wiki/' + page.title + '">' + page.title + '</a>' +
                    '<span>' + description + '</span></td>' +
                    '</tr>';
            }
            if (redirect) {
                targetSelectorTable.innerHTML += '<tr data-target="' + redirect.from + '">' +
                    '<td><div class="icon redirect"></div></td>' +
                    '<td><a href="https://en.wikipedia.org/wiki/' + redirect.from + '">' + redirect.from + '</a>' +
                    '<span>redirect to ' + redirect.to + '</span></td>' +
                    '</tr>';
            }
        }

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
            event.preventDefault();  // prevent <a> from linking
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
