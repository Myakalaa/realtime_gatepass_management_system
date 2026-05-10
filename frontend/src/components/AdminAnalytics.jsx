import React, { useEffect, useState } from "react";
import { getAnalytics } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import "./AdminAnalytics.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await getAnalytics();
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading Analytics...</div>;
  if (!data) return <div className="error">Failed to load data.</div>;

  return (
    <div className="analytics-container">
      <h2>📊 System Analytics</h2>
      
      <div className="summary-cards">
        <div className="card passes-card">
          <h3>Total Passes</h3>
          <p className="big-number">{data.total_passes}</p>
        </div>
        <div className="card fines-card">
          <h3>Total Fines Collected</h3>
          <p className="big-number">₹{data.total_fines}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-box">
          <h3>Busiest Days</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.busiest_days}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Passes Issued" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Top Reasons for Leave</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.top_reasons}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="purpose"
                label={({ purpose, percent }) => `${purpose} ${(percent * 100).toFixed(0)}%`}
              >
                {data.top_reasons.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
