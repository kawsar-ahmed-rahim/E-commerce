import { useState } from "react";
import "./CSS/LoginSignup.css";

const API = process.env.REACT_APP_API_URL;

function LoginSignup() {
  const [state, setState] = useState("Login");
  const [loading, setLoading] = useState(false);
  const [formData, setFormdata] = useState({
    username: "",
    password: "",
    email: "",
  });

  const changeHandler = (e) => {
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  };

  // Shared by login and signup
  const authenticate = async (endpoint) => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/${endpoint}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const responseData = await response.json();

      if (responseData.success) {
        localStorage.setItem("auth-token", responseData.token);
        window.location.replace("/");
      } else {
        alert(responseData.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Cannot reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const login = () => authenticate("login");
  const signup = () => authenticate("signup");

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state === "Sign Up" ? (
            <input
              name="username"
              value={formData.username}
              onChange={changeHandler}
              type="text"
              placeholder="Your Name"
            />
          ) : null}

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={changeHandler}
            placeholder="Email Address"
          />

          <input
            name="password"
            value={formData.password}
            onChange={changeHandler}
            type="password"
            placeholder="Password"
          />
        </div>
        <button
          disabled={loading}
          onClick={() => {
            state === "Login" ? login() : signup();
          }}
        >
          {loading ? "Please wait..." : "Continue"}
        </button>

        {state === "Sign Up" ? (
          <p className="loginsignup-login">
            Already have an account?{" "}
            <span onClick={() => setState("Login")}>Login here</span>
          </p>
        ) : (
          <p className="loginsignup-login">
            Create an account?{" "}
            <span onClick={() => setState("Sign Up")}>Click here</span>
          </p>
        )}

        <div className="loginsignup-agree">
          <input type="checkbox" name="" id="" />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginSignup;