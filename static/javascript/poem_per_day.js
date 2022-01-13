G_POEMS_URL_BASE = location.protocol + '//' + location.hostname + ':' + location.port;
G_POEMS_BY_ID_API_URL = G_POEMS_URL_BASE + '/api/poems/';

class Poem
{
    constructor (poem_id,
                 title,
                 author,
                 date_selected,
                 lines,
                 poems_by_id_map)
    {
        console.log(`Poem ${poem_id} constructor`);

        this.id = parseInt(poem_id);
        this.title = title;
        this.author = author;
        this.date_selected = date_selected;
        this.lines = lines;

        this.poems_by_id_map = poems_by_id_map;
        this.poems_by_id_map[this.id] = this;

        this.next_poem = null;
        this.previous_poem = null;
    }

    async display ()
    {
        if (!this.#poem_info_set())
            await this.#fetch()

        if (!this.next_poem)
            await this.#fetch_next_poem();

        if (!this.previous_poem)
            await this.#fetch_previous_poem();
    }

    display_next_poem ()
    {
        this.next_poem.display();
    }

    display_previous_poem ()
    {
        this.previous_poem.display();
    }

    #poem_info_set ()
    {
        return this.title &&
               this.author &&
               this.date_selected &&
               this.lines;
    }

    async #fetch ()
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

    async #fetch_next_poem ()
    {
        let next_id = this.id + 1;

        if (next_id in this.poems_by_id_map)
            return this.poems_by_id_map[next_id];

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

    async #fetch_previous_poem ()
    {
        let previous_id = this.id - 1;

        if (previous_id <= 0)
            return;

        if (previous_id in this.poems_by_id_map)
            return this.poems_by_id_map[previous_id];

        let response = await fetch(G_POEMS_BY_ID_API_URL + previous_id + '/');

        if (!response.ok)
            return;

        let data = await response.json();

        this.previous_poem = new Poem(previous_id,
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

    let poems_by_id_map = {};

    let starting_poem = new Poem(starting_poem_id,
                                 null, 
                                 null,
                                 null,
                                 null,
                                 poems_by_id_map);

    starting_poem.display();

})();

