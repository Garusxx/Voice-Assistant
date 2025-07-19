import { useState, useEffect } from "react";
import "./Calendar.css";

const randomBoolean = () => Math.random() < 0.5;

function Calendar({ days, setDays }) {
  useEffect(() => {
    const generateDays = () => {
      const result = [];
      const today = new Date();
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayOfWeek = date.getDay();

        let sessions;
        if (dayOfWeek === 0) {
          sessions = [
            { time: "9:00-13:00", available: false },
            { time: "14:00-18:00", available: false },
          ];
        } else if (dayOfWeek === 6) {
          sessions = [
            { time: "9:00-13:00", available: true },
            { time: "14:00-18:00", available: false },
          ];
        } else {
          sessions = [
            { time: "9:00-13:00", available: randomBoolean() },
            { time: "14:00-18:00", available: randomBoolean() },
          ];
        }

        result.push({
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          date: date.toLocaleDateString("en-US"),
          sessions: sessions,
        });
      }
      return result;
    };

    setDays(generateDays());
  }, [setDays]);

  useEffect(() => {
    console.log(days);
  }, [days]);

  return (
    <>
      <div className="calendar-container">
        <h1>Calendar</h1>
        <div className="calendar-grid">
          {days.map((day, index) => {
            const [month, date, year] = day.date.split("/");
            return (
              <div className="calendar-day-container" key={index}>
                <div key={index} className="calendar-day">
                  <div id="monthName">
                    {new Date(day.date).toLocaleString("en-US", {
                      month: "long",
                    })}
                  </div>
                  <div id="dayName">{day.day}</div>
                  <div id="dayNumber">{date}</div>

                  <ul>
                    {day.sessions.map((session, idx) => (
                      <li
                        key={idx}
                        className={`session-item ${
                          session.available ? "available" : "unavailable"
                        } ${
                          session.time === "14:00-18:00" ? "rounded-bottom" : ""
                        }`}
                      >
                        {session.time}{" "}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Calendar;
