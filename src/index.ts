import express from 'express';
import expressWs from 'express-ws';
import { TodoDatabase } from './db';
import { TodoWebsocket } from './ws';
import path from 'path';

const db = new TodoDatabase();
const expressWs_ = expressWs(express());
const app = expressWs_.app;
const port = 11037;

export const websockets: TodoWebsocket[] = []

app.ws('/ws', (ws, req) => {
    const todoWs = new TodoWebsocket(db, ws);
    
    websockets.push(todoWs);
    ws.onmessage = msg => todoWs.handleWsMessage(msg)

    ws.onclose = (_e => {
        const idx = websockets.findIndex(ws => ws === todoWs)
        websockets.splice(idx, 1)
    })
})

app.get('/ws/count', (req, res) => {
    res.send(`Active websocket connections: ${websockets.length}`)
})

app.get('/todos', (req, res) => {
    let result = JSON.stringify(db.all());
    res.send(result);
})

app.use(express.static('dist/assets', { index: "index.html"}))

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '/assets/index.html')))

app.listen(port, () => {
    console.log('listening')
})