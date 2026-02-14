import type { Timestamp } from "firebase/firestore";

export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  teacher: "Guru",
  headmaster: "Kepala Sekolah",
  user: "User",
};

export interface UserProfile {
  uid: string;
  email: string | null;
  role: string;
  name: string | null;
  photoUrl: string | null;
  createdAt?: Timestamp;
}
