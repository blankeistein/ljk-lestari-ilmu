import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, Clock, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/auth-context";

export const Dashboard = () => {
  const { profile } = useAuth();
  const isTeacher = profile?.role === "teacher";

  const stats = [
    {
      title: isTeacher ? "Total Ujian" : "Ujian Selesai",
      value: "12",
      icon: BookOpen,
      desc: isTeacher ? "Ujian yang telah dibuat" : "Ujian yang telah Anda kerjakan",
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: isTeacher ? "Siswa Terdaftar" : "Rerata Nilai",
      value: isTeacher ? "156" : "85.5",
      icon: isTeacher ? Calendar : Trophy,
      desc: isTeacher ? "Siswa di kelas Anda" : "Berdasarkan ujian terakhir",
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Waktu Aktif",
      value: "4.2j",
      icon: Clock,
      desc: "Penggunaan minggu ini",
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Selamat Datang, {profile?.name || "User"}! 👋</h1>
        <p className="text-muted-foreground">
          Berikut adalah ringkasan aktivitas Anda.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const AdminPanel = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
    <Card>
      <CardHeader>
        <CardTitle>Statistik Sistem</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Gunakan sidebar untuk mengelola sistem.</p>
      </CardContent>
    </Card>
  </div>
);
