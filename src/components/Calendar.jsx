import React, { useState, useEffect } from "react";
import "./Calendar.css";

const Calendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: "", time: "" });
  const [editingIndex, setEditingIndex] = useState(null);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Load events from localStorage
  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem("simplytime-events")) || {};
    setEvents(storedEvents);
  }, []);

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem("simplytime-events", JSON.stringify(events));
  }, [events]);

  // Get number of days in the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null); // empty spaces
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Handle opening modal
  const openModal = (day, event = null, index = null) => {
    if (!day) return;
    const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
    setSelectedDate(dateKey);

    if (event) {
      setNewEvent({ title: event.title, time: event.time });
      setEditingIndex(index);
    } else {
      setNewEvent({ title: "", time: "" });
      setEditingIndex(null);
    }
  };

  // Handle saving or editing event
  const saveEvent = () => {
    if (!newEvent.title) return;
    setEvents((prev) => {
      const updated = { ...prev };
      if (!updated[selectedDate]) updated[selectedDate] = [];

      if (editingIndex !== null) {
        updated[selectedDate][editingIndex] = newEvent; // edit existing
      } else {
        updated[selectedDate].push(newEvent); // add new
      }
      return updated;
    });
    setSelectedDate(null); // close modal
  };

  // Handle delete event
  const deleteEvent = (dateKey, index) => {
    setEvents((prev) => {
      const updated = { ...prev };
      updated[dateKey].splice(index, 1);
      if (updated[dateKey].length === 0) delete updated[dateKey]; // remove empty dates
      return updated;
    });
  };

  // Generate a sorted list of upcoming events
  const upcomingEvents = Object.keys(events)
    .map((date) => events[date].map((e, i) => ({ ...e, date, index: i })))
    .flat()
    .sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time || "00:00"}`);
      const bDate = new Date(`${b.date}T${b.time || "00:00"}`);
      return aDate - bDate;
    });

  return (
    <div className="calendar-container">
      <div className="calendar-main">
        <div className="calendar-header">
          <button onClick={prevMonth}>⬅</button>
          <h2>{months[currentMonth]} {currentYear}</h2>
          <button onClick={nextMonth}>➡</button>
        </div>

        <div className="calendar-grid">
          {days.map((day) => (
            <div key={day} className="day-name">{day}</div>
          ))}
          {calendarDays.map((day, index) => {
            const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
            return (
              <div 
                key={index} 
                className={`day ${day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear() ? "today" : ""}`}
                onClick={() => openModal(day)}
              >
                {day || ""}
                {events[dateKey]?.map((e, i) => (
                  <div key={i} className="event">
                    <span>{e.time ? `${e.time} - ` : ""}{e.title}</span>
                    <div className="event-actions">
                      <button onClick={(ev) => {ev.stopPropagation(); openModal(day, e, i);}}>✏</button>
                      <button onClick={(ev) => {ev.stopPropagation(); deleteEvent(dateKey, i);}}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        <h3>Upcoming Events</h3>
        {upcomingEvents.length === 0 && <p>No upcoming events</p>}
        <ul>
          {upcomingEvents.map((e, idx) => (
            <li key={idx}>
              <strong>{e.date}</strong> {e.time ? `${e.time} - ` : ""}{e.title}
              <div className="event-actions">
                <button onClick={() => openModal(new Date(e.date).getDate(), e, e.index)}>✏</button>
                <button onClick={() => deleteEvent(e.date, e.index)}>🗑</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {selectedDate && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingIndex !== null ? "Edit Event" : "Add Event"} for {selectedDate}</h3>
            <input
              type="text"
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            />
            <div className="modal-actions">
              <button onClick={saveEvent}>{editingIndex !== null ? "Update" : "Save"}</button>
              <button onClick={() => setSelectedDate(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
