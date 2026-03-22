// Using Google Gemini's new API which natively supports OpenAI formats for free
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
}

const getSystemPrompt = (userContext?: { name: string; age?: number; gender?: string; medicalRecords?: string; allergies?: string; nextAppointment?: string }) => {
  const name = userContext?.name || "Patient";
  const age = userContext?.age || 34;
  const gender = userContext?.gender || "User";
  const history = userContext?.medicalRecords || "None provided";
  const allergies = userContext?.allergies || "None known";
  const nextAppt = userContext?.nextAppointment || "None scheduled";

  return `You are Botsogo Health AI Assistant. You are currently speaking with ${name}, a ${age} year old ${gender}.
Medical History: ${history}. Allergies: ${allergies}. Next Appointment: ${nextAppt}.

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
};

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
          hospitalName: { type: "string", description: "Choose a suitable hospital name from context or leave generic" },
          patientAge: { type: "number", description: "The patient's age as mentioned in chat or known context" },
          patientGender: { type: "string", description: "The patient's gender as mentioned in chat or known context" }
        },
        required: ["chiefComplaint", "patientSummary", "severity", "triageCategory", "recommendedScreenings", "recommendedActions", "urgency", "patientAge", "patientGender"]
      }
    }
  }
];

export const sendChatRequest = async (messages: Message[], userContext?: any): Promise<Message> => {
  try {
    const payload = {
      model: "gemini-2.0-flash", 
      messages: [{ role: "system", content: getSystemPrompt(userContext) }, ...messages],
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

export const handleToolCalls = async (toolCalls: any[], userContext?: { uid?: string, name?: string, currentLocation?: { latitude: number, longitude: number } | null, [key: string]: any }): Promise<Message[]> => {
  const toolResponses: Message[] = [];
  
  for (const toolCall of toolCalls) {
    const functionName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);
    
    let result = "";
    
    if (functionName === 'analyseAndBook') {
      console.log("TOOL CALL [analyseAndBook]:", args);
      
      let bookedHospitalName = args.hospitalName || "General Hospital";
      let distanceKm: number | null = null;
      let etaMinutes: number | null = null;

      try {
        const clinicsData = require('../clinics.json');
        const activeClinics = clinicsData.filter((c: any) => c.operationalStatus?.display === 'Active' && c.name);
        
        if (activeClinics.length > 0 && !args.hospitalName) {
          if (userContext?.currentLocation) {
            const { latitude, longitude } = userContext.currentLocation;
            
            // Haversine formula helper
            const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
              const R = 6371;
              const dLat = (lat2 - lat1) * (Math.PI / 180);
              const dLon = (lon2 - lon1) * (Math.PI / 180);
              const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              return R * c;
            };

            const sortedClinics = activeClinics.map((c: any) => ({
              ...c,
              distance: c.position ? calculateDistance(latitude, longitude, c.position.latitude, c.position.longitude) : Infinity
            })).sort((a: any, b: any) => a.distance - b.distance);

            const nearest = sortedClinics[0];
            bookedHospitalName = nearest.name;
            if (nearest.distance !== Infinity) {
              const d = nearest.distance as number;
              distanceKm = d;
              // Mock ETA: 2 mins per km + 5 mins buffer
              etaMinutes = Math.round(d * 2 + 5);
            }
          } else {
            const randomNearest = activeClinics[Math.floor(Math.random() * Math.min(20, activeClinics.length))];
            bookedHospitalName = randomNearest.name;
          }
        }
      } catch (err) {
        console.warn("Could not load clinics data or calculate distance.");
      }

      // Use dynamic user context
      const userId = userContext?.uid || "anonymous-patient"; 
      let patientName = userContext?.name || "Patient";
      let patientAge = args.patientAge || 34;
      let patientGender = userContext?.gender || args.patientGender || "Unknown";

      // Calculate age from DOB if available
      if (userContext?.dob) {
          const birthDate = new Date(userContext.dob);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
          }
          if (!isNaN(age)) patientAge = age;
      }

      try {
        const { bookAppointment } = require('./appointmentService');
        
        const fullAppointment = await bookAppointment(
          userId,
          patientName,
          bookedHospitalName, 
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
            patientAge: patientAge,
            patientGender: patientGender,
          },
          etaMinutes || 0
        );
        const appointmentId = fullAppointment.id;
 
        // Escalation Chat: Post a system message to a mock chat ID
        // In a real app, this would be the actual chat between the patient and current medical team
        const chatId = "doctor_escalation_channel"; 
        const { addDoc, collection, serverTimestamp } = require('firebase/firestore');
        const { db } = require('../firebase/config');
        
        // 3. Create Escalation Record for Doctor's Dashboard
        await addDoc(collection(db, 'escalations'), {
          patientId: userId,
          patientName: patientName,
          hospitalName: bookedHospitalName,
          summary: args.patientSummary,
          severity: args.severity, // low | medium | high
          status: 'pending',
          appointmentId: appointmentId,
          aiChatHistory: (userContext?.messages || []).filter((m: any) => m.role === 'user' || m.role === 'assistant'),
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.error("Error in AI tool execution:", e);
      }

      result = JSON.stringify({
        status: "success",
        bookedHospital: bookedHospitalName,
        distance: distanceKm,
        eta: etaMinutes,
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
