import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

// Initialize cart with product IDs
const getDefaultCart = (all_product) => {
  let cart = {};
  if (Array.isArray(all_product)) {
    all_product.forEach((product) => {
      cart[product.id] = 0;
    });
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:4000/allproducts");
        const data = await res.json();
        setAll_Product(data);
        setCartItems(getDefaultCart(data));
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    const fetchCart = async () => {
      if (!localStorage.getItem("auth-token")) return;
      try {
        const res = await fetch("http://localhost:4000/getcart", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("auth-token"),
          },
          body: JSON.stringify({}),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to get cart:", text);
          return;
        }

        const data = await res.json();
        setCartItems(data);
      } catch (err) {
        console.error("Network error while fetching cart:", err);
      }
    };

    fetchProducts();
    fetchCart();
  }, []);

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));

    if (!localStorage.getItem("auth-token")) return;

    try {
      const res = await fetch("http://localhost:4000/addtocart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
        body: JSON.stringify({ itemId }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to add to cart:", text);
        return;
      }

      const data = await res.json();
      console.log("Added to cart:", data);
    } catch (err) {
      console.error("Network error while adding to cart:", err);
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }));

    if (!localStorage.getItem("auth-token")) return;

    try {
      const res = await fetch("http://localhost:4000/removefromcart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
        body: JSON.stringify({ itemId }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to remove from cart:", text);
        return;
      }

      const data = await res.json();
      console.log("Removed from cart:", data);
    } catch (err) {
      console.error("Network error while removing from cart:", err);
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = all_product.find(
          (product) => product.id === Number(item)
        );
        if (itemInfo) totalAmount += itemInfo.new_price * cartItems[item];
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) totalItem += cartItems[item];
    }
    return totalItem;
  };

  const contextValue = {
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
