import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import logo from "./assets/logo-mindera.svg";

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  return (
    <div className="navbar">
      <img src={logo} alt="Mindera Logo" style={{ height: "60px" }} />
      <nav>
        {user ? (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/signup">Signup</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
