import { signOut, GoogleAuthProvider, signInWithPopup, type UserCredential } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@/types/user";

export const AuthService = {
  async logout(): Promise<void> {
    return signOut(auth);
  },

  async loginWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },

  async loginWithEmail(email: string, pass: string): Promise<UserCredential> {
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    return signInWithEmailAndPassword(auth, email, pass);
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return {
        uid: uid,
        ...(userDoc.data() as Partial<UserProfile>),
      } as UserProfile;
    }
    return null;
  },

  async createUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      ...data,
      uid,
      role: data.role || "teacher",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};
