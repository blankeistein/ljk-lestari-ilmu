import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, ClipboardList } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HeadmasterDashboard() {
  const { profile } = useAuth();
  const [totalTeacher, setTotalTeacher] = useState<number | null>(null);
  const [totalLjk, setTotalLjk] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.schoolId) {
      return;
    }

    // Listen to analytics details
    const unsubscribeAnalytics = onSnapshot(doc(db, "analytic_by_school", profile.schoolId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTotalTeacher(data.totalTeacher || 0);
        setTotalLjk(data.totalLJK || 0);
      } else {
        setTotalTeacher(0);
        setTotalLjk(0);
      }

      setLoading(false)
    }, (error) => {
      console.error("Error fetching school analytics:", error);
      setLoading(false)
    });

    return () => {
      unsubscribeAnalytics();
    };
  }, [profile?.schoolId]);

  console.log(profile?.schoolId)

  // Derived loading state
  const isDashboardLoading = loading && !!profile?.schoolId;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Kepala Sekolah</h1>
        <p className="text-muted-foreground">
          Statistik dan pengawasan
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Guru
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{totalTeacher?.toLocaleString() || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Guru aktif terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              LJK Terverifikasi
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{totalLjk?.toLocaleString() || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Data hasil ujian masuk
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ringkasan Sekolah</CardTitle>
            <CardDescription>
              Detail informasi operasional sekolah Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Kode Sekolah</p>
                  <p className="text-lg font-mono font-bold">{profile?.schoolId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500" />
                    <p className="text-sm font-medium">Terverifikasi</p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Dashboard ini memberikan ringkasan data guru dan aktivitas ujian yang sedang berlangsung di sekolah Anda.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
