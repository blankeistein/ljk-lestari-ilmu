import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthService } from "@/lib/services/auth-service";
import type { UserProfile } from "@/types/user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch user role/profile from Firestore
        try {
          const userProfile = await AuthService.getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setProfile({
              ...userProfile,
              email: userProfile.email || firebaseUser.email,
              displayName: userProfile.displayName || firebaseUser.displayName,
            });
          } else {
            // Default profile for new users
            setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: "user",
              displayName: firebaseUser.displayName,
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, loading, isAuthenticated: !!user };
}
