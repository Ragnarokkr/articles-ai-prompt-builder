type ObjectToMap<T extends Record<string, unknown>> = Map<keyof T, T[keyof T]>;
type DatabaseFieldsSet<T> = keyof T;

class Database<T extends Record<string, unknown>> {
  #dbName: string | null = null;
  #db: ObjectToMap<T> | undefined = undefined;

  constructor(dbName: string, model: T) {
    if (dbName.length == 0 || model === undefined) {
      throw new Error("a database name and a initalization model are required.");
    }

    try {
      const data = localStorage.getItem(dbName);
      this.#dbName = dbName;
      if (!data) {
        this.#db = new Map<keyof T, T[keyof T]>(Object.entries(model) as [keyof T, T[keyof T]][]);
        this.#updateStorage();
      } else {
        const json = JSON.parse(data);
        this.#db = new Map<keyof T, T[keyof T]>(Object.entries(json) as [keyof T, T[keyof T]][]);
      }
    } catch (err) {
      console.error(`unable to open or initialize the database ${dbName} with model ${model}: ${err}`);
    }
  }

  #updateStorage() {
    if (!this.#dbName || !this.#db) return;

    try {
      localStorage.setItem(this.#dbName, JSON.stringify(Object.fromEntries(this.#db.entries())));
    } catch (err) {
      console.error(`unable to update the database ${this.#dbName}: ${err}`);
    }
  }

  update(fieldName: DatabaseFieldsSet<T>, value: T[keyof T]) {
    if (this.#db?.has(fieldName)) {
      this.#db.set(fieldName, value);
      this.#updateStorage();
    }
  }

  query(fieldName: DatabaseFieldsSet<T>): T[keyof T] | undefined {
    return this.#db?.get(fieldName);
  }
}

export default Database;
