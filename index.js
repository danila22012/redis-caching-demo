require('dotenv').config()
const express = require('express')
const fetch = require('node-fetch')
const http = require('http')
const redis = require('redis')
const path = require('path')

const app = express()
const server = http.createServer(app)
const client = redis.createClient(process.env.REDIS_PORT)

app.use(express.static(__dirname + '/public'));
function setResponse(username, repos) {

    return `<h1>Reload page and check your load time at devTools</h1>
    <h3>${username} has repos:${repos}</h3>
    `   
}

async function getRepos(req, res, next) {
    try {
        console.log('fetching data');

        const { username } = req.params

        const response = await fetch(`https://api.github.com/users/${username}`);

        const data = await response.json()

        const repos = data.public_repos
        // / set data to redis
        client.setex(username, 3500, repos || 'not given');

        res.send(setResponse(username, repos))
    } catch (err) {
        console.error(err)
        res.status(500)
    }
}

function cacheMiddleware(req, res, next) {
    const { username } = req.params

    client.get(username, (err, data) => {
        if (err) throw err
        if (data !== null) {
            res.send(setResponse(username, data))
        } else next()
    })
}
app.get('/repos/:username', cacheMiddleware, getRepos)

app.get('/', (req, res) => {
    console.log('get test');
    res.sendFile(path.join(__dirname, '/public', 'index.html'))
})

server.listen(process.env.SERVER_PORT, () => {
    console.log(`server has benn started on ${process.env.SERVER_PORT}`);
})