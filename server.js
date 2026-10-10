
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

/* ---------- Middleware ---------- */

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();

  console.log(
    `[${new Date().toISOString()}] --> ${req.method} ${req.originalUrl}`
  );

  res.on("finish", () => {
    console.log(
      `[${new Date().toISOString()}] <-- ${req.method} ${req.originalUrl} ${res.statusCode} (${Date.now() - start}ms)`
    );
  });

  next();
});

/* ---------- Serve frontend files ---------- */

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "Product-Configurator.html")
  );
});

app.get("/Product-Configurator.html", (req, res) => {
  res.sendFile(
    path.join(__dirname, "Product-Configurator.html")
  );
});

app.get("/Product-Configurator.css", (req, res) => {
  res.sendFile(
    path.join(__dirname, "Product-Configurator.css")
  );
});

app.get("/Product-Configurator.js", (req, res) => {
  res.sendFile(
    path.join(__dirname, "Product-Configurator.js")
  );
});

/* ---------- Product data ---------- */

const product = {
  id: 101,
  title: "AQUA Smart Water Bottle",
  price: 24.99,
  category: "Water Bottles",
  description:
    "A frosted, leak-proof bottle with hourly hydration markers and a carry handle.",
  thumbnail:
    "https://dummyjson.com/image/300x300/6d5efc/ffffff?text=AQUA",
  colors: ["sunset", "ocean", "mint"],
  sizes: ["1L", "1.5L", "2L"],
  variants: ["standard", "sport"]
};

/* ---------- API routes ---------- */

app.get("/api/product", (req, res) => {
  res.json(product);
});

app.post("/api/configurations", (req, res) => {
  const configuration = req.body;

  if (!configuration || !configuration.productName) {
    return res.status(400).json({
      success: false,
      message: "Invalid configuration: productName is required."
    });
  }

  console.log("Configuration received:");
  console.log(JSON.stringify(configuration, null, 2));

  res.status(201).json({
    success: true,
    message: "Configuration received successfully.",
    configuration,
    orderId: "AQUA-" + Date.now()
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AQUA backend is running."
  });
});

/* ---------- API 404 ---------- */

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

/* ---------- Error handling ---------- */

app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message:
      err.type === "entity.parse.failed"
        ? "Malformed JSON in request body."
        : err.message
  });
});

/* ---------- Start server ---------- */

app.listen(PORT, () => {
  console.log(`AQUA backend running at http://localhost:${PORT}`);
  console.log(`GET  http://localhost:${PORT}/api/product`);
  console.log(`POST http://localhost:${PORT}/api/configurations`);
  console.log(`App  http://localhost:${PORT}/`);
});
