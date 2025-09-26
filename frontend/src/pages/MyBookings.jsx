import React, { useEffect, useState } from "react";
import api from "../api";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await api.myBookings(); // Fixed: removed the parameter
      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      alert("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await api.cancelBooking(id); // Fixed: use cancelBooking method instead of put
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking._id === id ? { ...booking, status: 'cancelled' } : booking
      ));
      alert("Booking cancelled successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return { background: '#d1fae5', color: '#065f46', border: '#a7f3d0' };
      case 'cancelled':
        return { background: '#fee2e2', color: '#991b1b', border: '#fecaca' };
      case 'pending':
        return { background: '#fef3c7', color: '#92400e', border: '#fde68a' };
      default:
        return { background: '#f3f4f6', color: '#374151', border: '#d1d5db' };
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { background: '#d1fae5', color: '#065f46' };
      case 'refunded':
        return { background: '#e0e7ff', color: '#3730a3' };
      case 'failed':
        return { background: '#fee2e2', color: '#991b1b' };
      case 'pending':
        return { background: '#fef3c7', color: '#92400e' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcomingEvent = (eventDate) => {
    return new Date(eventDate) > new Date();
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
        Loading your bookings...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "40px 20px", 
      maxWidth: "1200px", 
      margin: "0 auto",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f8fafc",
      minHeight: "100vh"
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "40px" 
      }}>
        <h1 style={{ 
          fontSize: "2.5rem", 
          color: "#1a202c", 
          marginBottom: "10px",
          fontWeight: "700"
        }}>
          My Bookings
        </h1>
        <p style={{ 
          fontSize: "1.1rem", 
          color: "#4a5568" 
        }}>
          Manage your event bookings and reservations
        </p>
      </div>

      {/* Bookings List */}
      <div style={{ 
        display: "grid", 
        gap: "20px" 
      }}>
        {bookings.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "60px 20px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📋</div>
            <h3 style={{ color: "#4a5568", marginBottom: "10px" }}>No bookings yet</h3>
            <p style={{ color: "#718096" }}>Your bookings will appear here once you book an event.</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const statusStyle = getStatusColor(booking.status);
            const paymentStyle = getPaymentStatusColor(booking.paymentStatus);
            const isUpcoming = isUpcomingEvent(booking.event.date);
            const isCancellable = booking.status === 'confirmed' && isUpcoming;

            return (
              <div
                key={booking._id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "25px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  borderLeft: `4px solid ${statusStyle.border}`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                }}
              >
                {/* Header Section */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  gap: "15px"
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: "1.4rem", 
                      color: "#1a202c", 
                      marginBottom: "5px",
                      fontWeight: "600"
                    }}>
                      {booking.event.title}
                    </h3>
                    <p style={{ color: "#4a5568", marginBottom: "10px" }}>
                      {booking.event.venue} • {formatDate(booking.event.date)}
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        background: statusStyle.background,
                        color: statusStyle.color,
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        textTransform: "capitalize"
                      }}
                    >
                      {booking.status}
                    </span>
                    <span
                      style={{
                        background: paymentStyle.background,
                        color: paymentStyle.color,
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        textTransform: "capitalize"
                      }}
                    >
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Booking Details */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                  gap: "20px",
                  marginBottom: "20px"
                }}>
                  <div>
                    <strong style={{ color: "#4a5568" }}>Tickets:</strong>
                    <div style={{ fontSize: "1.2rem", fontWeight: "600", color: "#1a202c" }}>
                      {booking.numberOfTickets} {booking.numberOfTickets === 1 ? 'ticket' : 'tickets'}
                    </div>
                  </div>
                  
                  <div>
                    <strong style={{ color: "#4a5568" }}>Price per ticket:</strong>
                    <div style={{ fontSize: "1.2rem", fontWeight: "600", color: "#1a202c" }}>
                      ₹{booking.event.price}
                    </div>
                  </div>
                  
                  <div>
                    <strong style={{ color: "#4a5568" }}>Total Amount:</strong>
                    <div style={{ fontSize: "1.2rem", fontWeight: "600", color: "#10b981" }}>
                      ₹{booking.totalAmount}
                    </div>
                  </div>
                  
                  <div>
                    <strong style={{ color: "#4a5568" }}>Booking Date:</strong>
                    <div style={{ color: "#4a5568" }}>
                      {formatDate(booking.bookingDate)}
                    </div>
                  </div>
                </div>

                {/* Event Status */}
                <div style={{ 
                  marginBottom: "20px",
                  padding: "10px 15px",
                  background: isUpcoming ? "#f0fff4" : "#f7fafc",
                  border: isUpcoming ? "1px solid #c6f6d5" : "1px solid #e2e8f0",
                  borderRadius: "6px"
                }}>
                  <strong style={{ color: isUpcoming ? "#22543d" : "#4a5568" }}>
                    {isUpcoming ? "🟢 Upcoming Event" : "🔴 Event Completed"}
                  </strong>
                  {!isUpcoming && (
                    <span style={{ color: "#718096", marginLeft: "10px" }}>
                      This event has already taken place
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ 
                  display: "flex", 
                  gap: "15px",
                  justifyContent: "flex-end",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "20px"
                }}>
                  {isCancellable ? (
                    <button
                      onClick={() => cancelBooking(booking._id)}
                      style={{
                        padding: "10px 20px",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        transition: "background 0.2s ease"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#b91c1c"}
                      onMouseLeave={(e) => e.target.style.background = "#dc2626"}
                    >
                      Cancel Booking
                    </button>
                  ) : booking.status === 'cancelled' ? (
                    <span style={{ 
                      color: "#dc2626", 
                      fontStyle: "italic",
                      padding: "10px 0"
                    }}>
                      Booking cancelled
                    </span>
                  ) : !isUpcoming ? (
                    <span style={{ 
                      color: "#718096", 
                      fontStyle: "italic",
                      padding: "10px 0"
                    }}>
                      Event completed
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}