import sqlite, { Database } from "better-sqlite3";
import { NewTodoItem, Sqled, TodoItemPojo, boolToSqlValue, toJsPojo, toSqlPojo } from "./todo-item";

export class TodoDatabase {
    db: Database

    constructor() {
        this.db = sqlite("data.db");
        this.create();
    }

    create() {
        const sql = `CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL, marked INTEGER NOT NULL);`;
        this.db.prepare(sql).run();
    }

    insert(pojo: NewTodoItem): TodoItemPojo {
        const sqlPojo = toSqlPojo(pojo);
        const sql = `
            INSERT INTO todos (
                title, content, marked
            ) VALUES (?,?,?) RETURNING *;
        `


        let sqled = this.db
            .prepare(sql)
            .bind(sqlPojo.title, sqlPojo.content, sqlPojo.marked)
            .get() as Sqled<TodoItemPojo>

        return toJsPojo(sqled, ['marked'])
    }

    all(): TodoItemPojo[] {
        const sql = `SELECT * FROM todos;`
        let sqled = this.db.prepare(sql).all() as Sqled<TodoItemPojo>[];
        return sqled.map(sqlPojo => toJsPojo(sqlPojo, ['marked']))
    }

    update(jsPojo: TodoItemPojo) {
        const todo = toSqlPojo(jsPojo);
        const sql = `
            UPDATE todos
            SET title = ?, content = ?, marked = ?
            WHERE id = ?;
        `
        this.db
            .prepare(sql)
            .bind(todo.title, todo.content, todo.marked, todo.id)
            .run();
    }

    updateMark(id: number, mark: boolean) {
        const sqlMark = boolToSqlValue(mark);
        const sql = `
            UPDATE todos
            SET marked = ?
            WHERE id = ?;
        `
        this.db
            .prepare(sql)
            .bind(sqlMark, id)
            .run();
    }

    delete(todoId: number) {
        const sql = `DELETE FROM todos WHERE id = ?;`

        this.db.prepare(sql)
            .bind(todoId)
            .run();
    }
}

