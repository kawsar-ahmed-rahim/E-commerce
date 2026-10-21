# 🛍️ SHOPPER - MERN E-Commerce Website

A full-stack e-commerce website built with the MERN stack, with a separate **Customer Storefront** and **Admin Panel**. Customers can browse products by category, manage a cart, and check out, while admins can add, delete, and list products.

---

## 🚀 Features

### 🛒 Customer Storefront

* 🔐 User signup, login, and logout (JWT authentication)
* 🏠 Home page with **New Collections** and **Popular in Women** sections
* 👕 Separate **Men**, **Women**, and **Kids** category pages
* 🔎 Product detail page
* ➕ Add items to the cart
* ➖ Remove items from the cart
* 🧾 Cart totals with a **Checkout** page (shipping details + order summary)
* 💵 Place an order with **Cash on Delivery**
* 🗄️ Cart saved per user in the database, so it persists between sessions

### 👨‍💼 Admin Panel

* ➕ Add new products with an image upload
* 🗑️ Delete products
* 📋 View the list of all products

---

## 🛠️ Built With

* **Frontend:** React, React Router, CSS
* **Admin Panel:** React, CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB with Mongoose
* **Authentication:** JSON Web Tokens (JWT)
* **File Uploads:** Multer

---

## 📂 Project Structure

```text
E-commerce/
│
├── frontend/               # Customer storefront
│   └── src/
│       ├── Components/     # Navbar, Item, CartItems, Checkout, etc.
│       ├── Context/        # ShopContext.jsx (global cart and product state)
│       └── Pages/
│
├── admin/                  # Admin panel
│   └── src/
│       ├── Components/     # AddProduct, ListProduct, Sidebar, etc.
│       └── Pages/
│
├── backend/                # Express API
│   ├── upload/images/      # Uploaded product images
│   └── index.js            # Models, routes, and server
│
└── README.md
```

---

## ⚙️ How It Works

1. An admin uploads a product image and adds a product from the Admin Panel.
2. The image is stored on the server with Multer and the product is saved in MongoDB.
3. Customers browse the products on the Home, Men, Women, and Kids pages.
4. A logged-in customer adds items to the cart, and the cart is saved to their account.
5. On the cart page, the customer reviews the totals and proceeds to checkout.
6. At checkout, the customer enters shipping details and places the order. The server calculates the total from the database prices and saves the order.
7. After the order is placed, the cart is emptied.

---

## 🔌 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/signup` | Public | Create a new user account |
| POST | `/login` | Public | Log in and receive a JWT |
| GET | `/allproducts` | Public | Get all products |
| GET | `/newcollections` | Public | Get the latest products |
| GET | `/popularinwomen` | Public | Get popular products in the women category |
| POST | `/addproduct` | Admin panel | Add a new product |
| POST | `/removeproduct` | Admin panel | Delete a product |
| POST | `/upload` | Admin panel | Upload a product image |
| POST | `/addtocart` | User | Add an item to the cart |
| POST | `/removefromcart` | User | Remove an item from the cart |
| POST | `/getcart` | User | Get the logged-in user's cart |
| POST | `/placeorder` | User | Place an order (Cash on Delivery) |

User routes require an `auth-token` header containing the JWT.

---

## 🔑 Setup & Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd e-commerce

# Backend
cd backend
npm install
node index.js

# Frontend (new terminal)
cd frontend
npm install
npm start

# Admin Panel (new terminal)
cd admin
npm install
npm run dev
```

Create a `.env` file in `backend/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

> Never commit your `.env` file. Add it to `.gitignore`.

Default ports:

* Backend: `http://localhost:4000`
* Frontend: `http://localhost:3000`
* Admin Panel: `http://localhost:5173`

---

## 💡 Challenges Faced

The most time-consuming part of the project was connecting the three parts (storefront, admin panel, and API) and debugging the issues that appeared between them, such as 404 errors, broken product images, and the database connection.

---

### Solution

* Fixed a **404 on API routes** by comparing the exact request URL with the registered Express route, and by fully restarting the server so it loaded the new code.
* Fixed **broken product images** by serving the upload folder with `express.static` and making sure saved image URLs matched the files in `upload/images`.
* Fixed a **MongoDB Atlas connection failure** (`querySrv ECONNREFUSED`) caused by DNS resolution, by setting reliable DNS servers for Node.
* Fixed React warnings by wrapping handlers like `onClick={() => ...}` so they run on click instead of during render, and by moving hooks such as `useNavigate` inside the component.
* Calculated order totals on the server from database prices, so the client cannot change what it pays.
* [Add how the cart state stays in sync between ShopContext and the database]

---

## 📚 What I Learned

* Building a full-stack MERN application with a separate storefront and admin panel
* Designing REST APIs with Express and modelling data with Mongoose
* JWT authentication and protecting routes with middleware
* Handling image uploads with Multer
* Managing global state with React Context
* Debugging across the frontend, backend, and database
* [Add more]

---

## 🔮 Future Improvements

* 🔒 Hash passwords with bcrypt
* 🛡️ Add admin authentication and protect the add and delete product routes
* 💳 Online payment gateway
* 📦 Order history page for users and order management for admins
* ✏️ Edit products from the admin panel
* 🔍 Product search and sorting
* 📱 Improved mobile responsiveness

---

## 🔗 Live Demo

👉 https://e-commerce-ojsr.vercel.app

 ##  Admin panel: https://e-commerce-pbgk.vercel.app

---

## 👨‍💻 Author

**Rahim**

If you found this project helpful or interesting, feel free to ⭐ the repository and share your feedback. Contributions, suggestions, and improvements are always welcome!
