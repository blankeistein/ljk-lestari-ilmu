import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export type Status = "loading" | "online" | "offline";

export function useServerStatus() {
  const [firestoreStatus, setFirestoreStatus] = useState<Status>("loading");
  const [storageStatus, setStorageStatus] = useState<Status>("loading");
  const [functionsStatus, setFunctionsStatus] = useState<Status>("loading");

  useEffect(() => {
    // 1. Initial check
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      const status: Status = isOnline ? "online" : "offline";
      setFirestoreStatus(status);
      setStorageStatus(status);
      setFunctionsStatus(status);
    };

    updateStatus();

    // 2. Listen to browser online/offline events
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    // 3. Firestore Heartbeat (Optional but more accurate)
    // We can listen to a doc that we know exists (analytics/dashboard_admin)
    // and check the metadata to see if it's from cache or server
    const unsubscribe = onSnapshot(
      doc(db, "analytics", "dashboard_admin"),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!snapshot.metadata.fromCache) {
          setFirestoreStatus("online");
        }
      },
      (error) => {
        console.error("Firestore connectivity error:", error);
        setFirestoreStatus("offline");
      }
    );

    return () => {
      unsubscribe();
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return { firestoreStatus, storageStatus, functionsStatus };
}
