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

export interface UserExam {
  id: string; // autoGenerateId
  referenceExamId: string;
  name: string;
  subject: string;
  subjectId: string;
  grade: string;
  gradeId: string;
  createdAt: Timestamp;
}
