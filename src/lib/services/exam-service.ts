import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  where,
  limit,
} from "firebase/firestore";
import type { Exam, Grade, Subject } from "@/types/exam";

export const ExamService = {
  async getExams(): Promise<Exam[]> {
    const examsRef = collection(db, "exams");
    const q = query(examsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Exam));
  },

  async getReportExams(limitCount: number = 20): Promise<Exam[]> {
    const examsRef = collection(db, "exams");
    const q = query(
      examsRef,
      where("status", "in", ["active", "closed"]),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Exam));
  },

  async getExamById(id: string): Promise<Exam> {
    const docRef = doc(db, "exams", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Ujian tidak ditemukan");
    }
    return { id: docSnap.id, ...docSnap.data() } as Exam;
  },

  async createExam(data: Omit<Exam, "id" | "createdAt">): Promise<string> {
    const examsRef = collection(db, "exams");
    const docRef = await addDoc(examsRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateExam(id: string, data: Partial<Omit<Exam, "id">>): Promise<void> {
    const docRef = doc(db, "exams", id);
    await updateDoc(docRef, data);
  },

  async deleteExam(id: string): Promise<void> {
    const docRef = doc(db, "exams", id);
    await deleteDoc(docRef);
  },

  // Grade Management
  async getGrades(examId: string): Promise<Grade[]> {
    const gradesRef = collection(db, "exams", examId, "grades");
    const snapshot = await getDocs(gradesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
  },

  async createGrade(examId: string, data: Grade): Promise<void> {
    const docRef = doc(db, "exams", examId, "grades", data.id);
    await setDoc(docRef, { id: data.id, name: data.name });
  },

  async deleteGrade(examId: string, gradeId: string): Promise<void> {
    const docRef = doc(db, "exams", examId, "grades", gradeId);
    await deleteDoc(docRef);
  },

  // Subject Management
  async getSubjects(examId: string, gradeId: string): Promise<Subject[]> {
    const subjectsRef = collection(db, "exams", examId, "grades", gradeId, "subjects");
    const snapshot = await getDocs(subjectsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
  },

  async createSubject(examId: string, gradeId: string, data: Subject): Promise<void> {
    const docRef = doc(db, "exams", examId, "grades", gradeId, "subjects", data.id);
    await setDoc(docRef, {
      id: data.id,
      name: data.name,
      layout: data.layout,
      answerKey: data.answerKey
    });
  },

  async updateSubject(examId: string, gradeId: string, subjectId: string, data: Partial<Omit<Subject, "id">>): Promise<void> {
    const docRef = doc(db, "exams", examId, "grades", gradeId, "subjects", subjectId);
    await updateDoc(docRef, data);
  },

  async deleteSubject(examId: string, gradeId: string, subjectId: string): Promise<void> {
    const docRef = doc(db, "exams", examId, "grades", gradeId, "subjects", subjectId);
    await deleteDoc(docRef);
  },

  // Real-time Subscriptions
  subscribeExam(id: string, callback: (exam: Exam | null) => void) {
    const docRef = doc(db, "exams", id);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as Exam);
      } else {
        callback(null);
      }
    });
  },

  subscribeGrades(examId: string, callback: (grades: Grade[]) => void) {
    const gradesRef = collection(db, "exams", examId, "grades");
    return onSnapshot(gradesRef, (snapshot) => {
      const grades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
      callback(grades);
    });
  },

  subscribeSubjects(examId: string, gradeId: string, callback: (subjects: Subject[]) => void) {
    const subjectsRef = collection(db, "exams", examId, "grades", gradeId, "subjects");
    return onSnapshot(subjectsRef, (snapshot) => {
      const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
      callback(subjects);
    });
  },

  async getAnswers(examId: string, filters: { uploadedBy: string; gradeId: string; subjectId: string }): Promise<import("@/types/exam").ExamAnswer[]> {
    const answersRef = collection(db, "exams", examId, "answers");
    const q = query(
      answersRef,
      where("uploadedBy", "==", filters.uploadedBy),
      where("gradeId", "==", filters.gradeId),
      where("subjectId", "==", filters.subjectId),
      orderBy("uploadedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as import("@/types/exam").ExamAnswer));
  },

  async getGradeSubjectStats(examId: string, schoolId: string, gradeId: string, subjectId: string): Promise<import("@/types/exam").GradeSubjectStats | null> {
    const docRef = doc(
      db,
      "exams", examId,
      "stats_per_school", schoolId,
      "perGradeSubject", `${gradeId}_${subjectId}`
    );
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as import("@/types/exam").GradeSubjectStats;
    }
    return null;
  },
};
