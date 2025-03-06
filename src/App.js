import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Signup from "./Signup";
import Login from "./Login";
import UserForm from "./UserForm";
import AdminDashboard from "./AdminDashboard";
import Navbar from "./Navbar";
import "./styles.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(sessionStorage.getItem("role") || ""); //Use sessionStorage
  const [authChecked, setAuthChecked] = useState(false); // Track auth status

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userRole = userSnap.data().role;
          setRole(userRole);
          sessionStorage.setItem("role", userRole); // Store role in sessionStorage
        }
      } else {
        setUser(null);
        setRole("");
        sessionStorage.removeItem("role"); // Clear role on logout
      }
      setAuthChecked(true); // Auth state checked
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      setUser(null);
      setRole("");
      sessionStorage.removeItem("role"); // Ensure role is cleared
    });
  };

  // Don't redirect until auth is checked
  if (!authChecked) {
    return <div>Loading...</div>; // Prevents flickering
  }

  return (
    <Router>
      <Navbar user={user} handleLogout={handleLogout} />
      <div className="page-container">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/user-form"
            element={user && role === "employee" ? <UserForm /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin-dashboard"
            element={user && role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />}
          />
          {/* Redirect based on role */}
          <Route path="/" element={user ? (role === "admin" ? <Navigate to="/admin-dashboard" /> : <Navigate to="/user-form" />) : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
