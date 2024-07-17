const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 4055;

app.use(bodyParser.urlencoded({ extended: true }));

const mongoUrl = "mongodb://localhost:27017";
const dbName = "emydatabase";
let db;

// Connect to MongoDB
MongoClient.connect(mongoUrl)
  .then((client) => {
    db = client.db(dbName);
    console.log(`Connected to MongoDB: ${dbName}`);
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Route for inserting data
app.post("/insert", async (req, res) => {
  const { name, description } = req.body;
  if (!db) {
    res.status(500).send("Database not initialized");
    return;
  }
  try {
    await db.collection("items").insertOne({ name, description });
    res.redirect("/");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).send("Failed to insert data");
  }
});

// Route for deleting data
app.post("/delete", async (req, res) => {
  const { name } = req.body;
  if (!db) {
    res.status(500).send("Database not initialized");
    return;
  }
  try {
    await db.collection("items").deleteOne({ name });
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting data:", err);
    res.status(500).send("Failed to delete data");
  }
});

// Route for updating data
app.post("/update", async (req, res) => {
  const { name, newName, newDescription } = req.body;
  if (!db) {
    res.status(500).send("Database not initialized");
    return;
  }
  try {
    await db.collection("items").updateOne(
      { name },
      { $set: { name: newName, description: newDescription } }
    );
    res.redirect("/");
  } catch (err) {
    console.error("Error updating data:", err);
    res.status(500).send("Failed to update data");
  }
});

// Route for searching data
app.get("/search", async (req, res) => {
  const { name } = req.query;
  if (!db) {
    res.status(500).send("Database not initialized");
    return;
  }
  try {
    const items = await db.collection("items").find({ name }).toArray();
    let tableContent =
      "<h1>Search Results</h1><table border='1'><tr><th>Name</th><th>Description</th></tr>";
    tableContent += items
      .map((item) => `<tr><td>${item.name}</td><td>${item.description}</td></tr>`)
      .join("");
    tableContent += "</table><a href='/'>Back to form</a>";
    res.send(tableContent);
  } catch (err) {
    console.error("Error searching data:", err);
    res.status(500).send("Failed to search data");
  }
});

// Route for generating a report
app.get("/report", async (req, res) => {
  try {
    const items = await db.collection("items").find().toArray();
    let tableContent =
      "<h1>Report</h1><table border='1'><tr><th>Name</th><th>Description</th></tr>";
    tableContent += items
      .map((item) => `<tr><td>${item.name}</td><td>${item.description}</td></tr>`)
      .join("");
    tableContent += "</table><a href='/'>Back to form</a>";
    res.send(tableContent);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Failed to fetch data");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
