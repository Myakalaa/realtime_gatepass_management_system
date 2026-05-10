import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";

const GateScanner = () => {
  const [passId, setPassId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const handleManualCheck = (e) => {
    e.preventDefault();
    if (passId.trim()) {
      navigate(`/scan-result/${passId.trim()}`);
    }
  };

  useEffect(() => {
    let scanner = null;

    if (isScanning) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });

      scanner.render(
        (decodedText) => {
          // The QR code contains a URL like: http://.../scan-result/1
          // We extract the ID from the end of the URL
          const parts = decodedText.split("/");
          const id = parts[parts.length - 1];
          
          if (id) {
            scanner.clear();
            setIsScanning(false);
            navigate(`/scan-result/${id}`);
          }
        },
        (error) => {
          // ignore scan errors
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Scanner cleanup failed", err));
      }
    };
  }, [isScanning, navigate]);

  return (
    <div style={containerStyle}>
      <div className="auth-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div style={{ fontSize: '50px', marginBottom: '10px' }}>🛡️</div>
        <h2 style={{ fontSize: '28px', fontWeight: '950', color: '#0f172a', marginBottom: '5px' }}>Gate Security</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>
          Scan the student's QR code or enter their Pass ID manually below.
        </p>

        {isScanning ? (
          <div style={{ marginBottom: '20px' }}>
            <div id="reader" style={{ width: '100%', borderRadius: '20px', overflow: 'hidden' }}></div>
            <button 
              onClick={() => setIsScanning(false)}
              style={{ ...buttonStyle, background: '#ef4444', marginTop: '15px' }}
            >
              Stop Camera
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsScanning(true)}
            style={{ ...buttonStyle, background: '#38bdf8', marginBottom: '30px' }}
          >
            📸 Start Camera Scanner
          </button>
        )}

        <div style={{ position: 'relative', margin: '30px 0', textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #e2e8f0', position: 'absolute', width: '100%', top: '50%' }}></div>
          <span style={{ position: 'relative', background: 'white', padding: '0 15px', color: '#94a3b8', fontSize: '12px', fontWeight: '800' }}>OR MANUAL ENTRY</span>
        </div>

        <form onSubmit={handleManualCheck}>
          <div style={{ textAlign: 'left', marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginLeft: '5px' }}>Enter Pass ID</label>
            <input
              type="text"
              placeholder="e.g. 1"
              value={passId}
              onChange={(e) => setPassId(e.target.value)}
              className="form-input"
              style={{ marginTop: '5px' }}
            />
          </div>

          <button type="submit" className="auth-button">
            Check Pass Status
          </button>
        </form>

        <p style={{ marginTop: '30px', fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
          System Live: Recording entry and exit times automatically.
        </p>
      </div>
    </div>
  );
};

const containerStyle = {
  minHeight: '80vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  background: '#f8fafc'
};

const buttonStyle = {
  width: '100%',
  padding: '16px',
  color: 'white',
  border: 'none',
  borderRadius: '16px',
  fontSize: '14px',
  fontWeight: '800',
  textTransform: 'uppercase',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

export default GateScanner;
