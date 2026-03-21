import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export interface AppUser extends User {
  role?: 'patient' | 'doctor' | 'admin' | 'pharmacist';
  name?: string;
  dob?: string;
  gender?: string;
  assignedClinicId?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch role and other info from Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              ...firebaseUser,
              role: data.role || 'patient',
              name: data.name || firebaseUser.displayName || '',
              dob: data.dob || '',
              gender: data.gender || '',
              assignedClinicId: data.assignedClinicId || '',
            });
          } else {
            // Default to patient if missing
            setUser({ ...firebaseUser, role: 'patient' });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser({ ...firebaseUser, role: 'patient' });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = async (data: Partial<AppUser>) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, data);
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...data } : null);
      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
    }
  };

  const logout = () => auth.signOut();

  return { user, loading, updateProfile, logout };
}
