import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [rejectReasons, setRejectReasons] = useState({}); // Store reasons per employee
  const [rejectingUserId, setRejectingUserId] = useState(null); // Track which employee is being rejected
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const employeesList = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => user.role === "employee");
        setEmployees(employeesList);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  //Convert Base64 to Blob and Open in New Tab
  const openPdfInNewTab = (base64String) => {
    if (!base64String) return;
    const byteCharacters = atob(base64String.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length)
      .fill(null)
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  };

  // Function to Update Firestore Status
  const updateStatus = async (id, newStatus, reason = "") => {
    try {
      const userDoc = doc(db, "users", id);
      await updateDoc(userDoc, { status: newStatus, rejectReason: reason });

      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === id ? { ...emp, status: newStatus, rejectReason: reason } : emp
        )
      );

    //   alert(`User marked as ${newStatus}`);
      setRejectReasons((prev) => ({ ...prev, [id]: "" })); // Clear rejection reason input
      setRejectingUserId(null); // Hide rejection input field after submission
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleRejectionReasonChange = (id, reason) => {
    setRejectReasons((prev) => ({ ...prev, [id]: reason }));
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Aadhar</th>
            <th>PAN</th>
            <th>Document</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.aadharNumber}</td>
              <td>{emp.panNumber}</td>
              <td>
                {emp.fileBase64 ? (
                  <button onClick={() => openPdfInNewTab(emp.fileBase64)}>
                    View Document
                  </button>
                ) : (
                  "No Document"
                )}
              </td>
              <td>{emp.status || "Pending"}</td>
              <td>
                {emp.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(emp.id, "approved")}
                      className="approve-btn"
                    >
                      Approve
                    </button>

                    {rejectingUserId === emp.id ? (
                      <div style={{ marginTop: "5px" }}>
                        <input
                          type="text"
                          placeholder="Enter reason"
                          value={rejectReasons[emp.id] || ""}
                          onChange={(e) => handleRejectionReasonChange(emp.id, e.target.value)}
                        />
                        <button
                          onClick={() => updateStatus(emp.id, "rejected", rejectReasons[emp.id])}
                          disabled={!rejectReasons[emp.id]}
                        >
                          Submit
                        </button>
                        <button onClick={() => setRejectingUserId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRejectingUserId(emp.id)}
                        className="reject-btn"
                      >
                        Reject
                      </button>
                    )}
                  </>
                )}
                {emp.status === "approved" && <span className="approved-text">✅ Approved</span>}
                {emp.status === "rejected" && (
                  <span className="rejected-text">
                    ❌ Rejected <br />
                    <strong>Reason:</strong> {emp.rejectReason || "No reason provided"}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
