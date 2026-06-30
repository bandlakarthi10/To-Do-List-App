import Dexie from "dexie";

export const db = new Dexie("TodoAppDB");

db.version(1).stores({
  todos: "++id, text, completed, createdAt, priority",
});
