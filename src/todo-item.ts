export class TodoItem {
    id: number
    title: string
    content: string
    marked: boolean

    constructor()
    constructor(id: number, title: string, content: string, marked: boolean)
    constructor(id: number = 0, title: string = "", content: string = "", marked: boolean = false) {
        this.title = title;
        this.content = content;
        this.id = id;
        this.marked = marked;
    }

    static from(pojo: TodoItemPojo): TodoItem {
        const id = pojo.id;
        const title = pojo.title;
        const content = pojo.content;
        const marked = pojo.marked;
        const item = new TodoItem(id, title, content, marked);
        return item;
    }
}

export type SqlBoolean = 0 | 1;
export type TodoItemPojo = Pick<TodoItem, "title"|"content"|"id"|"marked">
export type SqlTodoItemPojo = Omit<TodoItemPojo, 'marked'> & { marked: 0 | 1 }
export type Sqled<T> = { 
    [Property in keyof T]: T[Property] extends boolean ? SqlBoolean : T[Property]
} 

export function toSqlPojo<T extends object>(item: T): Sqled<T> {
    let entries = Object.entries(item);
    let sqled: any = {};
    for (let [key, value] of entries) {
        if (typeof value === 'boolean') {
            sqled[key] = boolToSqlValue(value);
        } else {
            sqled[key] = value;
        }
    }
    return sqled
}

export function toJsPojo<T extends object>(item: Sqled<T>, boolKeys: (keyof T)[]): T {
    let entries = Object.entries(item);
    let jsObject: any = {};
    for (let [key, value] of entries) {
        if (boolKeys.includes(key as keyof T)) {
            jsObject[key] = sqlToBoolValue(value as SqlBoolean);
        } else {
            jsObject[key] = value;
        }
    }
    return jsObject
}

export function boolToSqlValue(bool: boolean) {
    return bool ? 1 : 0;
}

function sqlToBoolValue(bool: 0 | 1) {
    return bool === 1;
}

export const sampleTodo: NewTodoItem = { title: "todo", content: "this is todo content", marked: false }
export type NewTodoItem = Omit<TodoItemPojo, "id">