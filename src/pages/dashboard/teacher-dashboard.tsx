import { useState, useEffect } from "react";
import {
  BookOpen,
  History,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  ArrowUpRight,
  FileText,
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { UserService } from "@/lib/services/user-service";
import type { UserExam } from "@/types/user";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<UserExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!profile?.uid) return;
      try {
        setLoading(true);
        const data = await UserService.fetchUserExams(profile.uid);
        setExams(data);
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [profile?.uid]);

  const stats = [
    {
      title: "Total Sesi Scan",
      value: exams.length.toString(),
      description: "Jumlah riwayat scan ujian",
      icon: History,
      color: "text-blue-600",
      bg: "bg-blue-100/50 dark:bg-blue-900/20",
      trend: "+2 minggu ini",
    },
    {
      title: "Mata Pelajaran",
      value: new Set(exams.map(e => e.subjectId)).size.toString(),
      description: "Bidang studi aktif",
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-100/50 dark:bg-emerald-900/20",
      trend: "Aktif",
    },
    {
      title: "Estimasi LJK",
      value: (exams.length * 30).toString(), // Dummy multiplier for demo
      description: "Total lembar terpindai",
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-100/50 dark:bg-amber-900/20",
      trend: "+120 bulan ini",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8" />
            Dashboard Guru
          </h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang kembali, <span className="font-semibold text-foreground">{profile?.name}</span>. 👋
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hari Ini</span>
            <span className="text-sm font-bold">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <Button onClick={() => navigate("/dashboard/history")} className="shadow-lg shadow-primary/20 transition-all hover:scale-105">
            <TrendingUp className="mr-2 h-4 w-4" />
            Mulai Scan Baru
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-none shadow-md ring-1 ring-primary/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat) => (
            <Card key={stat.title} className="border-none shadow-md ring-1 ring-primary/5 group hover:ring-primary/20 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-black tracking-tight">{stat.value}</div>
                  <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/5 text-primary">
                    {stat.trend}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium italic">{stat.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Lower Section */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="lg:col-span-4 border-none shadow-xl ring-1 ring-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Aktivitas Terakhir</CardTitle>
                <CardDescription>Ringkasan 5 sesi scan terbaru Anda</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/history")} className="text-primary font-bold hover:bg-primary/5">
                Lihat Semua
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : exams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                <Clock className="h-12 w-12 mb-4" />
                <p className="font-semibold">Belum ada aktivitas</p>
                <p className="text-sm">Data scan akan muncul di sini setelah Anda memulai.</p>
              </div>
            ) : (
              exams.slice(0, 5).map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-all border border-transparent hover:border-primary/10 group cursor-pointer"
                  onClick={() => navigate(`/dashboard/history/${exam.referenceExamId}/${exam.gradeId}/${exam.subjectId}`, { state: { exam } })}
                >
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{exam.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">{exam.subject} • {exam.grade}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{formatDate(exam.createdAt)}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Help / Info */}
        <Card className="lg:col-span-3 border-none shadow-xl ring-1 ring-primary/5 bg-linear-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Panduan Cepat</CardTitle>
            <CardDescription>Maksimalkan penggunaan aplikasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="size-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Kelola Kelas</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Pastikan data siswa telah diperbarui oleh admin untuk keakuratan identifikasi LJK.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="size-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Sesi Ujian</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Sesi scan diatur per mata pelajaran dan kelas agar analisis hasil lebih terstruktur.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-primary text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 size-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <h4 className="font-bold mb-2">Butuh Bantuan?</h4>
              <p className="text-xs text-primary-foreground/80 mb-4 leading-relaxed">
                Tim dukungan kami siap membantu Anda jika menemukan kendala teknis saat memproses LJK.
              </p>
              <Button variant="secondary" size="sm" className="w-full font-bold">
                Hubungi Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
