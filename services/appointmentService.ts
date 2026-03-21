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
  collection, doc, addDoc, getDocs,
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
  reason: string
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
  const estimatedWaitMinutes = queuePosition * AVG_CONSULT_MINUTES;

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
