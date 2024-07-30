const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const db = require("./database");
const app = express();

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.static("public"));

app.post("/import-products", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    db.serialize(() => {
      db.run(
        "CREATE TABLE IF NOT EXISTS uploads (id INTEGER PRIMARY KEY, data TEXT)"
      );

      const stmt = db.prepare("INSERT INTO uploads (data) VALUES (?)");
      data.forEach((row) => {
        stmt.run(JSON.stringify(row));
      });
      stmt.finalize();
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Error processing file.");
  }
});

app.get("/products", (req, res) => {
  db.all("SELECT * FROM uploads", (err, rows) => {
    if (err) {
      return res.status(500).send("Error retrieving data.");
    }
    const data = rows.map((row) => JSON.parse(row.data));
    res.json(data);
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
