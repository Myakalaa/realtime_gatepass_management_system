import React, { useState, useEffect } from "react";
import { createPass } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./AuthForms.css"; // Reuse input styles

function ApplyPass() {
  const navigate = useNavigate();    

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ You must be logged in to apply for a gate pass.");
      navigate("/login");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    studentName: "",
    purpose: "",
    department: "",
    mobileNumber: "",
    studentId: "",
    passType: "STUDENT",
    vehicleNumber: "",
    vehicleType: "",
    inTime: "",
    outTime: "",
  });

  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 19);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const { studentName, purpose, department, mobileNumber, studentId, inTime, outTime } = formData;
    if (!studentName || !purpose || !department || !mobileNumber || !studentId || !inTime || !outTime) {
      setMessage("Please fill all required fields");
      return;
    }

    const submitData = new FormData();
    submitData.append("student_name", studentName);
    submitData.append("purpose", purpose);
    submitData.append("department", department);
    submitData.append("mobile_number", mobileNumber);
    submitData.append("student_id", studentId);
    submitData.append("pass_type", formData.passType);
    submitData.append("vehicle_number", formData.passType === "VEHICLE" ? formData.vehicleNumber : "");
    submitData.append("vehicle_type", formData.passType === "VEHICLE" ? formData.vehicleType : "");
    submitData.append("in_time", formatDateTime(inTime));
    submitData.append("out_time", formatDateTime(outTime));

    documents.forEach((file) => submitData.append("documents", file));

    try {
      setLoading(true);
      setMessage("Applying pass...");
      await createPass(submitData);
      setMessage("Pass Applied Successfully! Check 'Pass List' for status.");
      setFormData({
        studentName: "", purpose: "", department: "", mobileNumber: "", studentId: "",
        passType: "STUDENT", vehicleNumber: "", vehicleType: "", inTime: "", outTime: "",
      });
      setDocuments([]);
    } catch (error) {
      setMessage(error?.response?.data?.detail || "Cannot apply pass (Server error)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', background: '#f8fafc', minHeight: '100vh' }}>
      <div className="auth-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '40px' }}>🛂</div>
          <h2 className="auth-title">Apply for Gate Pass</h2>
          <p className="auth-subtitle">Fill in the details to request a campus exit</p>
        </div>

        {message && (
          <div style={{ 
            background: message.includes("Successfully") ? "#dcfce7" : "#fee2e2", 
            color: message.includes("Successfully") ? "#166534" : "#991b1b",
            padding: '15px', borderRadius: '12px', fontWeight: '700', marginBottom: '25px', textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="studentName" className="form-input" placeholder="Enter name" value={formData.studentName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Student ID</label>
              <input name="studentId" className="form-input" placeholder="ID Number" value={formData.studentId} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input name="mobileNumber" className="form-input" placeholder="9988XXXXXX" value={formData.mobileNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input name="department" className="form-input" placeholder="e.g. CSE" value={formData.department} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Purpose of Exit</label>
              <input name="purpose" className="form-input" placeholder="Reason for leaving campus" value={formData.purpose} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Exit Date & Time</label>
              <input type="datetime-local" name="outTime" className="form-input" value={formData.outTime} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Expected Return Time</label>
              <input type="datetime-local" name="inTime" className="form-input" value={formData.inTime} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Pass Type</label>
              <select name="passType" className="form-input" value={formData.passType} onChange={handleChange}>
                <option value="STUDENT">Student (Walking)</option>
                <option value="VEHICLE">Vehicle</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Attachments (Optional)</label>
              <input type="file" multiple className="form-input" style={{ padding: '10px' }} onChange={(e) => setDocuments(Array.from(e.target.files))} />
            </div>
          </div>

          {formData.passType === "VEHICLE" && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f1f5f9', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Vehicle Number</label>
                <input name="vehicleNumber" className="form-input" placeholder="TS 08 XX 1234" value={formData.vehicleNumber} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select name="vehicleType" className="form-input" value={formData.vehicleType} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="BIKE">Bike / Two-Wheeler</option>
                  <option value="CAR">Car / Four-Wheeler</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="auth-button" disabled={loading} style={{ marginTop: '20px' }}>
            {loading ? "Processing..." : "Submit Gate Pass Application"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ApplyPass;