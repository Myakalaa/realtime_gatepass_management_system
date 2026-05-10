import React, { useState } from "react";
import { QrReader } from "react-qr-reader";

function QRScanner() {
  const [scanText, setScanText] = useState("");
  const [error, setError] = useState("");

  const handleScan = (result) => {
    if (result?.text) {
      setScanText(result.text);

      // If QR contains ONLY pass_id=10   -> backend style
      if (result.text.startsWith("PASS_ID=")) {
        const id = result.text.split("=")[1];
        window.location.href = `/scan-result?pass_id=${id}`;
        return;
      }

      // If QR contains SCAN URL -> our passes.py QR
      if (result.text.includes("scan-result")) {
        window.location.href = result.text;
        return;
      }

      // Fallback: if QR text ends with a number
      const match = result.text.match(/(\d+)$/);
      if (match) {
        const id = match[1];
        window.location.href = `/scan-result?pass_id=${id}`;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">📸 Scan QR Code</h1>

      <div className="w-full max-w-md">
        <QrReader
          onResult={(result, err) => {
            if (result) handleScan(result);
            if (err) setError(err.message);
          }}
          constraints={{ facingMode: "environment" }}
          containerStyle={{ width: "100%" }}
          videoStyle={{ width: "100%", borderRadius: "10px" }}
        />
      </div>

      {scanText && (
        <p className="mt-4 text-lg text-green-700 font-semibold">
          Scanned: {scanText}
        </p>
      )}

      {error && (
        <p className="mt-4 text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}

export default QRScanner;
