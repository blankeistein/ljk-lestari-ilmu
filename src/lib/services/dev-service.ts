import { functions, db } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import {
  collection,
  getDocs,
  query,
  limit,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { auth } from "@/lib/firebase"; // Import auth to get current user

export const DevService = {
  async generateMockUsers(count: number, role: string = "user"): Promise<{ success: boolean; count: number }> {
    const generateFn = httpsCallable<{ count: number; role: string }, { success: boolean; count: number }>(
      functions,
      "generateMockUsers"
    );
    const result = await generateFn({ count, role });
    return result.data;
  },

  async generateMockAnswers(
    count: number,
    examId?: string,
    schoolId?: string,
    gradeId?: string,
    subjectId?: string,
    uploadedBy?: string
  ): Promise<{ success: boolean; count: number }> {
    // 1. Get Exam
    let targetExamId = examId;
    if (!targetExamId) {
      const examsQuery = query(collection(db, "exams"), limit(1));
      const examsSnap = await getDocs(examsQuery);
      if (examsSnap.empty) {
        throw new Error("Tidak ada ujian yang ditemukan. Buat ujian terlebih dahulu.");
      }
      targetExamId = examsSnap.docs[0].id;
    }

    // 2. Get Grade
    let targetGradeId = gradeId;
    if (!targetGradeId) {
      const gradesRef = collection(db, "exams", targetExamId, "grades");
      const gradesSnap = await getDocs(gradesRef);
      if (gradesSnap.empty) {
        throw new Error("Ujian ini tidak memiliki kelas. Tambahkan kelas terlebih dahulu.");
      }
      targetGradeId = gradesSnap.docs[0].id;
    }

    // 3. Get Subject
    let targetSubjectId = subjectId;
    if (!targetSubjectId) {
      const subjectsRef = collection(db, "exams", targetExamId, "grades", targetGradeId, "subjects");
      const subjectsSnap = await getDocs(subjectsRef);
      if (subjectsSnap.empty) {
        throw new Error("Ujian/Kelas ini tidak memiliki mata pelajaran. Tambahkan mata pelajaran terlebih dahulu.");
      }
      targetSubjectId = subjectsSnap.docs[0].id;
    }

    // Use provided schoolId or default to a dummy one if not provided (though page will require it)
    const targetSchoolId = schoolId || "dummy-school-id";

    // 4. Generate Answers
    const answersRef = collection(db, "exams", targetExamId, "answers");

    // Get current user UID for uploadedBy if not provided
    const targetUploadedBy = uploadedBy || (auth.currentUser ? auth.currentUser.uid : "dummy-admin-id");

    const promises = [];
    const options = ["A", "B", "C", "D", "E"];

    for (let i = 0; i < count; i++) {
      const studentNo = (Math.floor(Math.random() * 1000) + 1).toString();
      const studentName = `Siswa Dummy ${Math.floor(Math.random() * 1000)}`;

      // Generate random answers for 50 questions
      const studentAnswers: Record<string, { selected: string; isCorrect: boolean }> = {};
      let correctCount = 0;
      let wrongCount = 0;
      let blankCount = 0;

      for (let q = 1; q <= 50; q++) {
        const isAnswered = Math.random() > 0.1; // 10% chance blank
        if (!isAnswered) {
          blankCount++;
          continue;
        }

        const selected = options[Math.floor(Math.random() * options.length)];
        const isCorrect = Math.random() > 0.5; // 50% chance correct

        studentAnswers[q.toString()] = {
          selected,
          isCorrect
        };

        if (isCorrect) correctCount++;
        else wrongCount++;
      }

      const data = {
        studentNo,
        studentName,
        gradeId: targetGradeId,
        subjectId: targetSubjectId,
        schoolId: targetSchoolId,
        correct: correctCount,
        wrong: wrongCount,
        blank: blankCount,
        studentAnswers,
        photoUrl: "https://placehold.co/600x400?text=LJK+Scan+Dummy",
        uploadedBy: targetUploadedBy,
        uploadedAt: serverTimestamp(),
        isDummy: true // Flag to identify dummy data
      };

      promises.push(addDoc(answersRef, data));
    }

    await Promise.all(promises);
    return { success: true, count };
  },

  async generateMockUserExams(userId: string, count: number): Promise<{ success: boolean; count: number }> {
    const userExamsRef = collection(db, "users", userId, "exams");

    // 1. Get available exams, subjects, and grades
    const examsSnap = await getDocs(query(collection(db, "exams"), limit(10)));
    if (examsSnap.empty) {
      throw new Error("Tidak ada master ujian ditemukan. Buat ujian terlebih dahulu.");
    }

    const promises = [];
    for (let i = 0; i < count; i++) {
      const randomExamDoc = examsSnap.docs[Math.floor(Math.random() * examsSnap.docs.length)];
      const examData = randomExamDoc.data();
      const examId = randomExamDoc.id;

      // Get random grade for this exam
      const gradesSnap = await getDocs(collection(db, "exams", examId, "grades"));
      if (gradesSnap.empty) continue;
      const randomGradeDoc = gradesSnap.docs[Math.floor(Math.random() * gradesSnap.docs.length)];
      const gradeData = randomGradeDoc.data();
      const gradeId = randomGradeDoc.id;

      // Get random subject for this grade
      const subjectsSnap = await getDocs(collection(db, "exams", examId, "grades", gradeId, "subjects"));
      if (subjectsSnap.empty) continue;
      const randomSubjectDoc = subjectsSnap.docs[Math.floor(Math.random() * subjectsSnap.docs.length)];
      const subjectData = randomSubjectDoc.data();
      const subjectId = randomSubjectDoc.id;

      const mockUserExam = {
        referenceExamId: examId,
        name: examData.name || "Ujian Mock",
        subject: subjectData.name || "Mata Pelajaran Mock",
        subjectId: subjectId,
        grade: gradeData.name || "Kelas Mock",
        gradeId: gradeId,
        createdAt: serverTimestamp(),
      };

      promises.push(addDoc(userExamsRef, mockUserExam));
    }

    await Promise.all(promises);
    return { success: true, count: promises.length };
  }
};
