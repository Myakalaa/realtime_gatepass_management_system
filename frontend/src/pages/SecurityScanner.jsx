// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import axios from "axios";

// function SecurityScanner() {
//   const [params] = useSearchParams();
//   const passId = params.get("pass_id");

//   const [data, setData] = useState(null);
//   const [status, setStatus] = useState("loading");

//   // ---- Play Sound Based on Status ----
//   useEffect(() => {
//     if (status === "approved") {
//       new Audio("/success.mp3").play();
//     }
//     if (status === "rejected" || status === "pending" || status === "error") {
//       new Audio("/error.mp3").play();
//     }
//   }, [status]);

//   // ---- Fetch Scan Data ----
//   useEffect(() => {
//     axios
//       .get(`${BASE_URL}/scan/${passId}`)
//       .then((res) => {
//         setData(res.data);
//         setStatus(res.data.status);
//       })
//       .catch(() => setStatus("error"));
//   }, [passId]);

//   // ---- Dynamic Heading ----
//   const renderStatus = () => {
//     switch (status) {
//       case "approved":
//         return (
//           <h1 className="text-3xl font-bold text-green-600">
//             ✅ ACCESS GRANTED
//           </h1>
//         );

//       case "pending":
//         return (
//           <h1 className="text-3xl font-bold text-yellow-600">
//             ⛔ ADMIN APPROVAL REQUIRED
//           </h1>
//         );

//       case "rejected":
//         return (
//           <h1 className="text-3xl font-bold text-red-600">
//             ❌ PASS REJECTED
//           </h1>
//         );

//       case "error":
//         return (
//           <h1 className="text-3xl font-bold text-gray-600">
//             ⚠ INVALID PASS / QR CODE
//           </h1>
//         );

//       default:
//         return <p>Loading…</p>;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
//       <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-lg w-full text-center border">

//         {/* Status Title */}
//         {renderStatus()}

//         {/* Message */}
//         {data && (
//           <p className="mt-4 text-gray-700 text-lg font-medium">{data.message}</p>
//         )}

//         {/* Approved Block */}
//         {status === "approved" && (
//           <div className="mt-6 bg-green-50 border border-green-300 p-5 rounded-xl text-left">

//             {data.entry_time && (
//               <p>
//                 <strong>Entry Time:</strong>{" "}
//                 {new Date(data.entry_time).toLocaleString()}
//               </p>
//             )}

//             {data.exit_time && (
//               <p>
//                 <strong>Exit Time:</strong>{" "}
//                 {new Date(data.exit_time).toLocaleString()}
//               </p>
//             )}

//             <p>
//               <strong>Late Minutes:</strong> {data.late_minutes} min
//             </p>

//             <p>
//               <strong>Fine Amount:</strong> ₹{data.fine_amount}
//             </p>

//             {data.fine_amount > 0 ? (
//               <p className="text-red-600 font-semibold mt-2">
//                 ⚠ Fine Applied — Student Late
//               </p>
//             ) : (
//               <p className="text-green-600 font-semibold mt-2">
//                 ✔ On Time — No Fine
//               </p>
//             )}
//           </div>
//         )}

//         {/* Pending / Rejected Block */}
//         {(status === "pending" || status === "rejected") && (
//           <div className="mt-6 bg-yellow-50 border border-yellow-300 p-5 rounded-xl">
//             <p className="font-medium">Pass ID: {passId}</p>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

// export default SecurityScanner;
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BASE_URL } from "../services/api";
import axios from "axios";

function SecurityScanner() {
  const [params] = useSearchParams();
  const passId = params.get("pass_id");

  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  // ---- Play Sound Based on Status ----
  useEffect(() => {
    if (status === "loading") return;

    if (["approved", "exit_recorded", "entry_recorded", "entry_recorded_after_fine"].includes(status)) {
      new Audio("/success.mp3").play().catch(() => {});
    }
    if (["rejected", "pending", "error", "fine_due"].includes(status)) {
      new Audio("/error.mp3").play().catch(() => {});
    }
  }, [status]);

  // ---- Fetch Scan Data ----
  useEffect(() => {
    if (!passId) return;

    axios
      .get(`${BASE_URL}/scan/${passId}`)
      .then((res) => {
        setData(res.data);
        setStatus(res.data.status);
      })
      .catch(() => setStatus("error"));
  }, [passId]);

  // ---- Dynamic Heading ----
  const renderStatus = () => {
    switch (status) {
      case "approved":
      case "exit_recorded":
      case "entry_recorded":
      case "entry_recorded_after_fine":
        return (
          <h1 className="text-3xl font-bold text-green-600">
            ✅ ACCESS GRANTED
          </h1>
        );

      case "fine_due":
        return (
          <h1 className="text-3xl font-bold text-red-600">
            ⚠ FINE DUE
          </h1>
        );

      case "pending":
        return (
          <h1 className="text-3xl font-bold text-yellow-600">
            ⛔ ADMIN APPROVAL REQUIRED
          </h1>
        );

      case "rejected":
        return (
          <h1 className="text-3xl font-bold text-red-600">
            ❌ PASS REJECTED
          </h1>
        );

      case "completed":
        return (
          <h1 className="text-3xl font-bold text-blue-600">
            ℹ PASS COMPLETED
          </h1>
        );

      case "error":
        return (
          <h1 className="text-3xl font-bold text-gray-600">
            ⚠ INVALID PASS / QR CODE
          </h1>
        );

      default:
        return <p>Loading…</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-lg w-full text-center border">

        {/* Status Title */}
        {renderStatus()}

        {/* Message */}
        {data && (
          <p className="mt-4 text-gray-700 text-lg font-medium">
            {data.message}
          </p>
        )}

        {/* Success / Fine Block */}
        {["exit_recorded", "entry_recorded", "entry_recorded_after_fine", "fine_due"].includes(status) && data && (
          <div className={`mt-6 p-5 rounded-xl text-left border ${status === 'fine_due' ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>

            {data.entry_time && (
              <p>
                <strong>Entry Time:</strong>{" "}
                {new Date(data.entry_time).toLocaleString()}
              </p>
            )}

            {data.exit_time && (
              <p>
                <strong>Exit Time:</strong>{" "}
                {new Date(data.exit_time).toLocaleString()}
              </p>
            )}

            <p>
              <strong>Late Minutes:</strong> {data.late_minutes || 0} min
            </p>

            <p>
              <strong>Fine Amount:</strong> ₹{data.fine_amount || 0}
            </p>

            {(data.fine_amount || 0) > 0 ? (
              <p className="text-red-600 font-semibold mt-2">
                ⚠ Fine Applied — Student Late
              </p>
            ) : (
              <p className="text-green-600 font-semibold mt-2">
                ✔ On Time — No Fine
              </p>
            )}
          </div>
        )}

        {/* Pending / Rejected Block */}
        {(status === "pending" || status === "rejected") && (
          <div className="mt-6 bg-yellow-50 border border-yellow-300 p-5 rounded-xl">
            <p className="font-medium">Pass ID: {passId}</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default SecurityScanner;

