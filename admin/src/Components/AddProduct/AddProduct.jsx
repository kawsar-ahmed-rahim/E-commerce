import { useState } from "react";
import "./AddProduct.css";
import upload_area from "../../assets/Admin_Assets/upload_area.svg";

const API = import.meta.env.VITE_API_URL;

const AddProduct = () => {
  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "women",
    new_price: "",
    old_price: "",
  });

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const Add_Product = async () => {
    if (!image) {
      alert("Please choose a product image");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload the image
      const formData = new FormData();
      formData.append("product", image);

      const uploadResp = await fetch(`${API}/upload`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const responseData = await uploadResp.json();

      if (!responseData.success) {
        alert("Image upload failed");
        return;
      }

      // 2. Save the product with the returned image URL
      const product = { ...productDetails, image: responseData.image_url };

      const addResp = await fetch(`${API}/addproduct`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });
      const data = await addResp.json();

      if (data.success) {
        alert("Product Added");
        setProductDetails({
          name: "",
          image: "",
          category: "women",
          new_price: "",
          old_price: "",
        });
        setImage(false);
      } else {
        alert("Failed to add product");
      }
    } catch (err) {
      console.error(err);
      alert("Cannot reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product">
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
          placeholder="Type here"
        />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input
            value={productDetails.old_price}
            onChange={changeHandler}
            type="text"
            name="old_price"
            placeholder="Type here"
          />
        </div>
      </div>

      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input
            value={productDetails.new_price}
            onChange={changeHandler}
            type="text"
            name="new_price"
            placeholder="Type here"
          />
        </div>
      </div>

      <div className="addproduct-itemfield">
        <p>Product category</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className="add-product-selector"
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>

      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            alt=""
            className="addproduct-thumnail-img"
          />
        </label>
        <input
          onChange={imageHandler}
          type="file"
          name="image"
          id="file-input"
          accept="image/*"
          hidden
        />
      </div>

      <button
        onClick={Add_Product}
        disabled={loading}
        className="addproduct-btn"
      >
        {loading ? "ADDING..." : "ADD"}
      </button>
    </div>
  );
};

export default AddProduct;