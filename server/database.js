const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(":memory:");

db.serialize(() => {
  db.run(
    "CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL)"
  );
});

module.exports = db;
