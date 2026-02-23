import { functions, db } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  limit,
  addDoc,
  where,
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
    let examName = "";
    if (!targetExamId) {
      const examsQuery = query(collection(db, "exams"), limit(1));
      const examsSnap = await getDocs(examsQuery);
      if (examsSnap.empty) {
        throw new Error("Tidak ada ujian yang ditemukan. Buat ujian terlebih dahulu.");
      }
      const examDoc = examsSnap.docs[0];
      targetExamId = examDoc.id;
      examName = examDoc.data().name || "Ujian Mock";
    } else {
      const examSnap = await getDoc(doc(db, "exams", targetExamId));
      if (examSnap.exists()) {
        examName = examSnap.data().name || "Ujian Mock";
      }
    }

    // 2. Get Grade
    let targetGradeId = gradeId;
    let gradeName = "";
    if (!targetGradeId) {
      const gradesRef = collection(db, "exams", targetExamId, "grades");
      const gradesSnap = await getDocs(gradesRef);
      if (gradesSnap.empty) {
        throw new Error("Ujian ini tidak memiliki kelas. Tambahkan kelas terlebih dahulu.");
      }
      const gradeDoc = gradesSnap.docs[0];
      targetGradeId = gradeDoc.id;
      gradeName = gradeDoc.data().name || "Kelas Mock";
    } else {
      const gradeSnap = await getDoc(doc(db, "exams", targetExamId, "grades", targetGradeId));
      if (gradeSnap.exists()) {
        gradeName = gradeSnap.data().name || "Kelas Mock";
      }
    }

    // 3. Get Subject
    let targetSubjectId = subjectId;
    let subjectName = "";
    let subjectLayout = 50; // Default
    let answerKey: Record<string, string> = {};

    if (!targetSubjectId) {
      const subjectsRef = collection(db, "exams", targetExamId, "grades", targetGradeId, "subjects");
      const subjectsSnap = await getDocs(subjectsRef);
      if (subjectsSnap.empty) {
        throw new Error("Ujian/Kelas ini tidak memiliki mata pelajaran. Tambahkan mata pelajaran terlebih dahulu.");
      }
      const subjectDoc = subjectsSnap.docs[0];
      targetSubjectId = subjectDoc.id;
      const subData = subjectDoc.data();
      subjectName = subData.name || "Mata Pelajaran Mock";
      subjectLayout = parseInt(subData.layout || "50");
      answerKey = subData.answerKey || {};
    } else {
      const subjectRef = doc(db, "exams", targetExamId, "grades", targetGradeId, "subjects", targetSubjectId);
      const subjectSnap = await getDoc(subjectRef);
      if (subjectSnap.exists()) {
        const subData = subjectSnap.data();
        subjectName = subData.name || "Mata Pelajaran Mock";
        subjectLayout = parseInt(subData.layout || "50");
        answerKey = subData.answerKey || {};
      }
    }

    // Use provided schoolId or default to a dummy one if not provided (though page will require it)
    const targetSchoolId = schoolId || "dummy-school-id";

    // 4. Determine UploadedBy (Teacher)
    let targetUploadedBy = uploadedBy;
    if (targetUploadedBy === "random") {
      const teachersRef = collection(db, "users");
      const q = query(teachersRef, where("role", "==", "teacher"), where("schoolId", "==", targetSchoolId));
      const teachersSnap = await getDocs(q);
      if (!teachersSnap.empty) {
        const randomTeacherDoc = teachersSnap.docs[Math.floor(Math.random() * teachersSnap.docs.length)];
        targetUploadedBy = randomTeacherDoc.id;
      } else {
        targetUploadedBy = auth.currentUser ? auth.currentUser.uid : "dummy-admin-id";
      }
    } else if (!targetUploadedBy) {
      targetUploadedBy = auth.currentUser ? auth.currentUser.uid : "dummy-admin-id";
    }

    // 4. Generate Answers
    const answersRef = collection(db, "exams", targetExamId, "answers");

    const promises = [];
    const options = ["A", "B", "C", "D", "E"];
    const indonesianNames = [
      "Budi Santoso", "Siti Aminah", "Agus Setiawan", "Dewi Lestari", "Iwan Fals",
      "Rina Mutia", "Joko Widodo", "Ani Yudhoyono", "Eko Prasetyo", "Linda Wati",
      "Hadi Saputra", "Maya Sari", "Andi Wijaya", "Rizky Pratama", "Dian Sastro",
      "Guntur Bumi", "Sari Indah", "Fajar Ramadhan", "Putri Ayu", "Kevin Sanjaya"
    ];

    for (let i = 0; i < count; i++) {
      const sequenceNo = (i + 1).toString().padStart(3, '0');
      const studentNo = `2024${sequenceNo}`;
      const baseName = indonesianNames[i % indonesianNames.length];
      const studentName = `${baseName} - ${i + 1}`;

      // Generate random answers based on subject layout and answer key
      const studentAnswers: Record<string, { selected: string; isCorrect: boolean }> = {};
      let correctCount = 0;
      let wrongCount = 0;
      let blankCount = 0;

      for (let q = 1; q <= subjectLayout; q++) {
        const qStr = q.toString();
        const correctAnswer = answerKey[qStr];

        const isAnswered = Math.random() > 0.05; // 5% chance blank
        if (!isAnswered) {
          blankCount++;
          continue;
        }

        // Logic: 70% chance to be correct if key exists, otherwise total random
        const shouldBeCorrect = correctAnswer ? Math.random() > 0.3 : Math.random() > 0.5;

        let selected = "";
        if (shouldBeCorrect && correctAnswer) {
          selected = correctAnswer;
        } else {
          // Select wrong answer (randomize until not key)
          const wrongOptions = correctAnswer ? options.filter(o => o !== correctAnswer) : options;
          selected = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        }

        const isCorrect = selected === correctAnswer;

        studentAnswers[qStr] = {
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
        photoUrl: `https://placehold.co/600x400?text=${encodeURIComponent(studentName)}`,
        uploadedBy: targetUploadedBy,
        uploadedAt: serverTimestamp(),
        isDummy: true // Flag to identify dummy data
      };

      promises.push(addDoc(answersRef, data));
    }

    await Promise.all(promises);

    // 5. Create History Entry for the User
    if (targetUploadedBy && targetUploadedBy !== "dummy-admin-id") {
      const userExamsRef = collection(db, "users", targetUploadedBy, "exams");
      await addDoc(userExamsRef, {
        referenceExamId: targetExamId,
        name: examName,
        subject: subjectName,
        subjectId: targetSubjectId,
        grade: gradeName,
        gradeId: targetGradeId,
        createdAt: serverTimestamp(),
      });
    }

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
