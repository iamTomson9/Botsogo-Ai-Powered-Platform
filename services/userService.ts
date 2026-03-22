import { db } from "../firebase/config";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'pharmacist' | 'admin';
  assignedClinicId?: string;
  createdAt?: any;
}

// Get all users
export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
};

// Update user role
export const updateUserRole = async (userId: string, role: UserProfile['role']) => {
  const userRef = doc(db, "users", userId);
  return updateDoc(userRef, { role, updatedAt: new Date() });
};

// Update user profile
export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", userId);
  return updateDoc(userRef, { ...data, updatedAt: new Date() });
};

// Delete user (Note: This only deletes the Firestore doc, not the Auth account)
export const deleteUserDoc = async (userId: string) => {
  return deleteDoc(doc(db, "users", userId));
};
