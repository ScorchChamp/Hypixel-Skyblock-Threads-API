const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

let cache = {};
let pageCaches = {};
let cacheTime = 0;

const source_page = 'https://hypixel.net/forums/skyblock-patch-notes.158/';
const page_prefix = 'https://hypixel.net';
const baseAPI = 'https://hypixelpatchnotes.scorchchamp.com/patchnotes/'

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
            const patchNotes = {};
            $('.structItem-title').each((i, elem) => {
                const href = $(elem).children().attr('href');
                const id = href.replace('/threads/', '').replace('/', '');
                const title = $(elem).children().text();
                const detailed = `${baseAPI}${id}`
                patchNotes[id] = {
                    title: title,
                    url: page_prefix + href,
                    details: detailed
                };
            });
            cache = patchNotes;
            cacheTime = Date.now();
            res.send(patchNotes);
        });
    }
});

app.get('/patchnotes/:id', (req, res) => {
    const id = req.params.id;
    if (pageCaches[id] && pageCaches[id].time + 60000 > Date.now()) {
        res.send(pageCaches[id].data);
    } else {
        axios.get(page_prefix + '/threads/' + id, {
            headers: {
                'User-Agent': 'PostmanRuntime/7.29.2'
            }
        }).then((response) => {
            const $ = cheerio.load(response.data);
            const patchNote = {};
            patchNote.title = $('.p-title-value').text();
            patchNote.date = $('.u-dt').attr('data-datestring');
            patchNote.author = $('.username').first().text();
            patchNote.content = $('.bbWrapper').html().replace(/<[^>]*>?/gm, '').replace(/\n/g, ' ').replace(/\t/g, '').replace(/{[^}]*}?/gm, '');
            pageCaches[id] = {
                data: patchNote,
                time: Date.now()
            };
            res.send(patchNote);
        });
    }
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`));