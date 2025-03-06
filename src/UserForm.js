import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import "./UserForm.css";

const UserForm = () => {
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
  
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    age: "",
    address: "",
    gender: "",
    phoneNumber: "",
    email: user?.email || "",
    aadharNumber: "",
    panNumber: "",
    fileBase64: "",
    status: "", // Default empty
    rejectReason: "", 
    submitted: false, 
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setFormData(userDoc.data()); 
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, [user, db]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fileBase64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      // alert("User not logged in");
      return;
    }
    try {
      await setDoc(doc(db, "users", user.uid), { ...formData, status: "pending", submitted: true, rejectReason: "" }, { merge: true });
      setFormData((prev) => ({ ...prev, submitted: true, status: "pending", rejectReason: "" })); // Reset rejection reason after resubmission
      // alert("Form submitted successfully");
    } catch (error) {
      console.error("Error submitting form:", error);
      // alert("Error submitting form");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="user-form">
      <h2>User Form</h2>
    
      {!formData.submitted ? (
        <p className="new-user-message">📝 Please enter your details.</p>
      ) : formData.status === "approved" ? (
        <p className="approved-message">🎉 Congratulations! Your documents are verified.</p>
      ) : formData.status === "rejected" ? (
        <div className="rejected-message">
          ❌ Your documents are rejected.
          <br />
          <strong>Reason:</strong> {formData.rejectReason || "No reason provided"}
          <br />
          Please fill the form again.
        </div>
      ) : (
        <p className="pending-message">⏳ Your documents are under review.</p>
      )}

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" disabled={formData.status === "approved"} required />
        <input type="date" name="dob" value={formData.dob} onChange={handleChange} disabled={formData.status === "approved"} required />
        <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" disabled={formData.status === "approved"} required />
        <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" disabled={formData.status === "approved"} required />
        <select name="gender" value={formData.gender} onChange={handleChange} disabled={formData.status === "approved"} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Phone Number" disabled={formData.status === "approved"} required />
        <input type="email" name="email" value={formData.email} disabled required />
        <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} placeholder="Aadhar Number" disabled={formData.status === "approved"} required />
        <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="PAN Number" disabled={formData.status === "approved"} required />
        <input type="file" onChange={handleFileUpload} accept="application/pdf" disabled={formData.status === "approved"} required={!formData.fileBase64} />
        
        {formData.fileBase64 && (() => {
          const byteCharacters = atob(formData.fileBase64.split(",")[1]);
          const byteNumbers = new Array(byteCharacters.length)
            .fill(null)
            .map((_, i) => byteCharacters.charCodeAt(i));
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/pdf" });

          // Create a temporary URL for the Blob
          const blobUrl = URL.createObjectURL(blob);

          return (
            <a href={blobUrl} target="_blank" rel="noopener noreferrer">
              View Uploaded File
            </a>
          );
        })()}

        {formData.status !== "approved" && (
          <button
            type="submit"
            style={{
              background: "#fdd520",
              color: "#000",
              transition: "background 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.background = "#d4a600")}
            onMouseOut={(e) => (e.target.style.background = "#fdd520")}
          >
            Submit
          </button>
        )}

      </form>
    </div>
  );
};

export default UserForm;
