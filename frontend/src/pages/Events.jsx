import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../contexts/AuthContext";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.getEvents()
      .then((res) => setEvents(res.data.events))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const removeEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.deleteEvent(id);
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
      alert("Event deleted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete event");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isPastEvent = (dateString) => {
    return new Date(dateString) < new Date();
  };

  const getEventStatus = (event) => {
    if (!event.isActive) return { text: "Cancelled", color: "#dc2626", bg: "#fee2e2" };
    if (isPastEvent(event.date)) return { text: "Completed", color: "#6b7280", bg: "#f3f4f6" };
    if (event.availableSeats === 0) return { text: "Sold Out", color: "#dc2626", bg: "#fee2e2" };
    return { text: "Upcoming", color: "#059669", bg: "#d1fae5" };
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "50vh",
        fontSize: "18px",
        color: "#666"
      }}>
        Loading events...
      </div>
    );
  }

  if (!events.length) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "40px 20px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        margin: "40px 20px",
        width: "calc(100% - 40px)"
      }}
      className="no-events-container"
      >
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📅</div>
        <h2 style={{ color: "#4a5568", marginBottom: "10px", fontSize: "1.5rem" }}>No Events Available</h2>
        <p style={{ color: "#718096", fontSize: "1rem", lineHeight: "1.5" }}>Check back later for upcoming events.</p>
        {user?.role === "admin" && (
          <Link 
            to="/admin" 
            style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "12px 24px",
              background: "#2563eb",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "1rem"
            }}
          >
            Create Your First Event
          </Link>
        )}
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "30px 16px", 
      maxWidth: "1200px", 
      margin: "0 auto",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f8fafc",
      minHeight: "100vh"
    }}
    className="events-container"
    >
      {/* Header */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "30px" 
      }}
      className="events-header"
      >
        <h1 style={{ 
          fontSize: "2rem", 
          color: "#1a202c", 
          marginBottom: "8px",
          fontWeight: "700",
          lineHeight: "1.2"
        }}>
          Upcoming Events
        </h1>
        <p style={{ 
          fontSize: "1rem", 
          color: "#4a5568",
          lineHeight: "1.4"
        }}>
          Discover amazing events and book your tickets
        </p>
      </div>

      {/* Events Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
        gap: "24px",
        width: "100%"
      }}
      className="events-grid"
      >
        {events.map((event) => {
          const status = getEventStatus(event);
          const isPast = isPastEvent(event.date);

          return (
            <div
              key={event._id}
              style={{
                background: "white",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                opacity: !event.isActive ? 0.7 : 1
              }}
              className="event-card"
              onMouseEnter={(e) => {
                if (event.isActive) {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
              }}
            >
              {/* Event Image/Placeholder */}
              <div style={{
                height: "180px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "2.5rem"
              }}
              className="event-image"
              >
                🎭
              </div>

              {/* Event Content */}
              <div style={{ padding: "20px" }}
              className="event-content"
              >
                {/* Header with Status */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start",
                  marginBottom: "12px",
                  gap: "12px"
                }}
                className="event-header"
                >
                  <h3 style={{ 
                    fontSize: "1.2rem", 
                    color: "#1a202c", 
                    margin: 0,
                    fontWeight: "600",
                    lineHeight: "1.3",
                    flex: 1
                  }}
                  className="event-title"
                  >
                    {event.title}
                  </h3>
                  <span style={{
                    background: status.bg,
                    color: status.color,
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "0.7rem",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    flexShrink: 0
                  }}
                  className="event-status"
                  >
                    {status.text}
                  </span>
                </div>

                {/* Description */}
                <p style={{ 
                  color: "#4a5568", 
                  lineHeight: "1.5",
                  marginBottom: "16px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  fontSize: "0.9rem"
                }}
                className="event-description"
                >
                  {event.description}
                </p>

                {/* Event Details */}
                <div style={{ 
                  display: "grid", 
                  gap: "8px",
                  marginBottom: "16px"
                }}
                className="event-details"
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}
                  className="event-detail"
                  >
                    <span style={{ color: "#6b7280", minWidth: "70px", fontSize: "0.85rem", flexShrink: 0 }}>📅 Date:</span>
                    <span style={{ color: "#374151", fontWeight: "500", fontSize: "0.85rem", lineHeight: "1.3" }}>
                      {formatDate(event.date)} at {event.time}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}
                  className="event-detail"
                  >
                    <span style={{ color: "#6b7280", minWidth: "70px", fontSize: "0.85rem", flexShrink: 0 }}>🏟️ Venue:</span>
                    <span style={{ color: "#374151", fontWeight: "500", fontSize: "0.85rem", lineHeight: "1.3" }}>{event.venue}</span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  className="event-detail"
                  >
                    <span style={{ color: "#6b7280", minWidth: "70px", fontSize: "0.85rem", flexShrink: 0 }}>💰 Price:</span>
                    <span style={{ color: "#059669", fontWeight: "600", fontSize: "1rem" }}>
                      ₹{event.price}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  className="event-detail"
                  >
                    <span style={{ color: "#6b7280", minWidth: "70px", fontSize: "0.85rem", flexShrink: 0 }}>🎫 Seats:</span>
                    <span style={{ color: "#374151", fontWeight: "500", fontSize: "0.85rem" }}>
                      {event.availableSeats} / {event.totalSeats} available
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: "16px" }}
                className="progress-container"
                >
                  <div style={{ 
                    background: "#e5e7eb", 
                    borderRadius: "10px", 
                    height: "6px",
                    overflow: "hidden"
                  }}>
                    <div style={{ 
                      background: "#10b981",
                      height: "100%",
                      width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%`,
                      transition: "width 0.3s ease"
                    }}></div>
                  </div>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    marginTop: "4px"
                  }}>
                    <span>{event.totalSeats - event.availableSeats} booked</span>
                    <span>{event.availableSeats} available</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ 
                  display: "flex", 
                  gap: "8px",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap"
                }}
                className="action-buttons"
                >
                  <Link
                    to={`/events/${event._id}`}
                    style={{
                      flex: "1 1 200px",
                      padding: "12px 16px",
                      background: "#2563eb",
                      color: "white",
                      textDecoration: "none",
                      textAlign: "center",
                      borderRadius: "6px",
                      fontWeight: "600",
                      transition: "background 0.2s ease",
                      opacity: event.isActive ? 1 : 0.5,
                      pointerEvents: event.isActive ? "auto" : "none",
                      fontSize: "0.9rem",
                      minWidth: "140px",
            
                    }}
                    className="view-details-btn"
                    onMouseEnter={(e) => {
                      if (event.isActive) e.target.style.background = "#1d4ed8";
                    }}
                    onMouseLeave={(e) => {
                      if (event.isActive) e.target.style.background = "#2563eb";
                    }}
                  >
                    {event.isActive ? "View Details & Book" : "Event Unavailable"}
                  </Link>

                  {user?.role === "admin" && (
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}
                    className="admin-buttons"
                    >
                      <Link
                        to={`/admin?edit=${event._id}`}
                        style={{
                          padding: "8px 12px",
                          background: "#f59e0b",
                          color: "white",
                          textDecoration: "none",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          whiteSpace: "nowrap"
                        }}
                        className="edit-btn"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => removeEvent(event._id)}
                        style={{
                          padding: "8px 12px",
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          whiteSpace: "nowrap"
                        }}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .events-container {
            padding: 20px 12px;
          }
          
          .events-header h1 {
            font-size: 1.8rem !important;
          }
          
          .events-header p {
            font-size: 0.95rem !important;
          }
          
          .events-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
            gap: 20px !important;
          }
          
          .event-image {
            height: 160px !important;
            font-size: 2rem !important;
          }
          
          .event-content {
            padding: 16px !important;
          }
          
          .event-title {
            font-size: 1.1rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .events-container {
            padding: 16px 8px;
          }
          
          .events-header {
            margin-bottom: 24px !important;
          }
          
          .events-header h1 {
            font-size: 1.6rem !important;
            margin-bottom: 6px !important;
          }
          
          .events-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          .event-card {
            margin: 0 auto;
            max-width: 400px;
            width: 100%;
          }
          
          .event-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          
          .event-status {
            align-self: flex-start;
          }
          
          .event-details {
            gap: 6px !important;
          }
          
          .event-detail {
            align-items: flex-start !important;
            
          }
          
          .event-detail span:first-child {
            min-width: 60px !important;
            font-size: 0.8rem !important;
          }
          
          .event-detail span:last-child {
            font-size: 0.8rem !important;
          }
          
          .action-buttons {
            flex-direction: column;
            gap: 10px !important;
          }
          
          .view-details-btn {
            flex: 1 1 auto !important;
            width: 80%;
            order: 2;
          
          }
          
          .admin-buttons {
            order: 1;
            width: 100%;
            justify-content: flex-end;
          }
          
          .no-events-container {
            margin: 20px 12px !important;
            padding: 30px 16px !important;
            max-width: none !important;
            width: calc(100% - 24px) !important;
          }
          
          .no-events-container h2 {
            font-size: 1.3rem !important;
          }
        }
        
        @media (max-width: 320px) {
          .events-grid {
            grid-template-columns: 1fr !important;
          }
          
          .event-card {
            min-width: 0;
          }
          
          .event-detail {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 2px !important;
          }
          
          .event-detail span:first-child {
            min-width: auto !important;
          }
        }
        
        /* Touch device improvements */
        @media (hover: none) {
          .event-card:hover {
            transform: none !important;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
          }
          
          .view-details-btn:active {
            background: #1d4ed8 !important;
            transform: scale(0.98);
          }
        }
      `}</style>
    </div>
  );
}