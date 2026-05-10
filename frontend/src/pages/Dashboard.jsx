import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      padding: '40px 20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        
        <header style={{ marginBottom: '60px' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🚀</div>
          <h1 style={{ fontSize: '48px', fontWeight: '950', color: '#0f172a', letterSpacing: '-0.05em', marginBottom: '15px' }}>
            Welcome to Gatepass <span style={{ color: '#38bdf8' }}>Smart Hub</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '600px', margin: '0 auto', fontWeight: '500', lineHeight: '1.6' }}>
            The fastest and most secure way to manage your campus entry and exit permissions.
          </p>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '30px',
          marginBottom: '60px'
        }}>
          {/* Action Card 1 */}
          <div style={cardStyle}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>📝</div>
            <h3 style={cardTitleStyle}>Apply Pass</h3>
            <p style={cardTextStyle}>Need to leave campus? Submit your request in seconds with our digital form.</p>
            <Link to="/apply" style={cardButtonStyle}>Start Application</Link>
          </div>

          {/* Action Card 2 */}
          <div style={cardStyle}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>📂</div>
            <h3 style={cardTitleStyle}>Track Status</h3>
            <p style={cardTextStyle}>Check if your pass has been approved and access your active QR codes.</p>
            <Link to="/passes" style={cardButtonStyle}>View My Passes</Link>
          </div>

          {/* Action Card 3 */}
          <div style={cardStyle}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>🛡️</div>
            <h3 style={cardTitleStyle}>Gate Scanner</h3>
            <p style={cardTextStyle}>Security personnel can scan and record student entries and exits here.</p>
            <Link to="/gate-scanner" style={cardButtonStyle}>Open Scanner</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid #e2e8f0', paddingTop: '40px', color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
          © {new Date().getFullYear()} GATEPASS SYSTEM — SMART CAMPUS INFRASTRUCTURE
        </footer>
      </div>
    </div>
  );
}

const cardStyle = {
  background: 'white',
  padding: '40px',
  borderRadius: '32px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
  border: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transition: 'transform 0.2s',
};

const cardTitleStyle = {
  fontSize: '22px',
  fontWeight: '800',
  color: '#0f172a',
  marginBottom: '10px'
};

const cardTextStyle = {
  fontSize: '14px',
  color: '#64748b',
  lineHeight: '1.6',
  marginBottom: '25px',
  height: '45px'
};

const cardButtonStyle = {
  display: 'inline-block',
  padding: '12px 24px',
  background: '#f1f5f9',
  color: '#0f172a',
  borderRadius: '12px',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  transition: 'all 0.2s'
};
