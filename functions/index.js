const { setGlobalOptions } = require("firebase-functions");
const { onDocumentCreated } = require("firebase-functions/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { getRemoteConfig } = require("firebase-admin/remote-config");

// Initialize Firebase Admin
initializeApp();

setGlobalOptions({
  maxInstances: 10,
  region: "us-central1"
});

/**
 * Triggered when a new user is created in the "users" collection.
 * Increments the total user count in analytics and tracks user growth.
 */
exports.onUserCreatedAnalytics = onDocumentCreated("users/{userId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.info("No data associated with the event");
    return;
  }

  const db = getFirestore();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    const dashboardRef = db.collection("analytics").doc("dashboard_admin");
    const growthDocRef = dashboardRef.collection("user_growth").doc(today);

    await db.runTransaction(async (transaction) => {
      // 1. Update total_user in dashboard
      transaction.set(dashboardRef, {
        total_user: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });

      // 2. Update growth document for today
      transaction.set(growthDocRef, {
        count: FieldValue.increment(1),
        date: today,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    });

    logger.info(`Analytics updated for user ${event.params.userId}`);
  } catch (error) {
    logger.error("Error updating user creation analytics:", error);
  }
});

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
  const { examId } = event.params;
  const snapshot = event.data;
  if (!snapshot) {
    logger.info("No data associated with the event");
    return;
  }

  const data = snapshot.data();
  const { schoolId, gradeId, subjectId, studentAnswers } = data;

  if (schoolId && gradeId && subjectId) {
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
      logger.info("Updating analytics exam school:", schoolId);
      await analyticRef.set(updatePayload, { merge: true });
    } catch (error) {
      logger.error("Error updating analytics exam school:", error);
    }
  }
});
/**
 * Callable function to update a user's role.
 * Only reachable by authenticated users with "admin" role.
 */
