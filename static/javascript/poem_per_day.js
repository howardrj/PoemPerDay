G_POEMS_URL_BASE = location.protocol + '//' + location.hostname + ':' + location.port;
G_POEMS_BY_ID_API_URL = G_POEMS_URL_BASE + '/api/poems/';

g_current_poem = null;

class Poem
{
    constructor (poem_id,
                 title,
                 author,
                 date_selected,
                 lines,
                 poems_by_id_map)
    {
        this.id = parseInt(poem_id);
        this.title = title;
        this.author = author;
        this.date_selected = date_selected;
        this.lines = lines;

        this.poems_by_id_map = poems_by_id_map;
        this.poems_by_id_map[this.id] = this;

        this.next_poem = null;
        this.prev_poem = null;
    }

    async display ()
    {
        if (!this._poem_info_set())
            await this._fetch()

        if (!this.next_poem)
            await this._fetch_next_poem();

        if (!this.prev_poem)
            await this._fetch_prev_poem();

        let poem_id_elem = document.getElementById('poem_id');
        poem_id_elem.setAttribute('data-id', this.id);

        let poem_title_elem = document.getElementById('poem_title');
        poem_title_elem.innerHTML = this.title;

        let poem_author_elem = document.getElementById('poem_author');
        poem_author_elem.innerHTML = 'by ' + this.author;

        let poem_lines_elem = document.getElementById('poem_lines');
        poem_lines_elem.innerHTML = this.lines;

        let poem_date_elem = document.getElementById('poem_date');
        poem_date_elem.innerHTML = this.date_selected;

        this._display_arrows();

        g_current_poem = this;
    }

    display_next_poem ()
    {
        this.next_poem.display();
    }

    display_prev_poem ()
    {
        this.prev_poem.display();
    }

    _display_arrows ()
    {
        let next_arrow = document.getElementById('next_poem_arrow');
        let prev_arrow = document.getElementById('prev_poem_arrow');

        if (this.next_poem)
        {
            next_arrow.classList.add('poem_arrow_hoverable');
            next_arrow.classList.remove('poem_arrow_not_hoverable');
        }
        else
        {
            next_arrow.classList.add('poem_arrow_not_hoverable');
            next_arrow.classList.remove('poem_arrow_hoverable');
        }

        if (this.prev_poem)
        {
            prev_arrow.classList.add('poem_arrow_hoverable');
            prev_arrow.classList.remove('poem_arrow_not_hoverable');
        }
        else
        {
            prev_arrow.classList.add('poem_arrow_not_hoverable');
            prev_arrow.classList.remove('poem_arrow_hoverable');
        }
    }

    _poem_info_set ()
    {
        return this.title &&
               this.author &&
               this.date_selected &&
               this.lines;
    }

    async _fetch ()
    {
        let response = await fetch(G_POEMS_BY_ID_API_URL + this.id + '/');

        if (!response.ok)
            return;

        let data = await response.json();

        this.title = data['title'];
        this.author = data['author'];
        this.date_selected = data['date_selected'];
        this.lines = data['lines'];
    }

    async _fetch_next_poem ()
    {
        let next_id = this.id + 1;

        if (next_id in this.poems_by_id_map)
        {
            this.next_poem = this.poems_by_id_map[next_id];
            return;
        }

        let response = await fetch(G_POEMS_BY_ID_API_URL + next_id + '/');

        if (!response.ok)
            return;

        let data = await response.json();

        this.next_poem = new Poem(next_id,
                                  data['title'],
                                  data['author'],
                                  data['date_selected'],
                                  data['lines'],
                                  this.poems_by_id_map);
    }

    async _fetch_prev_poem ()
    {
        let prev_id = this.id - 1;

        if (prev_id <= 0)
            return;

        if (prev_id in this.poems_by_id_map)
        {
            this.prev_poem = this.poems_by_id_map[prev_id];
            return;
        }

        let response = await fetch(G_POEMS_BY_ID_API_URL + prev_id + '/');

        if (!response.ok)
            return;

        let data = await response.json();

        this.prev_poem = new Poem(prev_id,
                                      data['title'],
                                      data['author'],
                                      data['date_selected'],
                                      data['lines'],
                                      this.poems_by_id_map);
    }
}

(function () {

    let poem_id_elem = document.getElementById('poem_id');
    let starting_poem_id = poem_id_elem.getAttribute('data-id');
    let next_arrow = document.getElementById('next_poem_arrow');
    let prev_arrow = document.getElementById('prev_poem_arrow');

    let poems_by_id_map = {};

    let starting_poem = new Poem(starting_poem_id,
                                 null, 
                                 null,
                                 null,
                                 null,
                                 poems_by_id_map);

    starting_poem.display();

    next_arrow.addEventListener('click', function (event) {
        g_current_poem.display_next_poem();
    });

    prev_arrow.addEventListener('click', function (event) {
        g_current_poem.display_prev_poem();
    });

})();

