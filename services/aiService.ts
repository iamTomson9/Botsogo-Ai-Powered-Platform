import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import axios from 'axios';

const BOTPRESS_WEBHOOK = process.env.EXPO_PUBLIC_BOTPRESS_WEBHOOK || "";

export const sendSymptomToBotpress = async (patientId: string, symptoms: string) => {
  try {
    const response = await axios.post(BOTPRESS_WEBHOOK, {
      conversationId: patientId,
      payload: {
        type: 'text',
        text: `Patient reports: ${symptoms}`,
      },
    });

    await addDoc(collection(db, 'ai_interactions'), {
      patientId,
      userInput: symptoms,
      aiResponse: response.data.messages || ["Analyzed"],
      timestamp: new Date(),
      severity: extractSeverity(response.data.messages || []),
    });

    return response.data;
  } catch (error) {
    console.error('AI Service Error:', error);
    return null;
  }
};

const extractSeverity = (aiResponse: any[]) => {
  const text = aiResponse.join(' ').toLowerCase();
  if (text.includes('urgent') || text.includes('emergency')) return 'critical';
  if (text.includes('soon') || text.includes('moderate')) return 'moderate';
  return 'mild';
};

export const getAICaseSummary = async (patientId: string) => {
  const q = query(
    collection(db, 'ai_interactions'),
    where('patientId', '==', patientId)
  );
  const snapshot = await getDocs(q);
  const interactions = snapshot.docs.map((d) => d.data());

  return {
    patientHistory: interactions,
    commonSymptoms: {},
    severityPattern: 'stable',
    recommendation: `Based on patient's ${interactions.length} interactions...`,
  };
};
