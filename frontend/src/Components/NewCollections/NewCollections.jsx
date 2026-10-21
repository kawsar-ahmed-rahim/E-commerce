import { useState, useEffect } from "react";
import "./NewCollections.css";
import { Item } from "../Item/Item";

const API = process.env.REACT_APP_API_URL;

export const NewCollections = () => {
  const [new_collection, setNew_collection] = useState([]);

  useEffect(() => {
    fetch(`${API}/newcollections`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) setNew_collection(data);
      })
      .catch((err) => console.error("Failed to fetch new collections:", err));
  }, []);

  return (
    <div className="new-collections">
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="collections">
        {new_collection.map((item) => {
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