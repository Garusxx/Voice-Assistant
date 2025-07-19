const AssistantSpeechIndicator = ({ isSpeaking }) => {
    return (
      <div className="loader-text">
          {isSpeaking ? "Assistant Speaking" : "Assistant Not Speaking"}
      </div>
    );
  };
  
  export default AssistantSpeechIndicator