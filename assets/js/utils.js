var nouns = ["leopard", "otter", "puma", "tiger", "snake", "mongoose", "unicorn", "pirahna"]
var adjectives = ["sparkling", "orange", "unruly", "leaping", "pink", "mangy", "tiny"]

const range = (start, end) => [...Array(1 + end - start).keys()].map(v => start + v)
const random = items => items[Math.floor(Math.random() * items.length)];
const createName = _ => random(adjectives) + random(nouns);

function renderNameEntryForm(elementId) {
    let html =
        ` 
    <div>
        <form action="" id="name-form">
        <h2 id="name-entry-header"> Enter your name here: </h2>
            <label for=""></label>
            <input id="name-input" type="text">
        </form> 
    </div>
        `;

    let div = $('div').html(html);
    div.appendTo($(elementId));
}