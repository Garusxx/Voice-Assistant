import { useState, useEffect, useRef } from "react";
import { vapi, startAssistant, stopAssistant } from "./ai";
import ActiveCallDetails from "./call/ActiveCallDetails";
import Calendar from "./Calendar";
import "./index.css";

function App() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [callId, setCallId] = useState("");
  const [callResult, setCallResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const [days, setDays] = useState([]);
  const [bookingDay, setBookingDay] = useState([]);
  const [currentDate, setCurrentDate] = useState("");

  const videoRef = useRef(null);

  useEffect(() => {
    vapi
      .on("call-start", () => {
        setLoading(false);
        setStarted(true);
      })
      .on("call-end", () => {
        setStarted(false);
        setLoading(false);
      })
      .on("speech-start", () => {
        setAssistantIsSpeaking(true);
      })
      .on("speech-end", () => {
        setAssistantIsSpeaking(false);
      })
      .on("volume-level", (level) => {
        setVolumeLevel(level);
      });

    setCurrentDate(new Date().toLocaleDateString("en-US"));
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = started ? "/video/Ans_1.mp4" : "/video/Idle_1.mp4";

      videoRef.current.load();
      videoRef.current.play();
    }
  }, [started]);

  useEffect(() => {
    console.log("Days from app", days);
    console.log("Booking day from app", bookingDay);
    console.log("Current date from app", currentDate);
  }, [days, bookingDay]);

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  const convertDaysToString = (days) => {
    return days
      .map((day) => {
        const sessions = day.sessions
          .map(
            (session) =>
              `${session.time} - ${
                session.available ? "Available" : "Unavailable"
              }`
          )
          .join(", ");
        return `${day.day} (${day.date}): ${sessions}`;
      })
      .join("; ");
  };

  const handleStart = async () => {
    setLoading(true);
    const daysString = convertDaysToString(days);
    console.log("Days string", daysString);
    const data = await startAssistant(
      firstName,
      lastName,
      email,
      phoneNumber,
      daysString,
      currentDate
    );
    setCallId(data.id);
  };

  const handleStop = () => {
    stopAssistant();
    getCallDetails();
  };

  const getCallDetails = (interval = 3000) => {
    setLoadingResult(true);
    fetch(`${import.meta.env.VITE_APP_API_URL}/call-details?call_id=` + callId)
      .then((response) => response.json())
      .then((data) => {
        if (data.analysis && data.summary) {
          console.log(data);
          console.log(data.summary);
          console.log(data.analysis.structuredData.bookingDay);
          setCallResult(data);
          setBookingDay(data.analysis.structuredData.bookingDay);
          updateDays(data.analysis.structuredData.bookingDay);
          setLoadingResult(false);
        } else {
          setTimeout(() => getCallDetails(interval), interval);
        }
      })
      .catch((error) => alert(error));
  };

  const updateDays = (bookingDays) => {
    if (!bookingDays || !bookingDays.date || !bookingDays.time) {
      console.warn("Invalid bookingDays", bookingDays);
      return;
    }

    const clean = (str) => str.replace(/\s+/g, "");

    setDays((prevDays) =>
      prevDays.map((day) => {
        const dayDate = new Date(day.date).toISOString().split("T")[0];
        const bookingDate = new Date(bookingDays.date)
          .toISOString()
          .split("T")[0];

        if (dayDate === bookingDate) {
          return {
            ...day,
            sessions: day.sessions.map((session) => {
              if (clean(session.time) === clean(bookingDays.time)) {
                console.log(`Marking session unavailable: ${session.time}`);
                return { ...session, available: false };
              }
              return session;
            }),
          };
        }
        return day;
      })
    );
  };

  const showForm = !loading && !started && !loadingResult && !callResult;
  const allFieldsFilled = firstName && lastName && email && phoneNumber;

  return (
    <div className="app-container">
      <h1 className="title">Sailor's Ink</h1>
      <div className="video-container">
        <video
          ref={videoRef}
          controls
          autoPlay
          loop
          muted
          playsInline
          poster="/img/idle.jpg"
        />
      </div>
      <div className="contact-container">
        {showForm && (
          <>
            <h1>Contact Details</h1>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              className="retro-input"
              onChange={handleInputChange(setFirstName)}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              className="retro-input"
              onChange={handleInputChange(setLastName)}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              className="retro-input"
              onChange={handleInputChange(setEmail)}
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={phoneNumber}
              className="retro-input"
              onChange={handleInputChange(setPhoneNumber)}
            />
            {!started && (
              <button
                onClick={handleStart}
                disabled={!allFieldsFilled}
                className="retro-button-filled"
              >
                Start Call
              </button>
            )}
          </>
        )}
        {loadingResult && (
          <div className="loader-container">
            <p className="loader-text">Loading call details... please wait</p>
            <div className="loader"></div>
          </div>
        )}
        {!loadingResult && callResult && bookingDay && (
          <div className="call-result">
            <div className="call-result-header">
              <h2>Booking Details</h2>
            </div>
            <p>Confirmation sent to:</p>
            <p>{email}</p>
            <p>Time: {bookingDay.time}</p>
            <p>Date: {bookingDay.date}</p>
          </div>
        )}
        {loading && (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        )}
        {started && (
          <div>
            <ActiveCallDetails
              assistantIsSpeaking={assistantIsSpeaking}
              volumeLevel={volumeLevel}
              endCallCallback={handleStop}
            />
          </div>
        )}
      </div>

      <Calendar days={days} setDays={setDays} />
    </div>
  );
}

export default App;
