import "./Checkout.css";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";

export const Checkout = () => {
  const { getTotalCartAmount, all_product, cartItems } =
    useContext(ShopContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState(null);

  const cartProducts = all_product.filter((p) => cartItems[p.id] > 0);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("auth-token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/placeorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ shipping: form, paymentMethod: "cod" }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderId(data.orderId);
      } else {
        setError(data.error || "Could not place order");
      }
    } catch (err) {
      setError("Cannot reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // Order confirmation screen
  if (orderId) {
    return (
      <div className="checkout checkout-success">
        <h1>Order placed! 🎉</h1>
        <p>Your order ID is</p>
        <p className="checkout-orderid">{orderId}</p>
        <p>Payment: Cash on Delivery</p>
        <button onClick={() => (window.location.href = "/")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  // Empty cart guard
  if (cartProducts.length === 0) {
    return (
      <div className="checkout checkout-success">
        <h1>Your cart is empty</h1>
        <button onClick={() => navigate("/")}>Go to Shop</button>
      </div>
    );
  }

  return (
    <div className="checkout">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={placeOrder}>
          <h2>Shipping Details</h2>
          <input
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="phone"
            type="tel"
            placeholder="Phone number"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <textarea
            name="address"
            placeholder="Full address"
            rows="3"
            value={form.address}
            onChange={handleChange}
            required
          />
          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            required
          />

          <h2>Payment</h2>
          <label className="checkout-payment">
            <input type="radio" checked readOnly />
            Cash on Delivery
          </label>

          {error && <p className="checkout-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "PLACING ORDER..." : "PLACE ORDER"}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Order Summary</h2>
          {cartProducts.map((p) => (
            <div className="checkout-summary-item" key={p.id}>
              <img src={p.image} alt={p.name} />
              <div>
                <p>{p.name}</p>
                <p>
                  {cartItems[p.id]} × ${p.new_price}
                </p>
              </div>
              <p>${p.new_price * cartItems[p.id]}</p>
            </div>
          ))}
          <hr />
          <div className="checkout-summary-row">
            <p>Shipping</p>
            <p>Free</p>
          </div>
          <div className="checkout-summary-row checkout-total">
            <h3>Total</h3>
            <h3>${getTotalCartAmount()}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};