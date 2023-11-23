import { WebSocket, MessageEvent } from 'ws';
import { Client, ClientMessage, HandlerObject, Server, ServerMessage } from './ws-messages';
import { TodoDatabase } from './db';
import { websockets } from '.';
import { NewTodoItem, TodoItemPojo } from './todo-item';

export class TodoWebsocket {
    db: TodoDatabase;
    ws: WebSocket;

    constructor(db: TodoDatabase, ws: WebSocket) {
        this.db = db;
        this.ws = ws;
    }

    //return type for the exhaustiveness checking
    handleWsMessage(message: MessageEvent): boolean {
        let msg: ClientMessage = JSON.parse(message.data.toString())
        
        switch (msg.type) {
            case 'ws/add': return Handler.add(this, msg);
            case 'ws/delete': return Handler.delete(this, msg);
            case 'ws/update': return Handler.update(this, msg);
            case 'ws/mark': return Handler.mark(this, msg);
        }
    }

    send(message: ServerMessage) {
        return this.ws.send(JSON.stringify(message))
    }
}

export function sendAll(message: ServerMessage) {
    websockets.forEach(ws => ws.send(message))
}

const Handler: HandlerObject<typeof Client> = {
    add: (ws, msg) => {
        if (msg.todo) {
            if (msg.todo.content)
                if (typeof msg.todo.content !== 'string')
                    console.log(`add message is malformed, expected field 'todo.content' to be of type 'string'`)
                
        } else {
            console.log(`add message is malformed, expected field 'todo'`)
            return false;
        }

        let insertedTodo = ws.db.insert(msg.todo);
        sendAll(Server.added(insertedTodo))
        return true;
    },
    delete: (ws, msg) => {
        ws.db.delete(msg.todoId);
        sendAll(Server.deleted(msg.todoId))
        return true
    },
    update: (ws, msg) => {
        ws.db.update(msg.todo)
        sendAll(Server.updated(msg.todo))
        return true
    },
    mark: (ws, msg) => {
        ws.db.updateMark(msg.todoId, msg.state)
        sendAll(Server.marked(msg.todoId, msg.state))
        return true
    }
}