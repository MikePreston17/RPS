var nouns = ["leopard", "otter", "puma", "tiger", "snake", "mongoose", "unicorn", "pirahna"]
var adjectives = ["sparkling", "orange", "unruly", "leaping", "pink", "mangy", "tiny"]

const range = (start, end) => [...Array(1 + end - start).keys()].map(v => start + v)
const random = items => items[Math.floor(Math.random() * items.length)];
const createName = _ => random(adjectives) + random(nouns);

