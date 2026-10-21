import { useState, useEffect } from "react";
import "./Popular.css";
import { Item } from "../Item/Item";

const API = process.env.REACT_APP_API_URL;

export const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(() => {
    fetch(`${API}/popularinwomen`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) setPopularProducts(data);
      })
      .catch((err) => console.error("Failed to fetch popular products:", err));
  }, []);

  return (
    <div className="popular">
      <h1>POPULAR IN WOMEN</h1>
      <hr />
      <div className="popular-item">
        {popularProducts.map((item) => {
          return (
            <Item
              key={item._id}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          );
        })}
      </div>
    </div>
  );
};