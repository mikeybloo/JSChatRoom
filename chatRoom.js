//Express.js stuff:
const URL = require('url').URL;
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, 'Database', 'database.db');
const db = new sqlite3.Database(dbPath);

//Websocket for constant connection to handle messages:
const ws = require('ws');
const wsserver = new ws.Server({ port: 4001 });
const clients = new Map();

wsserver.on('connection', (ws) => {
    console.log('Recieved connection!');
    clients.set(ws, setId());

    ws.on('message', (message) => {
        const messageString = JSON.parse(message);
        console.log(`\t Message recieved! Message content: ${messageString} from user ${clients.get(ws)}`);

        if(/^GIF\(.+\)$/.test(messageString)){
            var match = /^GIF\(.+\)$/.test(messageString);
            createGIFMessage(clients.get(ws), messageString);
        } else {
            createMessage(clients.get(ws), messageString);
        }
    });
});

wsserver.on('close', () => {
    console.log('Connection terminated');
});

app.use(express.static(path.join(__dirname, 'Webpage')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Webpage', 'index.html'));
});

server.listen(3000, () => {
    console.log('listening on port 3000');
});

function setId(){
    return Math.floor(100000 + Math.random() * 900000);
}

function createMessage(ws, message){
    sendToClients(ws, message, "string", "");
}

function createGIFMessage(ws, URLMessage){
    try{
        parsed = parseCommand(URLMessage);
        urlObj = new URL(parsed);
        if(urlObj.hostname != "media1.tenor.com"){
            sendToClients(ws, "", "URL", "Invalid URL");
        } else {
            sendToClients(ws, parsed, "URL", "");
        }

    } catch (e){
        if(e.message == "Invalid URL"){
            sendToClients(ws, "", "URL", "Not a URL");
        }
    }
}

function parseCommand(message){
    let newMessage = "";
    for(let i = 0; i < message.length; i++){
        if(message[i] == "("){
            newMessage = message.substring(i + 1, message.length - 1);
            return newMessage;
        }
    }
}

function sendToClients(ws, message, type, error){
    outGoingMessage = new MessageOutback( ws, message, type, error );

    [...clients.keys()].forEach((client) => {
        client.send(JSON.stringify(outGoingMessage));
    });
}

class MessageOutback {
    constructor(senderId, content, type, error){
        this.senderId = senderId;
        this.content = content;
        this.type = type;
        this.error = error;
    }
}