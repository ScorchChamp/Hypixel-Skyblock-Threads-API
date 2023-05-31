const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

let cache = {};
let cacheTime = 0;

const source_page = 'https://hypixel.net/forums/skyblock-patch-notes.158/';
const page_prefix = 'https://hypixel.net';

app.get('/patchnotes', (req, res) => {
    if (cacheTime + 60000 > Date.now()) {
        res.send(cache);
    } else {
        axios.get(source_page, {
            headers: {
                'User-Agent': 'PostmanRuntime/7.29.2'
            }
        }).then((response) => {
            const $ = cheerio.load(response.data);
            const patchNotes = [];
            $('.structItem-title').each((i, elem) => {
                patchNotes.push({
                    title: $(elem).text().trim(),
                    url: page_prefix + $(elem).children().attr('href')
                });
            });
            cache = patchNotes;
            cacheTime = Date.now();
            res.send(patchNotes);
        });
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));