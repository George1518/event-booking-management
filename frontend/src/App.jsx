import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Events from "./pages/Events.jsx";
import EventDetails from "./pages/EventDetails";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import MyBookings from "./pages/MyBookings";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <NavBar user={user} logout={logout} />
      
      <main>
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/bookings" element={<MyBookings />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

function NavBar({ user, logout }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkStyle = (path) => ({
    padding: "10px 16px",
    textDecoration: "none",
    color: isActive(path) ? "#2563eb" : "#4b5563",
    fontWeight: isActive(path) ? "600" : "500",
    borderRadius: "6px",
    transition: "all 0.2s ease",
    background: isActive(path) ? "#dbeafe" : "transparent",
    border: isActive(path) ? "1px solid #bfdbfe" : "1px solid transparent",
    display: "block",
  
    textAlign: "center"
  });

  const hoverStyle = {
    background: "#f3f4f6",
    color: "#374151"
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav style={{
      background: "white",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      borderBottom: "1px solid #e5e7eb",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px"
      }}>
        {/* Logo and Mobile Menu Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Mobile Menu Button - Hidden on desktop */}
          <button
            onClick={toggleMobileMenu}
            style={{
              display: "none",
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "4px"
            }}
            className="mobile-menu-btn"
          >
            ☰
          </button>

          <Link 
            to="/" 
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#2563eb",
              textDecoration: "none"
            }}
          >
            EventHub
          </Link>
        </div>

        {/* Desktop Navigation Links - Hidden on mobile */}
        <div style={{ 
          display: "flex", 
          gap: "8px",
          alignItems: "center"
        }}
        className="desktop-nav"
        >
          <Link 
            to="/" 
            style={navLinkStyle("/")}
            onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, navLinkStyle("/"))}
          >
            Events
          </Link>
          
          {user && (
            <Link 
              to="/bookings" 
              style={navLinkStyle("/bookings")}
              onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, navLinkStyle("/bookings"))}
            >
              My Bookings
            </Link>
          )}
          
          {user?.role === "admin" && (
            <Link 
              to="/admin" 
              style={navLinkStyle("/admin")}
              onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, navLinkStyle("/admin"))}
            >
              Admin
            </Link>
          )}
        </div>

        {/* User Section */}
        <div style={{ 
          display: "flex", 
          alignItems: "center",
          gap: "16px"
        }}
        className="user-section"
        >
          {user ? (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px" 
            }}>
              {/* User info hidden on mobile */}
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                padding: "8px 12px",
                background: "#f3f4f6",
                borderRadius: "6px"
              }}
              className="user-info"
              >
                <div style={{
                  width: "32px",
                  height: "32px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "0.9rem"
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <div style={{ 
                    fontSize: "0.9rem", 
                    fontWeight: "600",
                    color: "#374151"
                  }}>
                    {user.name}
                  </div>
                  <div style={{ 
                    fontSize: "0.75rem", 
                    color: "#6b7280",
                    textTransform: "capitalize"
                  }}>
                    {user.role}
                  </div>
                </div>
              </div>
              
              <button
                onClick={logout}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  color: "#dc2626",
                  border: "1px solid #dc2626",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#dc2626";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#dc2626";
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              style={{
                padding: "10px 10px",
                background: "#2563eb",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                fontWeight: "600",
                transition: "background 0.2s ease",
                fontSize: "13px"
              }}
              onMouseEnter={(e) => e.target.style.background = "#1d4ed8"}
              onMouseLeave={(e) => e.target.style.background = "#2563eb"}
            >
              Login/Register
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu - Hidden by default */}
      <div 
        style={{
          display: isMobileMenuOpen ? "block" : "none",
          background: "white",
          borderTop: "1px solid #e5e7eb",
          padding: "20px"
        }}
        className="mobile-menu"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link 
            to="/" 
            style={navLinkStyle("/")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Events
          </Link>
          
          {user && (
            <Link 
              to="/bookings" 
              style={navLinkStyle("/bookings")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Bookings
            </Link>
          )}
          
          {user?.role === "admin" && (
            <Link 
              to="/admin" 
              style={navLinkStyle("/admin")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admin
            </Link>
          )}

          {/* Mobile user info */}
          {user && (
            <div style={{ 
              padding: "16px",
              background: "#f3f4f6",
              borderRadius: "8px",
              marginTop: "12px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "1.1rem"
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: "600", color: "#374151" }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", textTransform: "capitalize" }}>
                    {user.role}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          
          .desktop-nav {
            display: none !important;
          }
          
          .user-info {
            display: none !important;
          }
          
          .user-details {
            display: none;
          }
        }
        
        @media (max-width: 480px) {
          .user-section > div {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </nav>
  );
}

function Footer() {
  return (
    <footer style={{
      background: "#1f2937",
      color: "white",
      padding: "40px 20px",
      marginTop: "60px"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "40px"
      }}>
        {/* Company Info */}
        <div>
          <h3 style={{ 
            fontSize: "1.25rem", 
            fontWeight: "700", 
            marginBottom: "16px",
            color: "#60a5fa"
          }}>
            EventHub
          </h3>
          <p style={{ 
            color: "#d1d5db", 
            lineHeight: "1.6",
            marginBottom: "20px"
          }}>
            Your premier destination for discovering and booking amazing events. 
            From concerts to conferences, we bring unforgettable experiences to you.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <SocialIcon>📘</SocialIcon>
            <SocialIcon>🐦</SocialIcon>
            <SocialIcon>📷</SocialIcon>
            <SocialIcon>💼</SocialIcon>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ 
            fontSize: "1.1rem", 
            fontWeight: "600", 
            marginBottom: "16px" 
          }}>
            Quick Links
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <FooterLink to="/">Browse Events</FooterLink>
            <FooterLink to="/bookings">My Bookings</FooterLink>
            <FooterLink to="/admin">Admin Panel</FooterLink>
            <FooterLink to="/login">Login</FooterLink>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h4 style={{ 
            fontSize: "1.1rem", 
            fontWeight: "600", 
            marginBottom: "16px" 
          }}>
            Contact Us
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span>📧</span>
              <span style={{ color: "#d1d5db" }}>support@eventhub.com</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span>📞</span>
              <span style={{ color: "#d1d5db" }}>+1 (555) 123-4567</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span>🏢</span>
              <span style={{ color: "#d1d5db" }}>123 Event Street, City, State 12345</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div style={{
        borderTop: "1px solid #374151",
        marginTop: "40px",
        paddingTop: "20px",
        textAlign: "center",
        color: "#9ca3af",
        fontSize: "0.9rem"
      }}>
        <p>&copy; 2024 EventHub. All rights reserved. Made with ❤️ for event lovers.</p>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          footer {
            padding: 30px 16px;
            margin-top: 40px;
          }
          
          footer > div {
            gap: 30px;
          }
        }
        
        @media (max-width: 480px) {
          footer {
            padding: 20px 12px;
          }
          
          footer > div {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style>
    </footer>
  );
}

function SocialIcon({ children }) {
  return (
    <button style={{
      width: "40px",
      height: "40px",
      background: "#374151",
      border: "none",
      borderRadius: "8px",
      fontSize: "1.2rem",
      cursor: "pointer",
      transition: "background 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
    onMouseEnter={(e) => e.target.style.background = "#4b5563"}
    onMouseLeave={(e) => e.target.style.background = "#374151"}
    >
      {children}
    </button>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link to={to} style={{
      color: "#d1d5db",
      textDecoration: "none",
      transition: "color 0.2s ease",
      fontSize: "0.95rem"
    }}
    onMouseEnter={(e) => e.target.style.color = "#60a5fa"}
    onMouseLeave={(e) => e.target.style.color = "#d1d5db"}
    >
      {children}
    </Link>
  );
}