import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthService } from "@/lib/services/auth-service";
import type { UserProfile } from "@/types/user";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string, firebaseUser: User) => {
    try {
      const userProfile = await AuthService.getUserProfile(uid);
      if (userProfile) {
        setProfile({
          ...userProfile,
          email: userProfile.email || firebaseUser.email,
          name: userProfile.name || firebaseUser.displayName,
        });
      } else {
        const newProfileData: Partial<UserProfile> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: "teacher",
          name: firebaseUser.displayName,
          photoUrl: firebaseUser.photoURL,
        };
        await AuthService.createUserProfile(firebaseUser.uid, newProfileData);
        setProfile(newProfileData as UserProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);

      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid, firebaseUser);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      try {
        const userProfile = await AuthService.getUserProfile(user.uid);
        if (userProfile) {
          setProfile({
            ...userProfile,
            email: userProfile.email || user.email,
            name: userProfile.name || user.displayName,
          });
        }
      } catch (error) {
        console.error("Error refreshing user profile:", error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthenticated: !!user, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
