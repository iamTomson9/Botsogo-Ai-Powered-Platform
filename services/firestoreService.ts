import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";

// Create Patient Profile
export const createPatientProfile = async (userId: string, data: any) => {
  return addDoc(collection(db, "patients"), {
    userId,
    ...data,
    createdAt: new Date(),
  });
};

// Get all clinics
export const getClinics = async () => {
  const snapshot = await getDocs(collection(db, "clinics"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Get nearby clinics by geolocation
export const getNearByClinics = async (userLat: number, userLng: number, radiusKm = 5) => {
  const clinics = await getClinics();
  return clinics
    .filter((clinic: any) => {
      const distance = calculateDistance(userLat, userLng, clinic.latitude, clinic.longitude);
      return distance <= radiusKm;
    })
    .sort((a: any, b: any) => {
      const distA = calculateDistance(userLat, userLng, a.latitude, a.longitude);
      const distB = calculateDistance(userLat, userLng, b.latitude, b.longitude);
      return distA - distB;
    });
};

// Book appointment
export const bookAppointment = async (
  patientId: string,
  doctorId: string,
  clinicId: string,
  dateTime: string,
  reason: string
) => {
  return addDoc(collection(db, "appointments"), {
    patientId,
    doctorId,
    clinicId,
    dateTime: new Date(dateTime),
    reason,
    status: "scheduled",
    createdAt: new Date(),
  });
};

// Add symptom input
export const addSymptomInput = async (patientId: string, symptoms: string, severity: string) => {
  return addDoc(collection(db, "ai_interactions"), {
    patientId,
    symptoms,
    severity,
    timestamp: new Date(),
    aiResponse: null,
  });
};

// Track patient in queue
export const updatePatientQueue = async (appointmentId: string, stage: string, estimatedWait: number) => {
  return updateDoc(doc(db, "appointments", appointmentId), {
    queueStage: stage,
    estimatedWaitTime: estimatedWait,
    lastUpdated: new Date(),
  });
};

// Real-time listener for appointments
export const listenToAppointments = (patientId: string, callback: (data: any[]) => void) => {
  const q = query(
    collection(db, "appointments"),
    where("patientId", "==", patientId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// Helpers
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
