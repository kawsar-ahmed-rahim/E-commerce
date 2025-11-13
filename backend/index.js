const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Database connection
mongoose.connect(
  "mongodb+srv://kahmedrahim1512_db_user:qjM9NWRDRpmayrPD@cluster0.6eej6ih.mongodb.net/e-commerce"
);

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

// ------------------- Middleware -------------------

const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token"); // Use lowercase 'token'
  if (!token)
    return res
      .status(401)
      .json({ error: "Please authenticate using a valid token" });

  try {
    const data = jwt.verify(token, "secret_ecom");
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
      { cartData: userData.cartData }
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
      { cartData: userData.cartData }
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
    const token = jwt.sign({ user: { id: user.id } }, "secret_ecom");
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

    const token = jwt.sign({ user: { id: user.id } }, "secret_ecom");
    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ------------------- Start Server -------------------

app.listen(port, () => {
  console.log("Server running on port " + port);
});
