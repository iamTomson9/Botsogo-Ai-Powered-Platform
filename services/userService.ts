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

export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
};

export const updateUserRole = async (userId: string, role: UserProfile['role']) => {
  const userRef = doc(db, "users", userId);
  return updateDoc(userRef, { role, updatedAt: new Date() });
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", userId);
  return updateDoc(userRef, { ...data, updatedAt: new Date() });
};

export const deleteUserDoc = async (userId: string) => {
  return deleteDoc(doc(db, "users", userId));
};

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth as getSecondaryAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc } from "firebase/firestore";

export const createUserAdmin = async (data: Omit<UserProfile, 'id'>, password: string) => {
  const firebaseConfig = {
    apiKey: "AIzaSyDCeCLiM_tJ9XAVXC_frNww6Dkbepz1Shc",
    authDomain: "ai-hcp267.firebaseapp.com",
    projectId: "ai-hcp267",
    storageBucket: "ai-hcp267.firebasestorage.app",
    messagingSenderId: "215351716227",
    appId: "1:215351716227:web:ad06aaef7d35542908eeb6",
  };

  const secondaryApp = getApps().find(app => app.name === "Secondary") 
    || initializeApp(firebaseConfig, "Secondary");
  
  const secondaryAuth = getSecondaryAuth(secondaryApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, data.email, password);
    const newUid = userCredential.user.uid;

    await updateProfile(userCredential.user, { displayName: data.name });

    await setDoc(doc(db, "users", newUid), {
      ...data,
      id: newUid,
      createdAt: new Date(),
    });

    await secondaryAuth.signOut();
    
    return newUid;
  } catch (error) {
    throw error;
  }
};
