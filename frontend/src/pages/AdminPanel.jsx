import React, { useEffect, useState } from "react";
import { getAllPasses, approvePass } from "../services/api";

function AdminPanel() {
  const [passes, setPasses] = useState([]);

  const loadPasses = () => {
    getAllPasses().then((res) => setPasses(res.data || []));
  };

  useEffect(() => {
    loadPasses();
  }, []);

  const handleApprove = (id) => approvePass(id).then(loadPasses);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {passes.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-xl shadow">
            <h3 className="font-bold text-xl">Pass #{p.id}</h3>
            <p>{p.student_name}</p>
            <p>{p.department}</p>
            <p>{p.purpose}</p>

            <span
              className={`px-2 py-1 text-white rounded ${
                p.status === "PENDING"
                  ? "bg-yellow-500"
                  : "bg-green-600"
              }`}
            >
              {p.status}
            </span>

            {p.status === "PENDING" && (
              <button
                onClick={() => handleApprove(p.id)}
                className="block mt-3 bg-green-600 text-white px-3 py-1 rounded"
              >
                Approve
              </button>
            )}

            {p.qr_code_path && (
              <img src={p.qr_code_path} className="w-32 mt-3" alt="QR" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPanel;