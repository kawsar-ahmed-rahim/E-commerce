const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors({
  origin: [
    "https://e-commerce-ojsr.vercel.app",
    "https://e-commerce-pbgk.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
  ],
}));

// Database connection
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
mongoose.connect(process.env.MONGO_URI);

// ------------------- Models -------------------

const Product = mongoose.model("Product", {
  id: Number,
  name: String,
  image: String,
  category: String,
  new_price: Number,
  old_price: Number,
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});

const Users = mongoose.model("Users", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: Object,
  date: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", {
  userId: String,
  items: [
    { productId: Number, name: String, price: Number, quantity: Number },
  ],
  total: Number,
  shipping: { name: String, phone: String, address: String, city: String },
  paymentMethod: { type: String, default: "cod" },
  status: { type: String, default: "pending" },
  date: { type: Date, default: Date.now },
});

// ------------------- Middleware -------------------

const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token"); // Use lowercase 'token'
  if (!token)
    return res
      .status(401)
      .json({ error: "Please authenticate using a valid token" });

  try {
   const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ------------------- Cart Routes -------------------

// Add to cart
app.post("/addtocart", fetchUser, async (req, res) => {
  const itemId = req.body.itemId;
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    if (!userData.cartData) userData.cartData = {};
    userData.cartData[itemId] = (userData.cartData[itemId] || 0) + 1;

    await Users.findOneAndUpdate(
      { _id: req.user.id },
      { cartData: userData.cartData },
    );
    res.json({ success: true, cartData: userData.cartData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
});

// Remove from cart
app.post("/removefromcart", fetchUser, async (req, res) => {
  const itemId = req.body.itemId;
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    if (!userData.cartData) userData.cartData = {};
    if (userData.cartData[itemId] > 0) userData.cartData[itemId] -= 1;

    await Users.findOneAndUpdate(
      { _id: req.user.id },
      { cartData: userData.cartData },
    );
    res.json({ success: true, cartData: userData.cartData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
});

// Get cart
app.post("/getcart", fetchUser, async (req, res) => {
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// ------------------- Image Upload (Cloudinary) -------------------

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Keep the file in memory instead of saving it to disk
const upload = multer({ storage: multer.memoryStorage() });

// Upload endpoint (field name must be "product")
app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, error: "No file uploaded" });
  }

  const stream = cloudinary.uploader.upload_stream(
    { folder: "shopper" },
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: 0, error: "Upload failed" });
      }
      res.json({ success: 1, image_url: result.secure_url });
    }
  );
  stream.end(req.file.buffer);
});
// ------------------- Products Routes -------------------

app.get("/allproducts", async (req, res) => {
  try {
    let products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/addproduct", async (req, res) => {
  try {
    let products = await Product.find({});
    let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const product = new Product({
      id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// New collections (latest 8 products)
app.get("/newcollections", async (req, res) => {
  try {
    let products = await Product.find({});
    res.json(products.slice(-8));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch new collections" });
  }
});

// Popular in women (first 4 products in the women category)
app.get("/popularinwomen", async (req, res) => {
  try {
    let products = await Product.find({ category: "women" });
    res.json(products.slice(0, 4));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch popular products" });
  }
});

app.post("/removeproduct", async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to remove product" });
  }
});

// ------------------- User Routes -------------------

app.post("/signup", async (req, res) => {
  try {
    let existingUser = await Users.findOne({ email: req.body.email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, error: "User already exists" });

    const cart = {};
    for (let i = 0; i < 300; i++) cart[i] = 0;

    const user = new Users({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
      cartData: cart,
    });

    await user.save();
    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    let user = await Users.findOne({ email: req.body.email });
    if (!user) return res.json({ success: false, error: "Wrong Email Id" });

    if (req.body.password !== user.password)
      return res.json({ success: false, error: "Wrong Password" });

    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});
// ------------------- Order Routes -------------------

app.post("/placeorder", fetchUser, async (req, res) => {
  try {
    const { shipping, paymentMethod } = req.body;
    if (!shipping?.name || !shipping?.phone || !shipping?.address || !shipping?.city) {
      return res
        .status(400)
        .json({ success: false, error: "Please fill in all shipping fields" });
    }

    const user = await Users.findById(req.user.id);
    const cart = user.cartData || {};

    // Prices come from the database, never from the client
    const products = await Product.find({});
    const items = products
      .filter((p) => cart[p.id] > 0)
      .map((p) => ({
        productId: p.id,
        name: p.name,
        price: p.new_price,
        quantity: cart[p.id],
      }));

    if (items.length === 0) {
      return res.status(400).json({ success: false, error: "Cart is empty" });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await new Order({
      userId: req.user.id,
      items,
      total,
      shipping,
      paymentMethod: paymentMethod || "cod",
    }).save();

    // Empty the cart
    const emptyCart = {};
    for (let i = 0; i < 300; i++) emptyCart[i] = 0;
    await Users.findByIdAndUpdate(req.user.id, { cartData: emptyCart });

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to place order" });
  }
});

// ------------------- Start Server -------------------

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log("Server running on port " + port);
  });
}

module.exports = app;
