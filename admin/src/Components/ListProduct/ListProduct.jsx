import React, { useEffect, useState } from "react";
import "./Listproduct.css";
import cross_icon from "../../assets/Admin_Assets/cross_icon.png";

const API = import.meta.env.VITE_API_URL;

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);

  const fetchInfo = async () => {
    try {
      const res = await fetch(`${API}/allproducts`);
      const data = await res.json();
      setAllProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_product = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const res = await fetch(`${API}/removeproduct`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!data.success) {
        alert("Failed to remove product");
        return;
      }
      await fetchInfo();
    } catch (err) {
      console.error(err);
      alert("Cannot reach the server. Is the backend running?");
    }
  };

  return (
    <div className="list-product">
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product) => {
          return (
            <React.Fragment key={product._id}>
              <div className="listproduct-format-main listproduct-format">
                <img
                  src={product.image}
                  alt=""
                  className="listproduct-product-icon"
                />
                <p>{product.name}</p>
                <p>${product.old_price}</p>
                <p>${product.new_price}</p>
                <p>{product.category}</p>
                <img
                  onClick={() => remove_product(product.id)}
                  src={cross_icon}
                  className="listproduct-remove-icon"
                  alt="Remove"
                />
              </div>
              <hr />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ListProduct;