exports.updateUserRole = onCall({ enforceAppCheck: true }, async (request) => {
  // 1. Check if authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Request must be authenticated.");
  }

  const { targetUid, newRole } = request.data;

  // 2. Validate input
  if (!targetUid || !newRole) {
    throw new HttpsError("invalid-argument", "Missing targetUid or newRole.");
  }

  const allowedRoles = ["admin", "teacher", "headmaster"];
  if (!allowedRoles.includes(newRole)) {
    throw new HttpsError("invalid-argument", "Invalid role specified.");
  }

  const db = getFirestore();

  // 3. Check if requester is admin
  // We check the Firestore document for the role
  const requesterDoc = await db.collection("users").doc(request.auth.uid).get();
  const requesterData = requesterDoc.data();

  if (!requesterData || requesterData.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can change roles.");
  }

  try {
    // 4. Update user document in Firestore
    await db.collection("users").doc(targetUid).update({
      role: newRole,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 5. Update Custom Claims in Auth (optional but recommended for security)
    await mergeClaims(targetUid, { role: newRole });

    return {
      success: true,
      message: `Role for user ${targetUid} updated to ${newRole}`
    };
  } catch (error) {
    logger.error("Error updating user role:", error);
    throw new HttpsError("internal", "Failed to update user role.");
  }
});

/**
 * Callable function to create a new user with Auth and Firestore.
 */
exports.createUser = onCall({ enforceAppCheck: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Request must be authenticated.");
  }

  const { email, password, name, role } = request.data;
  if (!email || !password || !name || !role) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }

  const db = getFirestore();
  const requesterDoc = await db.collection("users").doc(request.auth.uid).get();
  if (requesterDoc.data()?.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can create users.");
  }

  try {
    // 1. Create Auth User
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Set Claims
    await getAuth().setCustomUserClaims(userRecord.uid, { role });

    // 3. Create Firestore Doc
    await db.collection("users").doc(userRecord.uid).set({
      name,
      email,
      role,
      createdAt: FieldValue.serverTimestamp(),
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userRecord.uid}`,
    });

    return { success: true, uid: userRecord.uid };
  } catch (error) {
    logger.error("Error creating user:", error);
    throw new HttpsError("internal", error.message);
  }
});

/**
 * Callable function to generate multiple mock users with Auth.
 */
exports.generateMockUsers = onCall({ enforceAppCheck: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Request must be authenticated.");
  }

  const { count, role } = request.data;
  const db = getFirestore();
  const requesterDoc = await db.collection("users").doc(request.auth.uid).get();
  if (requesterDoc.data()?.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can generate users.");
  }

  const firstNames = ["Budi", "Siti", "Agus", "Dewi", "Eko", "Ani", "Bambang", "Rina"];
  const lastNames = ["Santoso", "Wijaya", "Saputra", "Lestari", "Kusuma", "Hidayat"];
  const results = [];

  for (let i = 0; i < count; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}.${Math.floor(Math.random() * 10000)}@example.com`;
    const password = "password123";

    try {
      const userRecord = await getAuth().createUser({ email, password, displayName: name });
      await getAuth().setCustomUserClaims(userRecord.uid, { role });
      await db.collection("users").doc(userRecord.uid).set({
        name,
        email,
        role,
        createdAt: FieldValue.serverTimestamp(),
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userRecord.uid}`,
      });
      results.push(userRecord.uid);
    } catch (e) {
      logger.error("Error generating mock user:", e);
    }
  }

  return { success: true, count: results.length };
});

/**
 * Callable function to delete a user from both Auth and Firestore.
 */
exports.deleteUser = onCall({ enforceAppCheck: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Request must be authenticated.");
  }

  const { targetUid } = request.data;
  if (!targetUid) {
    throw new HttpsError("invalid-argument", "Missing targetUid.");
  }

  if (request.auth.uid === targetUid) {
    throw new HttpsError("permission-denied", "You cannot delete yourself.");
  }

  const db = getFirestore();
  const requesterDoc = await db.collection("users").doc(request.auth.uid).get();
  if (requesterDoc.data()?.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can delete users.");
  }

  try {
    // 1. Delete from Auth
    await getAuth().deleteUser(targetUid);

    // 2. Delete from Firestore
    await db.collection("users").doc(targetUid).delete();

    return { success: true };
  } catch (error) {
    logger.error("Error deleting user:", error);
    throw new HttpsError("internal", error.message);
  }
});


async function mergeClaims(uid, newClaims) {
  const auth = getAuth();

  try {
    // 1️⃣ Ambil user & claims yang ada saat ini
    const user = await auth.getUser(uid);
    const existingClaims = user.customClaims || {};

    // 2️⃣ Gabungkan (Merge) menggunakan Spread Operator (...)
    const updatedClaims = { ...existingClaims, ...newClaims };

    // 3️⃣ Simpan kembali hasil gabungannya
    await auth.setCustomUserClaims(uid, updatedClaims);

  } catch (error) {
    logger.error("failed update claims:", error);
  }
}

/**
 * Get current App Settings from Remote Config.
 */
exports.getAppSettings = onCall({ enforceAppCheck: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Request must be authenticated.");
  }

  const db = getFirestore();
  const requesterDoc = await db.collection("users").doc(request.auth.uid).get();
  if (requesterDoc.data()?.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can view app settings.");
  }

  try {
    const template = await getRemoteConfig().getTemplate();
    const config = {
      privacy_policy_url: template.parameters.privacy_policy_url?.defaultValue?.value || "",
      help_url: template.parameters.help_url?.defaultValue?.value || "",
    };
    return config;
  } catch (error) {
    logger.error("Error fetching remote config:", error);
    throw new HttpsError("internal", error.message);
  }
});

/**
 * Update App Settings in Remote Config.
 */
exports.updateAppSettings = onCall({ enforceAppCheck: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Request must be authenticated.");
  }

  const { privacy_policy_url, help_url } = request.data;
  const db = getFirestore();
  const requesterDoc = await db.collection("users").doc(request.auth.uid).get();
  if (requesterDoc.data()?.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can update app settings.");
  }

  try {
    const rc = getRemoteConfig();
    const template = await rc.getTemplate();

    // Update or add parameters
    template.parameters.privacy_policy_url = {
      defaultValue: { value: privacy_policy_url },
    };
    template.parameters.help_url = {
      defaultValue: { value: help_url },
    };

    await rc.publishTemplate(template);
    return { success: true };
  } catch (error) {
    logger.error("Error updating remote config:", error);
    throw new HttpsError("internal", error.message);
  }
});


/**
 * Triggered when a new answer is submitted in an exam.
 * Increments the total LJK count in analytics/dashboard_admin.
 */
exports.onAnswerCreatedAnalytics = onDocumentCreated("exams/{ulanganId}/answers/{answerId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.info("No data associated with the event");
    return;
  }

  const db = getFirestore();
  const dashboardRef = db.collection("analytics").doc("dashboard_admin");

  try {
    await dashboardRef.set({
      total_ljk: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

  } catch (error) {
    logger.error("Error updating answer analytics:", error);
  }
});