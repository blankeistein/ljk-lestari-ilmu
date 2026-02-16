import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import type { ErrorReport } from "@/types/error-report";

export const ErrorReportService = {
  async reportError(error: Error | string, metadata?: Record<string, unknown>) {
    try {
      const message = typeof error === 'string' ? error : error.message;
      const stack = error instanceof Error ? error.stack : undefined;

      const currentUser = auth.currentUser;

      const report: ErrorReport = {
        message,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: serverTimestamp(),
        status: 'pending',
      };

      if (stack) report.stack = stack;
      if (currentUser?.uid) report.userId = currentUser.uid;
      if (currentUser?.email) report.userEmail = currentUser.email;
      if (metadata) report.metadata = metadata;

      console.log("Sending report to Firestore:", report);

      const docRef = await addDoc(collection(db, "error_reports"), report);
      return docRef.id;
    } catch (err) {
      console.error("Failed to report error to Firestore:", err);
      return null;
    }
  },

  async updateReportStatus(reportId: string, status: ErrorReport['status']) {
    try {
      const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore");
      const reportRef = doc(db, "error_reports", reportId);

      const updateData: { status: ErrorReport['status']; resolvedAt?: unknown } = { status };
      if (status === 'resolved') {
        updateData.resolvedAt = serverTimestamp();
      }

      await updateDoc(reportRef, updateData);
    } catch (err) {
      console.error("Failed to update report status:", err);
      throw err;
    }
  },

  async fetchReports(limitCount: number = 20, lastVisible?: unknown) {
    try {
      const { getDocs, query, orderBy, limit, startAfter } = await import("firebase/firestore");

      let q = query(
        collection(db, "error_reports"),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const querySnapshot = await getDocs(q);
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      const reports = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ErrorReport[];

      return { reports, lastDoc };
    } catch (err) {
      console.error("Failed to fetch error reports:", err);
      throw err;
    }
  }
};
