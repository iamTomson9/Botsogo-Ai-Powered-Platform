// Using Google Gemini's new API which natively supports OpenAI formats for free
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
}

// Mock Patient Context
const PATIENT_CONTEXT = {
  name: "John Doe",
  age: 34,
  gender: "Male",
  medicalRecords: "Asthma, Hypertension",
  allergies: "Penicillin",
  nextAppointment: "None scheduled"
};

const SYSTEM_PROMPT = `You are Botsogo Health AI Assistant. You are currently speaking with ${PATIENT_CONTEXT.name}, a ${PATIENT_CONTEXT.age} year old ${PATIENT_CONTEXT.gender}.
Medical History: ${PATIENT_CONTEXT.medicalRecords}. Allergies: ${PATIENT_CONTEXT.allergies}. Next Appointment: ${PATIENT_CONTEXT.nextAppointment}.

Your duties:
1. Answer health-related questions accurately and empathetic.
2. Analyze patient symptoms to determine severity (urgent vs routine).
3. If the issue is severe/urgent, you MUST call the 'bookAppointment' tool to automatically book an appointment at the nearest hospital.
4. If the issue is less/medium risk, ask the patient if they want to be redirected to a human representative, and if they say yes, call the 'escalateToHuman' tool.
Be concise, helpful, and reassuring.`;

const tools = [
  {
    type: "function",
    function: {
      name: "bookAppointment",
      description: "Automatically book an appointment at the nearest hospital for a patient with severe or urgent symptoms.",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string", description: "The medical reason for the urgent appointment" },
          severityLevel: { type: "string", enum: ["high", "critical"] }
        },
        required: ["reason", "severityLevel"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "escalateToHuman",
      description: "Connect the patient to a human representative for medium-risk or routine concerns when requested.",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string", description: "Reason for escalation" }
        },
        required: ["reason"]
      }
    }
  }
];

export const sendChatRequest = async (messages: Message[]): Promise<Message> => {
  try {
    const payload = {
      model: "gemini-2.5-flash", // Powerful, completely free model by Google
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      tools: tools,
      tool_choice: "auto",
    };

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.choices[0].message;
  } catch (err: any) {
    console.error("OpenAI API Error:", err);
    throw err;
  }
};

export const handleToolCalls = async (toolCalls: any[]): Promise<Message[]> => {
  const toolResponses: Message[] = [];
  
  for (const toolCall of toolCalls) {
    const functionName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);
    
    let result = "";
    
    if (functionName === 'bookAppointment') {
      console.log("TOOL CALL [bookAppointment]:", args);
      
      // Simulate mapping generic closest active hospital
      let bookedHospitalName = "General Hospital";
      try {
        const clinicsData = require('../../clinics.json');
        const activeClinics = clinicsData.filter((c: any) => c.operationalStatus?.display === 'Active' && c.name);
        if (activeClinics.length > 0) {
          // Shuffle or pick random nearest for demo
          const randomNearest = activeClinics[Math.floor(Math.random() * Math.min(20, activeClinics.length))];
          bookedHospitalName = randomNearest.name;
        }
      } catch (err) {
        console.warn("Could not load clinics data for AI routing.");
      }

      result = JSON.stringify({
        status: "success",
        bookedHospital: bookedHospitalName,
        appointmentTime: "Immediate / Walk-in Alert Sent to Doctor Queue",
        message: `Tell the user their appointment is booked at ${bookedHospitalName} and a doctor queue has been alerted to prepare for their arrival.`
      });
    } else if (functionName === 'escalateToHuman') {
      console.log("TOOL CALL [escalateToHuman]:", args);
      result = JSON.stringify({
        status: "success",
        message: "Tell the user that a human representative will join the chat shortly."
      });
    }

    toolResponses.push({
      tool_call_id: toolCall.id,
      role: "tool",
      content: result
    });
  }
  
  return toolResponses;
};
