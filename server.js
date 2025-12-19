require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PRODUCTS_FILE = "products.json";
const ORDERS_FILE = "orders.json";

// ---------- INIT FILES ----------
if (!fs.existsSync(PRODUCTS_FILE)) fs.writeFileSync(PRODUCTS_FILE, "[]");
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// ---------- MULTER ----------
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));

// ---------- HELPERS ----------
const loadProducts = () =>
  JSON.parse(fs.readFileSync(PRODUCTS_FILE));
const saveProducts = (p) =>
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(p, null, 2));

const loadOrders = () =>
  JSON.parse(fs.readFileSync(ORDERS_FILE));
const saveOrders = (o) =>
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(o, null, 2));

// ---------- ROUTES ----------

// PRODUCTS
app.get("/api/products", (req, res) => {
  res.json(loadProducts());
});

app.post("/api/add-product", upload.single("image"), (req, res) => {
  const products = loadProducts();
  const { name, price, unit } = req.body;

  if (!req.file)
    return res.status(400).json({ message: "Image required" });

  products.push({
    name,
    price: Number(price),
    unit,
    image: `/uploads/${req.file.filename}`,
  });

  saveProducts(products);
  res.json({ message: "✅ Product added" });
});

app.post("/api/products", (req, res) => {
  saveProducts(req.body.products);
  res.json({ message: "Saved" });
});

// ORDERS
app.get("/api/orders", (req, res) => {
  res.json(loadOrders());
});

app.post("/api/order", (req, res) => {
  const orders = loadOrders();
  orders.push({
    ...req.body,
    date: new Date().toLocaleString(),
  });
  saveOrders(orders);
  res.json({ message: "✅ Order placed" });
});

// ---------- START ----------
const PORT = 5000;
app.listen(PORT, () =>
  console.log("Server running on http://localhost:" + PORT)
);
