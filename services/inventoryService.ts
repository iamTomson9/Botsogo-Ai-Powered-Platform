import { 
  collection, doc, getDocs, getDoc, 
  updateDoc, increment, runTransaction, 
  serverTimestamp, addDoc, query, where, onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Medication {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
}

const COLLECTION_NAME = 'medications';

/**
 * Seeds the initial inventory into Firestore if empty.
 */
export const seedInventory = async (initialData: Omit<Medication, 'id'>[]) => {
  const colRef = collection(db, COLLECTION_NAME);
  const snapshot = await getDocs(colRef);
  
  if (snapshot.empty) {
    console.log("Seeding inventory...");
    for (const item of initialData) {
      await addDoc(colRef, {
        ...item,
        createdAt: serverTimestamp()
      });
    }
    return true;
  }
  return false;
};

/**
 * Fetches all medications for the doctor's prescription list.
 */
export const getMedicationsList = async () => {
  console.log("Fetching medications series...");
  const colRef = collection(db, COLLECTION_NAME);
  const snapshot = await getDocs(colRef);
  console.log(`Firestore returned ${snapshot.size} docs.`);
  return snapshot.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name || 'Unknown Medicine',
      category: data.category || 'General',
      unit: data.unit || 'units'
    };
  });
};

export interface PrescribedItem {
  medicationId: string;
  quantity: number;
  instructions: string;
}

/**
 * Handles the prescription of one or more medications with detailed dosage and diagnosis.
 * Uses a transaction to ensure atomic stock deduction.
 */
export const prescribeMedications = async (
  prescribedItems: PrescribedItem[],
  patientId: string,
  doctorId: string,
  doctorName: string,
  diagnosis: string
) => {
  return await runTransaction(db, async (transaction) => {
    const medDocs = [];
    
    // 1. Read all requested medications and check stock
    for (const item of prescribedItems) {
      const ref = doc(db, COLLECTION_NAME, item.medicationId);
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error(`Medicine not found: ${item.medicationId}`);
      
      const data = snap.data() as Medication;
      if (data.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${data.name}. Available: ${data.stock} ${data.unit}`);
      }
      
      medDocs.push({ 
        ref, 
        data, 
        quantity: item.quantity, 
        instructions: item.instructions 
      });
    }

    // 2. Perform deductions
    for (const { ref, quantity } of medDocs) {
      transaction.update(ref, {
        stock: increment(-quantity)
      });
    }

    // 3. Record the detailed prescription
    const prescriptionRef = doc(collection(db, 'prescriptions'));
    const prescriptionData = {
      patientId,
      doctorId,
      doctorName,
      diagnosis,
      items: medDocs.map(m => ({
        medicationId: m.ref.id,
        name: m.data.name,
        quantity: m.quantity,
        unit: m.data.unit,
        instructions: m.instructions
      })),
      status: 'pending',
      createdAt: serverTimestamp()
    };
    transaction.set(prescriptionRef, prescriptionData);

    // 4. Also add to patient's Medical Records
    const recordRef = doc(collection(db, 'medical_records'));
    transaction.set(recordRef, {
      patientId,
      doctorId,
      doctorName,
      date: serverTimestamp(),
      type: 'prescription',
      diagnosis: diagnosis,
      details: {
        prescriptionId: prescriptionRef.id,
        medications: prescriptionData.items.map(i => ({
          name: i.name,
          dosage: `${i.quantity}${i.unit}`,
          instructions: i.instructions
        }))
      },
      createdAt: serverTimestamp()
    });

    return medDocs.map(m => ({
      name: m.data.name,
      quantity: m.quantity,
      unit: m.data.unit,
      instructions: m.instructions
    }));
  });
};
