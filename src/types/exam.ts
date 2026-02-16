import { Timestamp } from "firebase/firestore";

export type ExamStatus = "draft" | "active" | "closed";

export interface Exam {
  id: string;
  name: string;
  createdAt: Timestamp;
  status: ExamStatus;
}

export interface Grade {
  id: string; // e.g., "kelas-1"
  name: string; // e.g., "Kelas 1"
}

export type SubjectLayout = "20" | "25" | "30" | "35" | "50";

export interface Subject {
  id: string; // e.g., "matematika"
  name: string; // e.g., "Matematika"
  layout: SubjectLayout;
  answerKey: Record<string, string>; // e.g., {"1": "A", "2": "B", ...}
}

export interface ExamAnswer {
  id: string;
  studentNo: string;
  studentName: string;
  gradeId: string;
  subjectId: string;
  schoolId: string;
  correct: number;
  wrong: number;
  blank: number;
  studentAnswers: Record<string, { selected: string; isCorrect: boolean }>;
  photoUrl: string;
  uploadedBy: string;
  uploadedAt: Timestamp;
  isDummy?: boolean;
}
