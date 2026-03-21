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
2. Analyze patient symptoms through conversation (gather duration, onset, severity, associated symptoms).
3. Once you have enough information (usually after 3-4 exchanges), you MUST call the 'analyseAndBook' tool to provide a full clinical triage report and book an appointment.
4. Categorize severity as:
   - 'low': Minor issues, routine care.
   - 'moderate': Needs attention but not life-threatening.
   - 'high': Severe symptoms requiring urgent care.
   - 'critical': Life-threatening emergencies.
   - 'clinical': Follow-ups, chronic management, or non-acute clinical needs.
5. Provide specific recommended screenings (e.g., "MRA for migraine vs headache") and doctor actions.
Be professional, medical-grade, and reassuring.`;

const tools = [
  {
    type: "function",
    function: {
      name: "analyseAndBook",
      description: "Analyze symptoms, categorize risk, and book an appointment with a structured triage report for the doctor.",
      parameters: {
        type: "object",
        properties: {
          chiefComplaint: { type: "string", description: "The primary symptom reported" },
          patientSummary: { type: "string", description: "1-2 sentence clinical summary of the patient's state" },
          severity: { type: "string", enum: ["low", "moderate", "high", "critical", "clinical"] },
          triageCategory: { type: "string", description: "Human-readable category (e.g. High Risk)" },
          recommendedScreenings: { type: "array", items: { type: "string" }, description: "Specific medical tests or screenings recommended" },
          recommendedActions: { type: "array", items: { type: "string" }, description: "Specific actions for the doctor to take" },
          urgency: { type: "string", enum: ["routine", "within-24h", "immediate"] },
          hospitalName: { type: "string", description: "Choose a suitable hospital name from context or leave generic" }
        },
        required: ["chiefComplaint", "patientSummary", "severity", "triageCategory", "recommendedScreenings", "recommendedActions", "urgency"]
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
    
    if (functionName === 'analyseAndBook') {
      console.log("TOOL CALL [analyseAndBook]:", args);
      
      let bookedHospitalName = args.hospitalName || "General Hospital";
      try {
        const clinicsData = require('../../clinics.json');
        const activeClinics = clinicsData.filter((c: any) => c.operationalStatus?.display === 'Active' && c.name);
        if (activeClinics.length > 0 && !args.hospitalName) {
          const randomNearest = activeClinics[Math.floor(Math.random() * Math.min(20, activeClinics.length))];
          bookedHospitalName = randomNearest.name;
        }
      } catch (err) {
        console.warn("Could not load clinics data.");
      }

      // Hardcode a user ID for demo purposes
      const userId = "demo-user-123"; 

      try {
        const { bookAppointment } = require('./appointmentService');
        await bookAppointment(
          userId,
          PATIENT_CONTEXT.name,
          bookedHospitalName, // as ID for demo
          bookedHospitalName,
          args.chiefComplaint,
          {
            severity: args.severity,
            triageCategory: args.triageCategory,
            patientSummary: args.patientSummary,
            chiefComplaint: args.chiefComplaint,
            recommendedScreenings: args.recommendedScreenings,
            recommendedActions: args.recommendedActions,
            urgency: args.urgency,
          }
        );
      } catch (err) {
        console.error("Booking error:", err);
      }

      result = JSON.stringify({
        status: "success",
        bookedHospital: bookedHospitalName,
        triageReport: args,
        message: `Appointment booked at ${bookedHospitalName}. A triage report has been sent to the clinical team.`
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
