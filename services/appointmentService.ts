/**
 * Appointment & Queue Service
 * 
 * Firestore schema:
 * 
 * appointments/{appointmentId}
 *   - patientId: string
 *   - patientName: string
 *   - hospitalId: string
 *   - hospitalName: string
 *   - reason: string
 *   - status: 'waiting' | 'in-progress' | 'done' | 'cancelled'
 *   - queuePosition: number
 *   - createdAt: Timestamp
 * 
 * hospitals/{hospitalId}/queue/{appointmentId} -> mirrors the appointment for fast reads
 */

import {
  collection, doc, addDoc, getDocs, getDoc,
  updateDoc, serverTimestamp, query,
  where, orderBy, onSnapshot, Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ─── Booking ────────────────────────────────────────────────────────────────

export interface Appointment {
  id?: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  hospitalName: string;
  reason: string;
  status: 'waiting' | 'in-progress' | 'done' | 'cancelled';
  queuePosition: number;
  estimatedWaitMinutes: number;
  createdAt?: any;
  triage?: {
    severity: 'low' | 'moderate' | 'high' | 'critical' | 'clinical';
    triageCategory: string;
    patientSummary: string;
    chiefComplaint: string;
    recommendedScreenings: string[];
    recommendedActions: string[];
    urgency: 'routine' | 'within-24h' | 'immediate';
    patientAge?: number;
    patientGender?: string;
  };
  acceptedBy?: {
    id: string;
    name: string;
  };
}

/** Average minutes per consultation – used to estimate queue wait time */
const AVG_CONSULT_MINUTES = 15;

/**
 * Books a new appointment and returns the created appointment including
 * the queue position and estimated wait time.
 */
export const bookAppointment = async (
  patientId: string,
  patientName: string,
  hospitalId: string,
  hospitalName: string,
  reason: string,
  triage?: Appointment['triage'],
  travelTimeMinutes: number = 0
): Promise<Appointment> => {

  // How many people are already waiting at this hospital?
  const queueRef = collection(db, 'appointments');
  const queueQuery = query(
    queueRef,
    where('hospitalId', '==', hospitalId),
    where('status', '==', 'waiting')
  );
  const snapshot = await getDocs(queueQuery);
  const currentQueueLength = snapshot.docs.length;
  const queuePosition = currentQueueLength + 1;
  const estimatedWaitMinutes = (queuePosition * AVG_CONSULT_MINUTES) + travelTimeMinutes;

  const appointment: Omit<Appointment, 'id'> = {
    patientId,
    patientName,
    hospitalId,
    hospitalName,
    reason,
    status: 'waiting',
    queuePosition,
    estimatedWaitMinutes,
    createdAt: serverTimestamp(),
    triage,
  };

  const docRef = await addDoc(collection(db, 'appointments'), appointment);
  return { ...appointment, id: docRef.id };
};

// ─── Real-time subscription for a patient's own appointment ─────────────────

/**
 * Listens for a patient's active (waiting / in-progress) appointments.
 * Calls `onUpdate` with the live list whenever Firestore changes.
 * Returns an unsubscribe function to clean up listeners.
 */
export const subscribeToPatientQueue = (
  patientId: string,
  onUpdate: (appointments: Appointment[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'appointments'),
    where('patientId', '==', patientId),
    where('status', 'in', ['waiting', 'in-progress']),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as Appointment));
    onUpdate(appointments);
  });
};

// ─── Real-time subscription for a hospital's queue (used by Doctor) ──────────

export const subscribeToHospitalQueue = (
  hospitalId: string,
  onUpdate: (appointments: Appointment[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'appointments'),
    where('hospitalId', '==', hospitalId),
    where('status', 'in', ['waiting', 'in-progress']),
    orderBy('queuePosition', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as Appointment));
    onUpdate(appointments);
  });
};

// ─── Doctor updates status ────────────────────────────────────────────────────

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: Appointment['status']
) => {
  const ref = doc(db, 'appointments', appointmentId);
  await updateDoc(ref, { status });
};

/**
 * Marks an appointment as accepted by a specific doctor.
 * Updates status to 'in-progress'.
 */
export const acceptAppointment = async (
  appointmentId: string,
  doctorId: string,
  doctorName: string
) => {
  const ref = doc(db, 'appointments', appointmentId);
  const snap = await getDoc(ref);
  
  if (!snap.exists()) throw new Error("Appointment not found");
  const appointment = snap.data() as Appointment;

  // 1. Update appointment status
  await updateDoc(ref, {
    status: 'in-progress',
    acceptedBy: {
      id: doctorId,
      name: doctorName
    }
  });

  // 2. Post Clinical Brief to Chat
  if (appointment.triage) {
    // Consistent chat ID format: [patientId]_[doctorId]
    const chatId = `${appointment.patientId}_${doctorId}`;
    const t = appointment.triage;
    
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: `🏥 CLINICAL BRIEF: ${t.triageCategory.toUpperCase()}\n\nChief Complaint: ${t.chiefComplaint}\n\nSummary: ${t.patientSummary}\n\nRecommended Actions: ${t.recommendedActions.join(", ")}\n\n(Generated by Botsogo AI)`,
        senderId: "system_ai",
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("Could not post brief to chat:", err);
    }
  }
};
