import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userDocRef = doc(db, "users", authUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser({ ...authUser, ...userDoc.data() });
          } else {
            const localRole = (await AsyncStorage.getItem(`botsogo_role_${authUser.uid}`)) || "patient";
            const localName = (await AsyncStorage.getItem(`botsogo_name_${authUser.uid}`)) || "User";
            setUser({ ...authUser, role: localRole, name: localName });
          }
        } catch (error) {
          console.error("Firestore user fetch error:", error);
          const localRole = (await AsyncStorage.getItem(`botsogo_role_${authUser.uid}`)) || "patient";
          const localName = (await AsyncStorage.getItem(`botsogo_name_${authUser.uid}`)) || "User";
          setUser({ ...authUser, role: localRole, name: localName });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, name: string, role: string) => {
    const authResult = await createUserWithEmailAndPassword(auth, email, password);
    await AsyncStorage.setItem(`botsogo_role_${authResult.user.uid}`, role);
    await AsyncStorage.setItem(`botsogo_name_${authResult.user.uid}`, name);
    try {
      await setDoc(doc(db, "users", authResult.user.uid), {
        email,
        name,
        role,
        createdAt: new Date(),
        profileComplete: false,
      });
    } catch (error) {
      console.warn("Could not save to Firestore, Auth succeeded using local fallback.", error);
    }
  };

  const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    return firebaseSignOut(auth);
  };

  return { user, loading, signup, login, logout };
}
