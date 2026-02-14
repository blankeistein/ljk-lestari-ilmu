const { setGlobalOptions } = require("firebase-functions");
const { onDocumentCreated } = require("firebase-functions/firestore");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// Initialize Firebase Admin
initializeApp();

setGlobalOptions({ maxInstances: 10 });

/**
 * Triggered when a new user is created in the "users" collection.
 * Increments the total teacher count if the new user's role is "teacher".
 */
exports.addTotalTeacher = onDocumentCreated("users/{userId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.info("No data associated with the event");
    return;
  }

  const data = snapshot.data();

  // Check if the user role is "teacher" or "headmaster"
  const roles = ["teacher", "headmaster"];
  if (data && data.schoolId && roles.includes(data.role)) {
    const db = getFirestore();
    const schoolRef = db.collection("schools").doc(data.schoolId);

    try {
      await schoolRef.update({
        totalTeacher: FieldValue.increment(1),
      });
    } catch (error) {
      logger.error("Error incrementing total teacher count:", error);
    }
  }
});

exports.analyticExamSchool = onDocumentCreated("exams/{examId}/answers/{answerId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.info("No data associated with the event");
    return;
  }

  const data = snapshot.data();
  const { schoolId, gradeId, subjectId, studentAnswers } = data;
  const { examId } = event.params;

  if (data && schoolId && gradeId && subjectId) {
    const db = getFirestore();
    const perGradeSubject = `${gradeId}_${subjectId}`;
    const analyticRef = db.collection('exams')
      .doc(examId)
      .collection('stats_per_school')
      .doc(schoolId)
      .collection("perGradeSubject")
      .doc(perGradeSubject);

    const updatePayload = {
      totalAnswer: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    }

    Object.entries(studentAnswers).forEach(([questionId, answer]) => {
      const choice = answer.selected.trim();

      if (choice === "") {
        updatePayload[`detail.${questionId}.blank`] = FieldValue.increment(1);
      } else {
        updatePayload[`detail.${questionId}.choices.${choice}`] = FieldValue.increment(1);
        if (answer.isCorrect) {
          updatePayload[`detail.${questionId}.correct`] = FieldValue.increment(1);
        } else {
          updatePayload[`detail.${questionId}.incorrect`] = FieldValue.increment(1);
        }
      }
    })

    try {
      await analyticRef.set(updatePayload, { merge: true });
    } catch (error) {
      logger.error("Error updating analytics exam school:", error);
    }
  }
});