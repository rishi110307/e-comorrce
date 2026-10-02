import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(",").map((origin) => origin.trim())
    : true,
}));
app.use(express.json({ limit: "1mb" }));

const sampleProducts = [
  ["Everyday Backpack", "Bags", "A practical backpack for school, work, and travel.", 1499, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"],
  ["Wireless Headphones", "Electronics", "Comfortable headphones for music and calls.", 2299, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
  ["Classic Wristwatch", "Accessories", "A clean everyday watch with a timeless design.", 1899, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"],
  ["Running Shoes", "Footwear", "Lightweight shoes for daily walks and running.", 2799, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"],
  ["Ceramic Coffee Mug", "Home", "A simple ceramic mug for your coffee or tea.", 399, "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800"],
  ["Desk Lamp", "Home", "A compact lamp for your study or work desk.", 999, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"],
];

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
      image_url TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      items JSONB NOT NULL,
      total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM products");
  if (rows[0].count === 0) {
    const validSamples = sampleProducts.filter((p) => !p[4].includes("光"));
    for (const p of validSamples) {
      await pool.query(
        "INSERT INTO products (name, category, description, price, image_url) VALUES ($1,$2,$3,$4,$5)",
        p
      );
    }
  }
}

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const result = await pool.query(
      `SELECT id, name, category, description, price::float AS price, image_url
       FROM products
       WHERE ($1 = '' OR name ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%')
         AND ($2 = '' OR category = $2)
       ORDER BY id`,
      [search, category]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Products error:", error);
    res.status(500).json({ error: "Could not load products." });
  }
});

app.post("/api/orders", async (req, res) => {
  const { customerName, email, address, items } = req.body || {};
  if (!customerName?.trim() || !email?.trim() || !address?.trim() ||
      !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Enter your name, email, address, and at least one item." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ids = items.map((item) => Number(item.productId));
    if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "One or more product IDs are invalid." });
    }
    const productsResult = await client.query(
      "SELECT id, name, price::float AS price FROM products WHERE id = ANY($1::int[])",
      [ids]
    );
    const byId = new Map(productsResult.rows.map((p) => [p.id, p]));
    let total = 0;
    const verifiedItems = [];
    for (const item of items) {
      const product = byId.get(Number(item.productId));
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "An item or quantity is invalid." });
      }
      total += product.price * quantity;
      verifiedItems.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity,
      });
    }
    const result = await client.query(
      `INSERT INTO orders (customer_name, email, address, items, total)
       VALUES ($1, $2, $3, $4::jsonb, $5)
       RETURNING id, total::float AS total, status, created_at`,
      [customerName.trim(), email.trim(), address.trim(), JSON.stringify(verifiedItems), total.toFixed(2)]
    );
    await client.query("COMMIT");
    res.status(201).json({ message: "Order placed successfully.", order: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Order error:", error);
    res.status(500).json({ error: "Could not place your order." });
  } finally {
    client.release();
  }
});

app.use((_req, res) => res.status(404).json({ error: "Route not found." }));

initializeDatabase()
  .then(() => {
    app.listen(port, () => console.log(`E-commerce API listening on port ${port}`));
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
