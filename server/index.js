const express = require('express');
const ytdl = require('@distube/ytdl-core');
const app = express();
const cors = require('cors');
const fs = require('fs');
require('dotenv').config()
const port = process.env.PORT || 3000;

app.use(cors());
const agent = ytdl.createAgent(JSON.parse(fs.readFileSync('cookies.json', 'utf8')))

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/get', async (req, res) => {
    const url = req.query.url;
    try {
        if (!ytdl.validateURL(url)) {
            return res.send('Invalid URL');
        }
        const info = await ytdl.getBasicInfo(url, { agent });
        res.send({ data: info, status: 'ok' });
    } catch (error) {
        res.send({ data: error, status: 'error' });
    }
});
app.get('/download', async (req, res) => {
    const url = req.query.url;
    if (!ytdl.validateURL(url)) {
        return res.status(400).send('Invalid URL');
    }
    try {
        const info = await ytdl.getInfo(url, { agent });
        const title = info.videoDetails.title;
        console.log(info.videoDetails.title);
        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        ytdl(url, {
            format: 'mp4',
            quality: 'highest',
            filter: format => format.container === 'mp4' && format.hasAudio && format.hasVideo
        }).pipe(res);
    } catch (error) {
        res.status(500).send({ data: error, status: 'error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

