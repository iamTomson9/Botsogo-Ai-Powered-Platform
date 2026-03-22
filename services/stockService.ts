import { db } from "../firebase/config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";

export interface StockRequest {
  id?: string;
  medicationId: string;
  medicationName: string;
  quantity: number;
  clinicId: string;
  clinicName: string;
  status: 'pending' | 'approved' | 'denied' | 'shipped';
  notes?: string;
  createdAt: any;
}

export const requestMedication = async (data: Omit<StockRequest, 'id' | 'createdAt' | 'status'>) => {
  return addDoc(collection(db, "stock_requests"), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

export const getMyClinicRequests = async (clinicId: string) => {
  const q = query(
    collection(db, "stock_requests"),
    where("clinicId", "==", clinicId)
  );
  const snap = await getDocs(q);

  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as StockRequest))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const getAllStockRequests = async () => {
  const snap = await getDocs(collection(db, "stock_requests"));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as StockRequest))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const updateStockRequestStatus = async (requestId: string, status: StockRequest['status'], notes?: string) => {
  const requestRef = doc(db, "stock_requests", requestId);
  return updateDoc(requestRef, {
    status,
    notes,
    updatedAt: serverTimestamp(),
  });
};
