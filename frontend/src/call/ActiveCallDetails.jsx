import AssistantSpeechIndicator from "./AssistantSpeechIndicator";
import "../index.css";

const ActiveCallDetails = ({
  assistantIsSpeaking,
  volumeLevel,
  endCallCallback,
}) => {
  return (
    <div className="loader-container">
      <div className="loader-text">
        <AssistantSpeechIndicator isSpeaking={assistantIsSpeaking} />
      </div>
      <button className="retro-button-filled" onClick={endCallCallback}>
        End Call
      </button>
    </div>
  );
};

export default ActiveCallDetails;
