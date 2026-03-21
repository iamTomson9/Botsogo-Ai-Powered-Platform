import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export interface AppUser extends User {
  role?: 'patient' | 'doctor' | 'admin';
  name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch role from Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              ...firebaseUser,
              role: data.role || 'patient',
              name: data.name || firebaseUser.displayName,
            });
          } else {
            // Default to patient if missing
            setUser({ ...firebaseUser, role: 'patient' });
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUser({ ...firebaseUser, role: 'patient' });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
