import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    api.getEvent(id)
      .then((res) => {
        setEvent(res.data.event);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const addSeat = () => {
    if (selectedSeats < event.availableSeats) {
      setSelectedSeats(selectedSeats + 1);
    }
  };

  const removeSeat = () => {
    if (selectedSeats > 0) {
      setSelectedSeats(selectedSeats - 1);
    }
  };

  const handleSeatClick = (index) => {
    const newCount = index + 1;
    if (newCount <= event.availableSeats) {
      setSelectedSeats(newCount);
    }
  };

  const book = async () => {
    if (selectedSeats === 0) {
      alert("Please select at least one seat");
      return;
    }

    setLoading(true);
    try {
      await api.createBooking({ 
        eventId: id, 
        numberOfTickets: selectedSeats
      });
      alert(`Booking successful for ${selectedSeats} seat(s)!`);
      // Refresh event data
      const res = await api.getEvent(id);
      setEvent(res.data.event);
      setSelectedSeats(0);
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (!event) return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "50vh",
      fontSize: "18px",
      color: "#666"
    }}>
      Loading event…
    </div>
  );

  const totalSeats = event.totalSeats;
  const availableSeats = event.availableSeats;
  const bookedSeats = totalSeats - availableSeats;

  return (
    <div style={{ 
      padding: isMobile ? "20px 12px" : "40px 20px", 
      maxWidth: "1000px", 
      margin: "0 auto",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f8fafc",
      minHeight: "100vh"
    }}
    className="event-details-container"
    >
      {/* Event Header */}
      <div style={{ 
        background: "white", 
        padding: isMobile ? "20px" : "30px", 
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        marginBottom: isMobile ? "20px" : "30px"
      }}
      className="event-header"
      >
        <h1 style={{ 
          fontSize: isMobile ? "1.8rem" : "2.5rem", 
          color: "#1a202c", 
          marginBottom: "10px",
          fontWeight: "700",
          lineHeight: "1.2"
        }}>
          {event.title}
        </h1>
        
        <p style={{ 
          fontSize: isMobile ? "1rem" : "1.1rem", 
          color: "#4a5568", 
          lineHeight: "1.6",
          marginBottom: isMobile ? "15px" : "20px"
        }}>
          {event.description}
        </p>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: isMobile ? "15px" : "20px",
          marginTop: isMobile ? "20px" : "25px"
        }}
        className="event-info-grid"
        >
          <div>
            <h3 style={{ 
              color: "#2d3748", 
              marginBottom: "5px",
              fontSize: isMobile ? "1rem" : "1.1rem"
            }}>📅 Date & Time</h3>
            <p style={{ 
              color: "#4a5568",
              fontSize: isMobile ? "0.9rem" : "1rem"
            }}>
              {new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} at {event.time}
            </p>
          </div>
          
          <div>
            <h3 style={{ 
              color: "#2d3748", 
              marginBottom: "5px",
              fontSize: isMobile ? "1rem" : "1.1rem"
            }}>🏟️ Venue</h3>
            <p style={{ 
              color: "#4a5568",
              fontSize: isMobile ? "0.9rem" : "1rem"
            }}>{event.venue}</p>
          </div>
          
          <div>
            <h3 style={{ 
              color: "#2d3748", 
              marginBottom: "5px",
              fontSize: isMobile ? "1rem" : "1.1rem"
            }}>💰 Price</h3>
            <p style={{ 
              color: "#4a5568", 
              fontSize: isMobile ? "1.1rem" : "1.2rem", 
              fontWeight: "600" 
            }}>
              ₹{event.price} per seat
            </p>
          </div>
        </div>
      </div>

      {/* Seat Selection Section */}
      <div style={{ 
        background: "white", 
        padding: isMobile ? "20px" : "30px", 
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}
      className="seat-selection-section"
      >
        <h2 style={{ 
          fontSize: isMobile ? "1.5rem" : "1.8rem", 
          color: "#1a202c", 
          marginBottom: isMobile ? "20px" : "25px",
          textAlign: "center"
        }}>
          Select Number of Seats
        </h2>

        {/* Seat Visualization */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: isMobile ? "20px" : "30px" 
        }}
        className="seat-visualization"
        >
          <div style={{ 
            display: "inline-flex", 
            flexWrap: "wrap", 
            gap: isMobile ? "4px" : "8px", 
            justifyContent: "center",
            maxWidth: isMobile ? "100%" : "600px"
          }}>
            {/* Booked Seats */}
            {Array.from({ length: bookedSeats }).map((_, index) => (
              <div
                key={`booked-${index}`}
                style={{
                  width: isMobile ? "28px" : "35px",
                  height: isMobile ? "28px" : "35px",
                  background: "#cbd5e0",
                  border: "2px solid #a0aec0",
                  borderRadius: "4px",
                  cursor: "not-allowed"
                }}
                title="Booked Seat"
              />
            ))}
            
            {/* Available Seats */}
            {Array.from({ length: availableSeats }).map((_, index) => (
              <div
                key={`available-${index}`}
                style={{
                  width: isMobile ? "28px" : "35px",
                  height: isMobile ? "28px" : "35px",
                  background: index < selectedSeats ? "#48bb78" : "#e2e8f0",
                  border: index < selectedSeats ? "2px solid #38a169" : "2px solid #cbd5e0",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onClick={() => handleSeatClick(index)}
                title={`Select ${index + 1} seat(s)`}
              />
            ))}
          </div>
          
          <p style={{ 
            color: "#718096", 
            marginTop: "12px",
            fontSize: isMobile ? "0.8rem" : "0.9rem"
          }}>
            Click on the seats to select quantity
          </p>
        </div>

        {/* Seat Counter */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: isMobile ? "20px" : "30px",
          padding: isMobile ? "15px" : "20px",
          background: "#f7fafc",
          borderRadius: "8px"
        }}
        className="seat-counter"
        >
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: isMobile ? "15px" : "20px",
            background: "white",
            padding: isMobile ? "12px 20px" : "15px 30px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            flexDirection: isMobile ? "column" : "row"
          }}>
            <button
              onClick={removeSeat}
              disabled={selectedSeats === 0}
              style={{
                width: isMobile ? "44px" : "40px",
                height: isMobile ? "44px" : "40px",
                background: selectedSeats === 0 ? "#e2e8f0" : "#4299e1",
                color: "white",
                border: "none",
                borderRadius: "50%",
                fontSize: isMobile ? "1.4rem" : "1.2rem",
                cursor: selectedSeats === 0 ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              -
            </button>
            
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                fontSize: isMobile ? "2.2rem" : "2rem", 
                fontWeight: "bold", 
                color: "#2d3748" 
              }}>
                {selectedSeats}
              </div>
              <div style={{ 
                fontSize: isMobile ? "0.8rem" : "0.9rem", 
                color: "#718096" 
              }}>
                Seats Selected
              </div>
            </div>
            
            <button
              onClick={addSeat}
              disabled={selectedSeats >= availableSeats}
              style={{
                width: isMobile ? "44px" : "40px",
                height: isMobile ? "44px" : "40px",
                background: selectedSeats >= availableSeats ? "#e2e8f0" : "#4299e1",
                color: "white",
                border: "none",
                borderRadius: "50%",
                fontSize: isMobile ? "1.4rem" : "1.2rem",
                cursor: selectedSeats >= availableSeats ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              +
            </button>
          </div>
          
          <p style={{ 
            color: "#4a5568", 
            marginTop: "12px",
            fontSize: isMobile ? "0.9rem" : "1rem"
          }}>
            {availableSeats} seats available out of {totalSeats}
          </p>
        </div>

        {/* Booking Summary */}
        {selectedSeats > 0 && (
          <div style={{ 
            background: "#f0fff4", 
            padding: isMobile ? "20px" : "25px", 
            borderRadius: "8px",
            marginBottom: isMobile ? "20px" : "25px",
            border: "2px solid #c6f6d5"
          }}
          className="booking-summary"
          >
            <h3 style={{ 
              color: "#22543d", 
              marginBottom: "12px",
              fontSize: isMobile ? "1.1rem" : "1.2rem"
            }}>Booking Summary</h3>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: isMobile ? "10px" : "15px",
              fontSize: isMobile ? "0.9rem" : "1rem"
            }}>
              <div>
                <strong>Seats:</strong> {selectedSeats}
              </div>
              <div>
                <strong>Price per seat:</strong> ₹{event.price}
              </div>
              <div>
                <strong>Total Amount:</strong> ₹{selectedSeats * event.price}
              </div>
            </div>
          </div>
        )}

        {/* Book Button */}
        <div style={{ textAlign: "center" }}
        className="book-button-container"
        >
          <button 
            onClick={book}
            disabled={selectedSeats === 0 || loading}
            style={{
              padding: isMobile ? "14px 24px" : "15px 40px",
              background: selectedSeats === 0 ? "#cbd5e0" : "#48bb78",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: selectedSeats === 0 || loading ? "not-allowed" : "pointer",
              fontSize: isMobile ? "1rem" : "1.1rem",
              fontWeight: "600",
              transition: "all 0.2s ease",
              minWidth: isMobile ? "100%" : "200px",
              width: isMobile ? "100%" : "auto",
              minHeight: "50px"
            }}
          >
            {loading ? "Booking..." : 
             selectedSeats === 0 ? "Select Seats to Book" : 
             `Book ${selectedSeats} Seat(s) - ₹${selectedSeats * event.price}`}
          </button>
        </div>

        {/* Legend */}
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: isMobile ? "15px" : "30px", 
          marginTop: isMobile ? "20px" : "30px",
          fontSize: isMobile ? "12px" : "14px",
          color: "#4a5568",
          flexWrap: "wrap"
        }}
        className="seat-legend"
        >
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "6px" 
          }}>
            <div style={{ 
              width: isMobile ? "16px" : "20px", 
              height: isMobile ? "16px" : "20px", 
              background: "#e2e8f0", 
              border: "2px solid #cbd5e0", 
              borderRadius: "3px" 
            }}></div>
            <span>Available</span>
          </div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "6px" 
          }}>
            <div style={{ 
              width: isMobile ? "16px" : "20px", 
              height: isMobile ? "16px" : "20px", 
              background: "#48bb78", 
              border: "2px solid #38a169", 
              borderRadius: "3px" 
            }}></div>
            <span>Selected</span>
          </div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "6px" 
          }}>
            <div style={{ 
              width: isMobile ? "16px" : "20px", 
              height: isMobile ? "16px" : "20px", 
              background: "#cbd5e0", 
              border: "2px solid #a0aec0", 
              borderRadius: "3px" 
            }}></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .event-details-container {
            padding: 16px 12px !important;
          }
          
          .event-header h1 {
            font-size: 1.6rem !important;
          }
          
          .event-header p {
            font-size: 0.95rem !important;
          }
          
          .seat-selection-section h2 {
            font-size: 1.3rem !important;
          }
          
          .seat-counter > div {
            flex-direction: column !important;
            gap: 12px !important;
          }
        }
        
        @media (max-width: 480px) {
          .event-details-container {
            padding: 12px 8px !important;
          }
          
          .event-header {
            padding: 16px !important;
            margin-bottom: 16px !important;
          }
          
          .event-header h1 {
            font-size: 1.4rem !important;
          }
          
          .seat-selection-section {
            padding: 16px !important;
          }
          
          .seat-selection-section h2 {
            font-size: 1.2rem !important;
            margin-bottom: 16px !important;
          }
          
          .seat-visualization div {
            gap: 3px !important;
          }
          
          .seat-visualization div div {
            width: 24px !important;
            height: 24px !important;
          }
          
          .seat-counter {
            padding: 12px !important;
            margin-bottom: 16px !important;
          }
          
          .booking-summary {
            padding: 16px !important;
            margin-bottom: 16px !important;
          }
          
          .seat-legend {
            gap: 12px !important;
            font-size: 11px !important;
          }
          
          .seat-legend div div {
            width: 14px !important;
            height: 14px !important;
          }
        }
        
        @media (max-width: 320px) {
          .event-header h1 {
            font-size: 1.3rem !important;
          }
          
          .seat-visualization div div {
            width: 22px !important;
            height: 22px !important;
          }
          
          .seat-counter > div {
            padding: 10px 16px !important;
          }
          
          button {
            font-size: 0.9rem !important;
            padding: 12px 20px !important;
          }
        }
        
        /* Touch device improvements */
        @media (hover: none) {
          .seat-visualization div div {
            cursor: pointer;
          }
          
          button:active {
                transform: scale(0.98);
            }
            
            .seat-visualization div div:active {
                transform: scale(0.95);
            }
        }
        
        /* Improve seat selection for very large events */
        @media (max-width: 768px) and (min-width: 481px) {
          .seat-visualization div {
            max-width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}