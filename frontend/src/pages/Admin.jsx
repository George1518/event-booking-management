import React, { useEffect, useState } from "react";
import api from "../api";

export default function Admin() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    totalSeats: 1,
    price: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEvents();
      setEvents(res.data.events || []);
    } catch (err) {
      alert("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        date: new Date(form.date),
        totalSeats: Number(form.totalSeats),
        price: Number(form.price),
      };

      if (editingId) {
        await api.updateEvent(editingId, payload);
        alert("Event updated successfully!");
        setEditingId(null);
      } else {
        await api.createEvent(payload);
        alert("Event created successfully!");
      }

      resetForm();
      loadEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      totalSeats: 1,
      price: 0,
    });
    setEditingId(null);
  };

  const editEvent = (event) => {
    setForm({
      title: event.title || "",
      description: event.description || "",
      date: event.date ? event.date.split("T")[0] : "",
      time: event.time || "",
      venue: event.venue || "",
      totalSeats: event.totalSeats || 1,
      price: event.price || 0,
    });
    setEditingId(event._id);
    
    // Only scroll on desktop, on mobile the form is already visible
    if (!isMobile) {
      document.getElementById("event-form").scrollIntoView({ behavior: "smooth" });
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    try {
      await api.deleteEvent(id);
      alert("Event deleted successfully!");
      loadEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete event");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={{ 
      padding: isMobile ? "20px 12px" : "30px 20px", 
      maxWidth: "1400px", 
      margin: "0 auto",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f8fafc",
      minHeight: "100vh"
    }}
    className="admin-container"
    >
      {/* Header */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: isMobile ? "30px" : "40px" 
      }}
      className="admin-header"
      >
        <h1 style={{ 
          fontSize: isMobile ? "1.8rem" : "2.2rem", 
          color: "#1a202c", 
          marginBottom: "8px",
          fontWeight: "700",
          lineHeight: "1.2"
        }}>
          Event Management
        </h1>
        <p style={{ 
          fontSize: isMobile ? "0.9rem" : "1rem", 
          color: "#6b7280",
          lineHeight: "1.4"
        }}>
          Create and manage your events
        </p>
      </div>

      {/* Main Content Container */}
      <div style={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? "24px" : "2rem",
        alignItems: "flex-start"
      }}
      className="admin-content"
      >
        {/* Event Form */}
        <div 
          id="event-form" 
          style={{ 
            width: isMobile ? "100%" : "400px",
            background: "white", 
            padding: isMobile ? "20px" : "60px", 
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            position: isMobile ? "static" : "sticky",
            top: isMobile ? "0" : "20px",
            height: "fit-content",
            order: isMobile ? 2 : 1
          }}
          className="event-form-section"
        >
          <h2 style={{ 
            fontSize: isMobile ? "1.2rem" : "1.3rem", 
            color: "#1a202c", 
            marginBottom: "20px",
            fontWeight: "600",
            paddingBottom: "10px",
            borderBottom: "2px solid #f3f4f6"
          }}>
            {editingId ? "✏️ Edit Event" : "➕ Create New Event"}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Title */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "6px", 
                fontWeight: "600",
                color: "#374151",
                fontSize: "0.9rem"
              }}>
                Event Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="Enter event title"
                style={{
                  width: "90%",
                  padding: "12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  transition: "all 0.2s ease"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "6px", 
                fontWeight: "600",
                color: "#374151",
                fontSize: "0.9rem",
              
              }}>
                Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={isMobile ? "2" : "3"}
                placeholder="Describe your event..."
                style={{
                  width: "90%",
                  padding: "12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  resize: "vertical",
                  transition: "all 0.2s ease",
                  minHeight: isMobile ? "60px" : "80px"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Date and Time Row */}
            <div style={{ 
              display: "flex", 
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "12px" : "12px" 
            }}
            className="form-row"
            >
              <div style={{ flex: 1 , paddingRight: "40px"}}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "6px", 
                  fontWeight: "600",
                  color: "#374151",
                  fontSize: "0.9rem"
                }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: "90%",
                    padding: "12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "1rem"
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "6px", 
                  fontWeight: "600",
                  color: "#374151",
                  fontSize: "0.9rem"
                }}>
                  Time *
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                  style={{
                    width: "90%",
                    padding: "12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "1rem"
                  }}
                />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "6px", 
                fontWeight: "600",
                color: "#374151",
                fontSize: "0.9rem"
              }}>
                Venue *
              </label>
              <input
                type="text"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                required
                placeholder="Event location"
                style={{
                  width: "90%",
                  padding: "12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  transition: "all 0.2s ease"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Seats and Price Row */}
            <div style={{ 
              display: "flex", 
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "12px" : "12px" ,
            
            }}
            className="form-row"
            >
              <div style={{ flex: 1,   paddingRight: "40px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "6px", 
                  fontWeight: "600",
                  color: "#374151",
                  fontSize: "0.9rem"
                }}>
                  Total Seats *
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.totalSeats}
                  onChange={(e) => setForm({ ...form, totalSeats: e.target.value })}
                  required
                  style={{
                    width: "90%",
                    padding: "12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "1rem"
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "6px", 
                  fontWeight: "600",
                  color: "#374151",
                  fontSize: "0.9rem"
                }}>
                  Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  style={{
                    width: "90%",
                    padding: "12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "1rem"
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              display: "flex", 
              flexDirection: isMobile ? "column" : "row",
              gap: "12px", 
              marginTop: "8px",
              paddingTop: "16px",
              borderTop: "1px solid #f3f4f6"
            }}
            className="action-buttons"
            >
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: submitting ? "#9ca3af" : "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  minHeight: "48px",
                  maxWidth: "90%"
                }}
                onMouseEnter={(e) => !submitting && (e.target.style.background = "#059669")}
                onMouseLeave={(e) => !submitting && (e.target.style.background = "#10b981")}
              >
                {submitting ? "⏳ Processing..." : editingId ? "💾 Update Event" : "✨ Create Event"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: isMobile ? "14px" : "12px 16px",
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                    minHeight: "48px"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#4b5563"}
                  onMouseLeave={(e) => e.target.style.background = "#6b7280"}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Events List */}
        <div style={{ 
          flex: "1", 
          minWidth: "0",
          order: isMobile ? 1 : 2
        }}
        className="events-list-section"
        >
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px"
          }}
          className="events-header"
          >
            <h2 style={{ 
              fontSize: isMobile ? "1.2rem" : "1.3rem", 
              color: "#1a202c", 
              fontWeight: "600",
              margin: 0
            }}>
              📋 Existing Events ({events.length})
            </h2>
            <div style={{ 
              fontSize: "0.9rem", 
              color: "#6b7280",
              background: "#f3f4f6",
              padding: "6px 12px",
              borderRadius: "12px",
              whiteSpace: "nowrap"
            }}>
              {events.filter(e => e.isActive).length} active
            </div>
          </div>

          {loading ? (
            <div style={{ 
              textAlign: "center", 
              padding: isMobile ? "40px 20px" : "60px 20px",
              background: "white",
              borderRadius: "10px",
              color: "#6b7280",
              fontSize: isMobile ? "0.9rem" : "1rem"
            }}
            className="loading-state"
            >
              <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", marginBottom: "10px" }}>⏳</div>
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: isMobile ? "40px 20px" : "60px 20px",
              background: "white",
              borderRadius: "10px",
              color: "#6b7280",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
            }}
            className="empty-state"
            >
              <div style={{ fontSize: isMobile ? "2rem" : "3rem", marginBottom: "16px" }}>📅</div>
              <h3 style={{ 
                margin: "0 0 8px 0", 
                color: "#374151",
                fontSize: isMobile ? "1.1rem" : "1.2rem"
              }}>No events yet</h3>
              <p style={{ 
                margin: 0, 
                fontSize: isMobile ? "0.85rem" : "0.9rem",
                lineHeight: "1.4"
              }}>Create your first event to get started</p>
            </div>
          ) : (
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: isMobile ? "12px" : "16px" 
            }}
            className="events-list"
            >
              {events.map((event) => (
                <div
                  key={event._id}
                  style={{
                    background: "white",
                    padding: isMobile ? "16px" : "20px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    borderLeft: `4px solid ${event.isActive ? "#10b981" : "#ef4444"}`,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                  className="event-item"
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
                    }
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start",
                    marginBottom: "12px",
                    gap: "12px"
                  }}
                  className="event-header"
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ 
                        fontSize: isMobile ? "1rem" : "1.1rem", 
                        color: "#1a202c", 
                        margin: "0 0 6px 0",
                        fontWeight: "600",
                        lineHeight: "1.3",
                        wordWrap: "break-word"
                      }}>
                        {event.title}
                      </h3>
                      <p style={{ 
                        color: "#6b7280", 
                        margin: "0 0 8px 0",
                        fontSize: isMobile ? "0.8rem" : "0.85rem",
                        lineHeight: "1.4"
                      }}>
                        🏟️ {event.venue} • 📅 {formatDate(event.date)} at {event.time}
                      </p>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: isMobile ? "8px" : "16px", 
                        fontSize: isMobile ? "0.8rem" : "0.85rem",
                        flexWrap: "wrap"
                      }}
                      className="event-details"
                      >
                        <span style={{ color: "#059669", fontWeight: "600" }}>💰 ₹{event.price}</span>
                        <span style={{ color: "#374151" }}>🎫 {event.availableSeats}/{event.totalSeats} seats</span>
                        <span style={{ 
                          background: event.isActive ? "#d1fae5" : "#fee2e2",
                          color: event.isActive ? "#065f46" : "#991b1b",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontWeight: "600",
                          fontSize: "0.75rem"
                        }}>
                          {event.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    display: "flex", 
                    gap: "8px",
                    justifyContent: isMobile ? "space-between" : "flex-end"
                  }}
                  className="event-actions"
                  >
                    <button
                      onClick={() => editEvent(event)}
                      style={{
                        padding: isMobile ? "10px 16px" : "6px 12px",
                        background: "#f59e0b",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: isMobile ? "0.9rem" : "0.8rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        flex: isMobile ? 1 : "none",
                        minHeight: isMobile ? "44px" : "auto"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#d97706"}
                      onMouseLeave={(e) => e.target.style.background = "#f59e0b"}
                    >
                      ✏️ {isMobile ? "Edit Event" : "Edit"}
                    </button>
                    <button
                      onClick={() => deleteEvent(event._id)}
                      style={{
                        padding: isMobile ? "10px 16px" : "6px 12px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: isMobile ? "0.9rem" : "0.8rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        flex: isMobile ? 1 : "none",
                        minHeight: isMobile ? "44px" : "auto"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#dc2626"}
                      onMouseLeave={(e) => e.target.style.background = "#ef4444"}
                    >
                      🗑️ {isMobile ? "Delete Event" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .admin-container {
            padding: 16px 12px !important;
          }
          
          .admin-header h1 {
            font-size: 1.6rem !important;
          }
          
          .admin-header p {
            font-size: 0.85rem !important;
          }
          
          .event-form-section {
            position: static !important;
            width: 100% !important;
            padding: 20px 16px !important;
          }
          
          .events-header {
            flex-direction: column;
            align-items: flex-start !important;
          }
          
          .events-header h2 {
            font-size: 1.1rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .admin-container {
                padding: 12px 8px !important;
            }
            
            .admin-header {
                margin-bottom: 20px !important;
            }
            
            .admin-header h1 {
                font-size: 1.4rem !important;
            }
            
            .admin-content {
                gap: 16px !important;
            }
            
            .event-form-section {
                padding: 16px  !important;
            }
            
            .form-row {
                gap: 8px !important;
            }
            
            .action-buttons {
                gap: 8px !important;
            }
            
            .event-item {
                padding: 12px !important;
            }
            
            .event-details {
                flex-direction: column;
                align-items: flex-start !important;
                gap: 4px !important;
            }
            
            .event-actions {
                flex-direction: column;
                gap: 8px !important;
            }
            
            .event-actions button {
                width: 100% !important;
            }
        }
        
        @media (max-width: 320px) {
            .admin-header h1 {
                font-size: 1.3rem !important;
            }
            
            input, textarea {
                font-size: 16px !important; /* Prevents zoom on iOS */
      
            }
        }
        
        /* Touch device improvements */
        @media (hover: none) {
            .event-item:hover {
                transform: none !important;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
            }
            
            button:active {
                transform: scale(0.98);
            }
        }
      `}</style>
    </div>
  );
}