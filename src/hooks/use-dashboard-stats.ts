import { useState, useEffect } from "react";
import { doc, onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface GrowthData {
  name: string;
  total: number;
}

export function useDashboardStats() {
  const [totalUser, setTotalUser] = useState<number>(0);
  const [totalLjk, setTotalLjk] = useState<number>(0);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [loading, setLoading] = useState(true);

  // Dummy data for fallback
  const dummyGrowthData = [
    { name: "Jan", total: 1200 },
    { name: "Feb", total: 2100 },
    { name: "Mar", total: 1800 },
    { name: "Apr", total: 2400 },
  ];

  useEffect(() => {
    // 1. Listen to total users and total ljk
    const unsubscribeTotal = onSnapshot(doc(db, "analytics", "dashboard_admin"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setTotalUser(data.total_user || 0);
        setTotalLjk(data.total_ljk || 0);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to dashboard stats:", error);
      setLoading(false);
    });

    // 2. Listen to user growth (last 7 days)
    const growthQuery = query(
      collection(db, "analytics", "dashboard_admin", "user_growth"),
      orderBy("date", "desc"),
      limit(7)
    );

    const unsubscribeGrowth = onSnapshot(growthQuery, (snapshot) => {
      const sortedData = snapshot.docs
        .map(doc => ({
          name: new Date(doc.data().date).toLocaleDateString('id-ID', { weekday: 'short' }),
          total: doc.data().count || 0
        }))
        .reverse();

      setGrowthData(sortedData);
    });

    return () => {
      unsubscribeTotal();
      unsubscribeGrowth();
    };
  }, []);

  return {
    totalUser,
    totalLjk,
    growthData: growthData.length > 0 ? growthData : dummyGrowthData,
    loading
  };
}
