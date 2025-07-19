import Vapi from "@vapi-ai/web";

export const vapi = new Vapi(import.meta.env.VITE_VAPI_API_KEY);
const assistantId = import.meta.env.VITE_ASSISTANT_ID;

export const startAssistant = async (firstName, lastName, email, phone, daysString, currentDate) => {
  const assistantOverrides = {
    variableValues: {
      firstName,
      lastName,
      email,
      phone,
      daysString,
      currentDate
    },
  };
  return await vapi.start(assistantId, assistantOverrides);
};

export const stopAssistant = () => {
  vapi.stop();
};
