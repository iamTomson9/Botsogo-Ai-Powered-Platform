import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy, limit, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getPatientMedicalRecords } from './appointmentService';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const INSIGHT_PROMPT = `You are a clinical AI auditor. Analyze the provided medical records and triage history.
Generate a professional, longitudinal health audit including:
1. **Clinical Summary**: High-level overview of the patient's current health state.
2. **Health Trajectory**: Is the patient's condition stable, improving, or requiring intervention?
3. **Recurring Trends**: Identify any chronic conditions or symptoms that appear across multiple visits.
4. **Key Medications**: List the core medications they have been prescribed.
5. **Next Steps & Risks**: Specific clinical advice or risks the doctor and patient should be aware of.

Format the output in clean Markdown with professional headings. KEEP IT CONCISE AND CLINICAL.
Data provided below:
`;

export interface PatientInsight {
  patientId: string;
  summary: string;
  updatedAt: any;
}

export const getPatientInsights = async (patientId: string): Promise<PatientInsight | null> => {
  if (!patientId) return null;
  const ref = doc(db, 'patient_insights', patientId);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as PatientInsight;
  return null;
};

export const generatePatientInsights = async (patientId: string): Promise<string> => {
  try {

    const records = await getPatientMedicalRecords(patientId);

    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId)
    );
    const apptsSnap = await getDocs(q);
    const allAppts = apptsSnap.docs.map(d => d.data());

    const appts = allAppts
      .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 5);

    if (records.length === 0 && appts.length === 0) {
      return "No sufficient clinical history available to generate insights yet.";
    }

    const historyText = records.map(r => 
      `Date: ${r.createdAt?.toDate().toLocaleDateString()}, Type: ${r.type}, Diagnosis: ${r.diagnosis}, Details: ${JSON.stringify(r.details)}`
    ).join('\n');

    const triageText = appts.map(a => 
      `Date: ${a.createdAt?.toDate().toLocaleDateString()}, Reason: ${a.reason}, Triage: ${a.triage?.triageCategory}, Summary: ${a.triage?.patientSummary}`
    ).join('\n');

    const fullPrompt = `${INSIGHT_PROMPT}\n\nMEDICAL RECORDS:\n${historyText}\n\nTRIAGE HISTORY:\n${triageText}`;

    const payload = {
      model: 'gemini-2.0-flash', // Using flash for speed/cost
      messages: [
        { role: 'user', content: fullPrompt }
      ]
    };

    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GEMINI_API_KEY}` },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    const summary = data.choices?.[0]?.message?.content || "Could not generate summary at this time.";

    await setDoc(doc(db, 'patient_insights', patientId), {
      patientId,
      summary,
      updatedAt: serverTimestamp()
    });

    return summary;
  } catch (e) {
    console.error("Error generating insights:", e);
    return "Error analyzing patient history. Please try again later.";
  }
};
